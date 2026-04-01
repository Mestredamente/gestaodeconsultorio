import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { atividade_id, acao } = await req.json()

    // Buscamos a integração
    const { data: integracao } = await supabaseClient
      .from('integracao_usuarios')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('provedor', 'google')
      .eq('ativo', true)
      .maybeSingle()

    if (!integracao) {
      throw new Error('Integração com Google Calendar não configurada ou inativa.')
    }

    // Buscamos a atividade
    const { data: atividade } = await supabaseClient
      .from('atividades')
      .select('*, contatos(email)')
      .eq('id', atividade_id)
      .single()

    if (!atividade) throw new Error('Atividade não encontrada')

    // Simulando a comunicação com a API do Google (pois access_token real requer auth completo do Google)
    // Em um cenário real, usariamos fetch para https://www.googleapis.com/calendar/v3/calendars/primary/events
    await new Promise(res => setTimeout(res, 800))
    
    let google_event_id = atividade.google_event_id || `gcal_${atividade_id.substring(0,8)}`

    if (acao === 'criar' || acao === 'editar') {
      await supabaseClient
        .from('atividades')
        .update({ google_event_id })
        .eq('id', atividade_id)
    }

    return new Response(JSON.stringify({ success: true, google_event_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
