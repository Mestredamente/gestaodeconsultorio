import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@^14.0.0'
import { corsHeaders } from '../_shared/cors.ts'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { plan, return_url } = await req.json()
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      throw new Error('Cabeçalho de autorização ausente')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Não autorizado')
    }

    const { data: userData } = await supabase
      .from('usuarios')
      .select('email, stripe_customer_id')
      .eq('id', user.id)
      .single()

    let priceId = plan === 'basico' ? Deno.env.get('STRIPE_PRICE_BASICO') : Deno.env.get('STRIPE_PRICE_PRO')
    if (!priceId) {
      priceId = plan === 'basico' ? 'price_1MockBasicoId' : 'price_1MockProId'
    }

    const separator = return_url.includes('?') ? '&' : '?'

    // Mock se não houver chave válida do Stripe
    if (!stripeKey.startsWith('sk_') && !stripeKey.startsWith('rk_')) {
      console.log('Chave do Stripe inválida ou ausente. Retornando URL de mock e atualizando localmente.')
      
      // Simular atualização de plano localmente caso não haja integração real com Stripe no ambiente
      await supabase.from('usuarios').update({ plano: plan }).eq('id', user.id)
      
      return new Response(JSON.stringify({ url: `${return_url}${separator}session_id=mock_session_id` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${return_url}${separator}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${return_url.split('?')[0]}?canceled=true`,
      client_reference_id: user.id,
      metadata: { plan_id: plan },
    }

    if (userData?.stripe_customer_id) {
      sessionParams.customer = userData.stripe_customer_id
    } else {
      sessionParams.customer_email = userData?.email || user.email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return new Response(JSON.stringify({ url: session.url }), {
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
