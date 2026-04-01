import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Consultar agendamentos do dia seguinte
    const tomorrowStart = new Date()
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)
    tomorrowStart.setHours(0, 0, 0, 0)
    
    const tomorrowEnd = new Date(tomorrowStart)
    tomorrowEnd.setHours(23, 59, 59, 999)

    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select(
        `id, data_hora, status, usuario_id, paciente_id, pacientes (id, nome, telefone), usuarios (id, lembrete_whatsapp_ativo, whatsapp_tipo)`
      )
      .in('status', ['agendado', 'confirmado'])
      .gte('data_hora', tomorrowStart.toISOString())
      .lte('data_hora', tomorrowEnd.toISOString())

    if (error) throw error

    const sentMessages = []
    const historyLogs = []

    for (const apt of agendamentos || []) {
      const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
      const u = Array.isArray(apt.usuarios) ? apt.usuarios[0] : apt.usuarios

      if (p?.telefone && u?.lembrete_whatsapp_ativo === true) {
        const d = new Date(apt.data_hora)
        const timeStr = d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
        
        const message = `Olá ${p.nome}, lembrando da sua sessão amanhã às ${timeStr}. Qualquer dúvida, entre em contato.`
        const cleanPhone = p.telefone.replace(/[^\d]/g, '')
        
        const tipo = u.whatsapp_tipo === 'personal' ? 'padrao' : (u.whatsapp_tipo || 'padrao')
        
        const { error: invokeErr } = await supabase.functions.invoke('enviar_mensagem_whatsapp', {
          body: {
            tipo_whatsapp: tipo,
            telefone: cleanPhone,
            mensagem: message,
            usuario_id: u.id
          }
        })

        if (!invokeErr) {
          sentMessages.push({ patient: p.nome, phone: p.telefone, time: timeStr, message })
          
          historyLogs.push({
            usuario_id: apt.usuario_id,
            paciente_id: apt.paciente_id,
            tipo: 'lembrete_whatsapp',
            conteudo: message,
            status_envio: 'enviado'
          })
        }
      }
    }

    if (historyLogs.length > 0) {
      await supabase.from('historico_mensagens').insert(historyLogs)
    }

    return new Response(
      JSON.stringify({ success: true, processed: sentMessages.length, details: sentMessages }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
