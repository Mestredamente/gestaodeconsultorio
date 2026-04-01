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
    
    const { data: failures } = await supabase.from('payment_failures').select('*').gte('attempts', 3).eq('status', 'pending')
    
    let bloqueados = 0
    for (const f of failures || []) {
      await supabase.from('subscriptions').update({ status: 'blocked' }).eq('id', f.subscription_id)
      
      await supabase.from('subscription_audit_log').insert({
        subscription_id: f.subscription_id,
        action: 'Bloqueio Automático',
        details: { reason: '3 falhas de pagamento consecutivas' }
      })
      
      await supabase.from('payment_failures').update({ status: 'resolved' }).eq('id', f.id)
      bloqueados++
      
      // Mock notify
      const { data: subData } = await supabase.from('subscriptions').select('user_id').eq('id', f.subscription_id).single()
      if (subData) {
          await supabase.from('notificacoes').insert({
              usuario_id: subData.user_id,
              titulo: 'Assinatura Bloqueada',
              mensagem: 'Sua assinatura foi bloqueada por falta de pagamento. Regularize em 7 dias ou será cancelada.'
          })
      }
    }
    
    return new Response(JSON.stringify({ success: true, bloqueados }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
