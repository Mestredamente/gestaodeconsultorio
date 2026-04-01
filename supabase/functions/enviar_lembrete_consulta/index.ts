import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let query = supabase
      .from('agendamentos')
      .select(
        `id, data_hora, status, tipo_pagamento, usuario_id, paciente_id, pacientes (id, nome, telefone, hash_anamnese), usuarios (id, nome_consultorio, lembrete_whatsapp_ativo, template_lembrete, whatsapp_tipo)`
      )
      .eq('status', 'agendado')

    if (body.agendamento_id) {
      query = query.eq('id', body.agendamento_id)
    } else {
      const now = new Date()
      const startWindow = new Date(now.getTime() + 23.5 * 60 * 60 * 1000)
      const endWindow = new Date(now.getTime() + 24.5 * 60 * 60 * 1000)
      query = query
        .gte('data_hora', startWindow.toISOString())
        .lte('data_hora', endWindow.toISOString())
    }

    const { data: agendamentos, error } = await query

    if (error) throw error

    const sentMessages = []
    const sentApptIds = []
    const failedApptIds = []
    const historyLogs = []
    const reqUrl = new URL(req.url)
    const origin = req.headers.get('origin') || `${reqUrl.protocol}//${reqUrl.host}`

    for (const apt of agendamentos || []) {
      const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
      const u = Array.isArray(apt.usuarios) ? apt.usuarios[0] : apt.usuarios

      if (p && u && u.lembrete_whatsapp_ativo) {
        if (p.telefone) {
          const d = new Date(apt.data_hora)
          const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          const dateStr = d.toLocaleDateString('pt-BR')
          const template = u.template_lembrete || 'Olá [Nome], você tem uma consulta marcada às [hora].'
          const portalLink = `${origin}/portal/${p.hash_anamnese}`
          const confirmLink = `${origin}/confirmar/${p.hash_anamnese}/${apt.id}`

          let message = template
            .replace(/\[Nome\]/gi, p.nome)
            .replace(/\[hora\]/gi, timeStr)
            .replace(/\[data\]/gi, dateStr)
            .replace(/\[TipoSessao\]/gi, apt.tipo_pagamento || 'Consulta')
            .replace(/\[link_confirmacao\]/gi, confirmLink)
            .replace(/\[link_portal\]/gi, portalLink)

          const tipo = u.whatsapp_tipo === 'personal' ? 'padrao' : (u.whatsapp_tipo || 'padrao')

          const { error: invokeErr } = await supabase.functions.invoke('enviar_mensagem_whatsapp', {
            body: {
              tipo_whatsapp: tipo,
              telefone: p.telefone,
              mensagem: message,
              usuario_id: u.id
            }
          })

          if (!invokeErr) {
            console.log(`[Lembrete Sent API] To: ${p.telefone} -> ${message}`)
            sentMessages.push({ patient: p.nome, phone: p.telefone, time: apt.data_hora, message })
            sentApptIds.push(apt.id)
            
            historyLogs.push({
              usuario_id: apt.usuario_id,
              paciente_id: apt.paciente_id,
              tipo: 'lembrete',
              conteudo: message,
              status_envio: 'enviado'
            })
          } else {
            console.error(`[Lembrete Falhou] To: ${p.telefone}`, invokeErr)
            failedApptIds.push(apt.id)
          }

        } else {
          failedApptIds.push(apt.id)
        }
      }
    }

    if (historyLogs.length > 0) {
      await supabase.from('historico_mensagens').insert(historyLogs)
    }
    if (sentApptIds.length > 0) {
      await supabase
        .from('agendamentos')
        .update({ status_whatsapp_lembrete: 'enviado' })
        .in('id', sentApptIds)
    }
    if (failedApptIds.length > 0) {
      await supabase
        .from('agendamentos')
        .update({ status_whatsapp_lembrete: 'falha' })
        .in('id', failedApptIds)
    }

    return new Response(
      JSON.stringify({ success: true, processed: sentMessages.length, details: sentMessages }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
