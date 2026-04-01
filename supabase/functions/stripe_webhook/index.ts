import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@^14.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Sem assinatura', { status: 400 })
  }

  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  let event: Stripe.Event

  try {
    if (webhookSecret) {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      )
    } else {
      event = JSON.parse(body)
    }
  } catch (err: any) {
    console.error(`Erro no Webhook: ${err.message}`)
    return new Response(`Erro no Webhook: ${err.message}`, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.metadata?.type === 'payment') {
          // It's a payment for an appointment
          const paciente_id = session.metadata.paciente_id
          const usuario_id = session.metadata.usuario_id
          const amount = session.amount_total ? session.amount_total / 100 : 0
          
          if (usuario_id && paciente_id) {
            const dateObj = new Date()
            await supabase.from('financeiro').insert({
              usuario_id: usuario_id,
              paciente_id: paciente_id,
              valor_recebido: amount,
              valor_a_receber: 0,
              mes: dateObj.getMonth() + 1,
              ano: dateObj.getFullYear(),
              status: 'recebido',
              metodo_pagamento: 'stripe',
              data_atualizacao: dateObj.toISOString(),
            })
            
            // Log de auditoria
            await supabase.from('logs_auditoria').insert({
              usuario_id: usuario_id,
              acao: 'Pagamento via Stripe',
              tabela_afetada: 'financeiro',
              registro_id: paciente_id,
              detalhes: { amount, status: 'recebido' }
            })
          }
        } else if (session.client_reference_id) {
          // It's a subscription
          const planId = session.metadata?.plan_id || 'basico'
          await supabase
            .from('usuarios')
            .update({
              plano: planId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            })
            .eq('id', session.client_reference_id)
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const status = subscription.status
        const customerId = subscription.customer as string

        const { data: user } = await supabase
          .from('usuarios')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          if (status === 'active' || status === 'trialing') {
            await supabase
              .from('usuarios')
              .update({
                data_proxima_cobranca: new Date(subscription.current_period_end * 1000).toISOString(),
                stripe_subscription_id: subscription.id,
              })
              .eq('id', user.id)
          } else if (status === 'canceled' || status === 'unpaid') {
            await supabase
              .from('usuarios')
              .update({
                plano: 'gratuito',
                data_proxima_cobranca: null,
              })
              .eq('id', user.id)
          }
        }
        break
      }
    }
    return new Response(JSON.stringify({ recebido: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    console.error('Erro ao processar webhook:', err)
    return new Response(`Erro ao processar webhook: ${err.message}`, { status: 500 })
  }
})
