import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { paciente_id, valor, gateway } = await req.json()
    
    // In a real scenario, here we would integrate with Stripe/MercadoPago SDKs 
    // to generate a real checkout session using the secrets from Supabase environment.
    // For this demonstration, we simulate the integration and return a mock checkout URL.
    
    const gatewayUrls: Record<string, string> = {
      'stripe': 'https://checkout.stripe.com/pay/mock-session-id',
      'mercado_pago': 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock',
      'pagseguro': 'https://pagseguro.uol.com.br/checkout/mock'
    }

    const mockCheckoutUrl = gatewayUrls[gateway] || gatewayUrls['mercado_pago']

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return new Response(JSON.stringify({ 
      success: true, 
      checkoutUrl: mockCheckoutUrl,
      message: `Link de cobrança gerado via ${gateway}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
