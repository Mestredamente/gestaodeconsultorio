import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Look for activities of type 'Reunião' starting in the next 30 to 45 mins
    const now = new Date()
    const startWindow = new Date(now.getTime() + 30 * 60 * 1000)
    const endWindow = new Date(now.getTime() + 45 * 60 * 1000)

    const { data: atividades, error } = await supabase
      .from('atividades')
      .select('id, titulo, data_agendada, responsavel_id, usuarios!atividades_responsavel_id_fkey(nome, email, lembrete_whatsapp_ativo, whatsapp_tipo, telefone_consultorio)')
      .eq('tipo', 'Reunião')
      .eq('status', 'Agendada')
      .gte('data_agendada', startWindow.toISOString())
      .lte('data_agendada', endWindow.toISOString())

    if (error) throw error

    const sentMessages = []
    const historyLogs = []

    for (const atv of atividades || []) {
      const u = Array.isArray(atv.usuarios) ? atv.usuarios[0] : atv.usuarios

      if (u?.telefone_consultorio && u?.lembrete_whatsapp_ativo === true) {
        const d = new Date(atv.data_agendada)
        const timeStr = d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })
        
        const message = `Lembrete Executivo: Sua reunião "${atv.titulo}" começará em aproximadamente 30 minutos, às ${timeStr}.`
        const cleanPhone = u.telefone_consultorio.replace(/[^\d]/g, '')
        
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
          sentMessages.push({ user: u.nome, phone: u.telefone_consultorio, time: timeStr, message })
          
          historyLogs.push({
            usuario_id: atv.responsavel_id,
            acao: 'Lembrete Reunião',
            tabela_afetada: 'atividades',
            registro_id: atv.id,
            detalhes: { message, status: 'enviado via whatsapp' }
          })
        }
      }
    }

    if (historyLogs.length > 0) {
      await supabase.from('logs_auditoria').insert(historyLogs)
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
