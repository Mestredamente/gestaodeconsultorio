import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Requires Service Role to query scheduled jobs globally
    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date()
    // Look for appointments scheduled precisely 24 hours from now (using a 1-hour grace window to account for cron triggers)
    const startWindow = new Date(now.getTime() + 23.5 * 60 * 60 * 1000)
    const endWindow = new Date(now.getTime() + 24.5 * 60 * 60 * 1000)

    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select(`
        id, data_hora, status,
        pacientes (nome, email, telefone),
        usuarios (nome_consultorio)
      `)
      .eq('status', 'agendado')
      .gte('data_hora', startWindow.toISOString())
      .lte('data_hora', endWindow.toISOString())

    if (error) throw error

    const emailsSent = []

    for (const apt of agendamentos || []) {
      // Ensure we get the actual object regardless of Supabase returning arrays or objects for one-to-many
      const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
      const u = Array.isArray(apt.usuarios) ? apt.usuarios[0] : apt.usuarios

      if (p && u) {
        // Mock sending Email / Push notification via a standard provider like Resend/SendGrid
        console.log(
          `[Lembrete] Enviando para: ${p.nome} (${p.email || p.telefone}). Clínica: ${u.nome_consultorio}. Data: ${apt.data_hora}`,
        )
        emailsSent.push({ patient: p.nome, contact: p.email || p.telefone, time: apt.data_hora })
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: agendamentos?.length || 0, details: emailsSent }),
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
