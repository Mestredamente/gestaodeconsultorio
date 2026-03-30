import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Edge function to track proposal view
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  try {
    const url = new URL(req.url)
    const proposta_id = url.searchParams.get('id')
    
    if (proposta_id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      const { data: proposta } = await supabase.from('propostas').select('responsavel_id, status').eq('id', proposta_id).single()
      
      if (proposta) {
        await supabase.from('historico_propostas').insert({
          proposta_id,
          acao: 'Visualizada',
          usuario_id: proposta.responsavel_id
        })
        
        if (proposta.status === 'Enviada') {
          await supabase.from('propostas').update({ status: 'Visualizada' }).eq('id', proposta_id)
        }
      }
    }

    const pixel = Uint8Array.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
      0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
      0x01, 0x00, 0x3b
    ])

    return new Response(pixel, {
      headers: { ...corsHeaders, 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    return new Response('ok', { headers: corsHeaders })
  }
})
