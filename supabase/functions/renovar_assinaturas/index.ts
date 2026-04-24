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
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    
    const today = new Date().toISOString().split('T')[0]
    const { data: subs } = await supabase.from('subscriptions').select('*').eq('status', 'active').like('renewal_date', `${today}%`)
    
    let processados = 0
    for (const sub of subs || []) {
      // Mock gateway request
      const success = Math.random() > 0.2 // 80% success rate mock
      
      if (success) {
        const nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + 30)
        
        await supabase.from('subscriptions').update({ renewal_date: nextDate.toISOString() }).eq('id', sub.id)
        
        await supabase.from('payments').insert({
            subscription_id: sub.id, amount: sub.plan_id === 'pro' ? 79.00 : 39.90, status: 'paid', gateway: 'auto_renew',
            due_date: new Date().toISOString(), paid_date: new Date().toISOString()
        })
        processados++
      } else {
        await supabase.from('payment_failures').insert({
          subscription_id: sub.id,
          next_retry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    }
    
    return new Response(JSON.stringify({ success: true, processados }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
