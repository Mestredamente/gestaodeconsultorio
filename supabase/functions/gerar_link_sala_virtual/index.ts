import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { agendamento_id } = await req.json()
    if (!agendamento_id) {
      throw new Error('agendamento_id é obrigatório')
    }

    // Buscar detalhes do agendamento
    const { data: agendamento, error: fetchError } = await supabaseClient
      .from('agendamentos')
      .select('id, data_hora')
      .eq('id', agendamento_id)
      .single()

    if (fetchError || !agendamento) {
      throw new Error('Agendamento não encontrado')
    }

    // Definir janela de validade (30 mins antes e 30 mins depois)
    const dataHoraSessao = new Date(agendamento.data_hora)
    const validFrom = new Date(dataHoraSessao.getTime() - 30 * 60000)
    const expiresAt = new Date(dataHoraSessao.getTime() + 30 * 60000)

    // Gerar token único e construir link
    const tokenUnico = crypto.randomUUID()
    const origin = req.headers.get('origin') || 'https://gestaodeconsultorio.goskip.app'
    const linkSeguro = `${origin}/sala-virtual/${agendamento_id}/${tokenUnico}`

    // Atualizar registro no banco
    const { error: updateError } = await supabaseClient
      .from('agendamentos')
      .update({
        link_sala_virtual: linkSeguro,
        sala_virtual_token: tokenUnico,
        sala_virtual_token_valid_from: validFrom.toISOString(),
        sala_virtual_token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', agendamento_id)

    if (updateError) {
      throw new Error('Erro ao salvar o link seguro no banco de dados')
    }

    return new Response(JSON.stringify({ link: linkSeguro, validFrom, expiresAt }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
