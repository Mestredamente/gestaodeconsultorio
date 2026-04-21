import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { texto } = await req.json()

    // Mock AI delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const lower = (texto || '').toLowerCase()
    let sentimento = 'Neutro'
    let score = 50
    let analise = 'O cliente manteve um tom profissional e fez perguntas objetivas sobre o serviço, sem demonstrar forte inclinação ou objeção clara.'

    if (lower.includes('excelente') || lower.includes('ótimo') || lower.includes('fechar') || lower.includes('gostei') || lower.includes('bom')) {
      sentimento = 'Positivo'
      score = 85
      analise = 'O cliente demonstrou forte interesse e receptividade. Sinais de compra claros identificados na comunicação.'
    } else if (lower.includes('caro') || lower.includes('ruim') || lower.includes('não gostei') || lower.includes('concorrente') || lower.includes('difícil')) {
      sentimento = 'Negativo'
      score = 30
      analise = 'Foram identificadas objeções, possivelmente relacionadas a custo ou aderência da solução. Requer contorno cuidadoso.'
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sentimento,
      score,
      analise
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
