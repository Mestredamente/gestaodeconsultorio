import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { agendamento_id } = await req.json()
    
    if (!agendamento_id) throw new Error("ID do agendamento é obrigatório");
    
    // Simulate integration delay with external API for invoice generation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update DB
    const { error } = await supabaseClient
      .from('agendamentos')
      .update({ status_nota_fiscal: 'emitida' })
      .eq('id', agendamento_id)
      
    if (error) throw error;
    
    return new Response(JSON.stringify({ success: true, status: 'emitida' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
})
