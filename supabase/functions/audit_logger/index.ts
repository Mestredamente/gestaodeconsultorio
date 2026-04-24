import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { user_id, action, table_name, record_id, details } = await req.json()
    const ip_address = req.headers.get('x-forwarded-for') || 'unknown'
    const user_agent = req.headers.get('user-agent') || 'unknown'

    await supabase.from('audit_log').insert({
      user_id,
      action,
      table_name,
      record_id,
      details,
      ip_address,
      user_agent
    })

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json'} })
  } catch(e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json'} })
  }
})
