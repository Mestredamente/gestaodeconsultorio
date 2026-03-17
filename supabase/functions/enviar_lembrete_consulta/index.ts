import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    // Execute messages 24h ahead
    const startWindow = new Date(now.getTime() + 23.5 * 60 * 60 * 1000)
    const endWindow = new Date(now.getTime() + 24.5 * 60 * 60 * 1000)

    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select(
        `id, data_hora, status, pacientes (nome, telefone), usuarios (nome_consultorio, lembrete_whatsapp_ativo, template_lembrete)`,
      )
      .eq('status', 'agendado')
      .gte('data_hora', startWindow.toISOString())
      .lte('data_hora', endWindow.toISOString())

    if (error) throw error

    const sentMessages = []

    for (const apt of agendamentos || []) {
      const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
      const u = Array.isArray(apt.usuarios) ? apt.usuarios[0] : apt.usuarios

      if (p && u && u.lembrete_whatsapp_ativo && p.telefone) {
        const d = new Date(apt.data_hora)
        const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        const dateStr = d.toLocaleDateString('pt-BR')
        const template =
          u.template_lembrete || 'Olá [Nome], você tem uma consulta amanhã às [hora].'

        const message = template
          .replace(/\[Nome\]/gi, p.nome)
          .replace(/\[hora\]/gi, timeStr)
          .replace(/\[data\]/gi, dateStr)

        // Here a real API integration would go (Z-API, Twilio, Evolution API)
        console.log(`[Lembrete Sent] To: ${p.telefone} -> ${message}`)
        sentMessages.push({ patient: p.nome, phone: p.telefone, time: apt.data_hora, message })
      }
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
