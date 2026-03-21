import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 
      })
    }

    const { paciente_id, mes, ano } = await req.json()

    if (!paciente_id || !mes || !ano) {
      return new Response(JSON.stringify({ error: 'Parâmetros incompletos' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 
      })
    }

    // 1. Fetch Paciente
    const { data: paciente, error: pacienteError } = await supabaseClient
      .from('pacientes')
      .select('id, nome, telefone')
      .eq('id', paciente_id)
      .single()

    if (pacienteError || !paciente) {
      return new Response(JSON.stringify({ error: 'Paciente não encontrado' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 
      })
    }

    if (!paciente.telefone) {
      return new Response(JSON.stringify({ error: 'Paciente não possui telefone cadastrado' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 
      })
    }

    // 2. Fetch Financeiro
    const { data: financeiro } = await supabaseClient
      .from('financeiro')
      .select('valor_a_receber')
      .eq('paciente_id', paciente_id)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle()

    const valor_a_receber = financeiro?.valor_a_receber || 0

    if (valor_a_receber <= 0) {
      return new Response(JSON.stringify({ error: 'Não há saldo devedor para este período.' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 
      })
    }

    // 3. Fetch Usuario
    const { data: usuario } = await supabaseClient
      .from('usuarios')
      .select('chave_pix, template_cobranca')
      .eq('id', user.id)
      .single()

    const chave_pix = usuario?.chave_pix || 'Chave PIX não cadastrada'
    const template = usuario?.template_cobranca || 'Olá [Nome], você tem R$ [valor] a pagar referente a [periodo]. PIX: [chave_pix]'

    // 4. Format Message
    const valorStr = Number(valor_a_receber).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const message = template
      .replace(/\[Nome\]/gi, paciente.nome)
      .replace(/\[valor\]/gi, valorStr)
      .replace(/\[periodo\]/gi, `${String(mes).padStart(2, '0')}/${ano}`)
      .replace(/\[chave_pix\]/gi, chave_pix)

    // 5. Insert History
    await supabaseClient.from('historico_cobrancas').insert({
      usuario_id: user.id,
      paciente_id: paciente_id,
      valor_cobrado: valor_a_receber,
      mes_referencia: mes,
      ano_referencia: ano
    })

    await supabaseClient.from('historico_mensagens').insert({
      usuario_id: user.id,
      paciente_id: paciente_id,
      tipo: 'cobrança',
      conteudo: message,
      status_envio: 'enviado'
    })

    return new Response(
      JSON.stringify({ message, telefone: paciente.telefone }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

