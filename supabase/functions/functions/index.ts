import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  return new Response(JSON.stringify({ error: 'Function not found or disabled' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
