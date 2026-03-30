import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { services, margem_atual } = await req.json()

    // Simular o delay de uma requisição real para o Gemini API
    await new Promise(resolve => setTimeout(resolve, 1500))

    let suggestedMargin = margem_atual || 40
    let rationale = "Com base no histórico recente e nas características dos serviços adicionados, sua margem atual está adequada."

    const hasConsulting = services?.some((s: any) => s.tipo?.toLowerCase().includes('consultoria'))
    const hasTraining = services?.some((s: any) => s.tipo?.toLowerCase().includes('treinamento'))

    if (hasConsulting && suggestedMargin < 40) {
      suggestedMargin = 45
      rationale = "Análise competitiva indica que serviços de 'Consultoria Estratégica' para este porte de negociação suportam margens de até 45% sem impactar a taxa de conversão (ganho de 10% na rentabilidade final)."
    } else if (hasTraining && suggestedMargin > 50) {
      suggestedMargin = 40
      rationale = "Notamos que a margem está muito alta para 'Treinamentos', o que pode reduzir a competitividade. Sugerimos ajustar para 40%, alinhando ao benchmark de 65% de conversão nesta categoria."
    } else if (suggestedMargin < 25) {
      suggestedMargin = 35
      rationale = "Sua margem está abaixo do limite saudável para cobrir variações de escopo em projetos corporativos. Sugerimos elevar para 35%."
    } else {
      suggestedMargin = Math.min(suggestedMargin + 2, 60)
      rationale = `Margem ajustada ligeiramente para ${suggestedMargin}% otimizando a rentabilidade em relação à média do setor, mantendo o preço competitivo.`
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sugestao: rationale,
      sugestao_margem: suggestedMargin
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
