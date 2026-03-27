import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Em um cenário real, enviaríamos o áudio para uma API como a OpenAI Whisper.
    // Aqui estamos simulando a latência da transcrição da IA.
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockTranscriptions = [
      "O paciente relatou melhora significativa nos sintomas de ansiedade durante a última semana. Conseguimos aprofundar na técnica de respiração diafragmática e identificamos gatilhos de estresse no ambiente de trabalho.",
      "Sessão focada na revisão das metas estabelecidas. O paciente demonstra maior clareza sobre seus objetivos pessoais e profissionais, relatando menos episódios de insônia.",
      "Foi discutido o impacto do estresse nas relações familiares. O paciente apresentou exemplos práticos de como tem lidado com os conflitos recentes usando comunicação não violenta."
    ]

    const text = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)]

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
