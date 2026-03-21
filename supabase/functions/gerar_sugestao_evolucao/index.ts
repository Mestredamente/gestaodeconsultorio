import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { historico, queixa } = await req.json()

    // Mocking an AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    let suggestion = "Paciente compareceu à sessão relatando...\n\nFoi trabalhada a queixa principal de " + (queixa || "ansiedade") + ".\n\nEvolução:\nO paciente demonstra..."

    if (historico && historico.length > 0) {
        suggestion = `Paciente compareceu à sessão dando continuidade ao acompanhamento clínico.\n\nRetomamos os pontos da sessão anterior, aprofundando as reflexões trazidas.\n\nEvolução baseada na queixa de ${queixa || 'acompanhamento contínuo'}:\n- O paciente apresentou estabilidade de humor.\n- Demonstrou maior clareza sobre suas demandas.\n\nPlano de acompanhamento mantido para a próxima sessão.`
    }

    return new Response(JSON.stringify({ text: suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
