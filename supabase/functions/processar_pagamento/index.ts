import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@^14.0.0'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Não autorizado')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Não autorizado')

    const { paciente_id, valor, gateway, plano_id, metodo_pagamento, return_url } = await req.json()

    // Lógica para Pagamento de Assinatura (SaaS)
    if (plano_id) {
      const planValue = plano_id === 'pro' ? 79.00 : 39.90
      
      const successUrl = return_url ? `${return_url}` : `${req.headers.get('origin') || 'http://localhost:5173'}/planos?success=true&plan=${plano_id}`
      const cancelUrl = `${req.headers.get('origin') || 'http://localhost:5173'}/planos`

      if (metodo_pagamento === 'cartao' || gateway === 'stripe') {
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
        if (!stripeKey.startsWith('sk_') && !stripeKey.startsWith('rk_')) {
          // Mock
          const { data: subData } = await supabase.from('subscriptions').insert({
            user_id: user.id, plan_id: plano_id, status: 'active'
          }).select('id').single()

          if (subData) {
             await supabase.from('payments').insert({
               subscription_id: subData.id, amount: planValue, status: 'paid', gateway: 'mock_stripe', due_date: new Date().toISOString(), paid_date: new Date().toISOString()
             })
          }

          return new Response(JSON.stringify({ 
            success: true, checkoutUrl: successUrl, message: `Mock Stripe Checkout`
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() })
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: { currency: 'brl', product_data: { name: `Plano ${plano_id.toUpperCase()}` }, unit_amount: Math.round(planValue * 100) },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: successUrl,
          cancel_url: cancelUrl,
          client_reference_id: user.id,
          metadata: { type: 'subscription', plano_id: plano_id, usuario_id: user.id }
        })

        return new Response(JSON.stringify({ success: true, checkoutUrl: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      // Mock para PIX / Boleto
      const mockCheckoutUrl = gateway === 'mercado_pago' ? 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_pix' : 'https://pagseguro.uol.com.br/checkout/mock_boleto'
      await new Promise(resolve => setTimeout(resolve, 800))
      return new Response(JSON.stringify({ success: true, checkoutUrl: successUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Lógica Original para Pagamento de Paciente
    if (!paciente_id || !valor) throw new Error('Parâmetros inválidos para pagamento de sessão')

    if (gateway === 'stripe') {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
      if (!stripeKey.startsWith('sk_') && !stripeKey.startsWith('rk_')) {
        await new Promise(resolve => setTimeout(resolve, 800))
        return new Response(JSON.stringify({ 
          success: true, checkoutUrl: `${req.headers.get('origin') || 'http://localhost:5173'}/carteira?success=true&mock=true`, message: `Link simulado gerado`
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16', httpClient: Stripe.createFetchHttpClient() })
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'boleto'],
        line_items: [{
          price_data: { currency: 'brl', product_data: { name: 'Pagamento de Sessão / Serviço' }, unit_amount: Math.round(valor * 100) },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${req.headers.get('origin') || 'http://localhost:5173'}/carteira?success=true`,
        cancel_url: `${req.headers.get('origin') || 'http://localhost:5173'}/carteira?canceled=true`,
        client_reference_id: user.id,
        metadata: { type: 'payment', paciente_id: paciente_id, usuario_id: user.id }
      })

      return new Response(JSON.stringify({ success: true, checkoutUrl: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Mercado Pago e PagSeguro mocks
    const mockCheckoutUrl = gateway === 'mercado_pago' ? 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock' : 'https://pagseguro.uol.com.br/checkout/mock'
    await new Promise(resolve => setTimeout(resolve, 800))
    return new Response(JSON.stringify({ success: true, checkoutUrl: mockCheckoutUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
