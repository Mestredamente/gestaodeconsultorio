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
    const { paciente_id, usuario_id } = await req.json()

    // Here we would typically call Google Gemini API using Deno.env.get('GEMINI_API_KEY')
    // We would pass the patient's history (queixa_principal) and doctor's available slots.
    
    // Simulating Gemini AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mocking the AI response with 3 intelligent suggestions
    const today = new Date()
    const suggestions = [
      {
        data_hora: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0).toISOString(),
        justificativa: "Horário da manhã é ideal para pacientes com ansiedade, pois os níveis de cortisol estão mais regulados, facilitando a abordagem clínica."
      },
      {
        data_hora: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0).toISOString(),
        justificativa: "Com base no histórico de comparecimento deste perfil, horários no início da tarde possuem 90% menos taxa de cancelamento."
      },
      {
        data_hora: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 18, 0).toISOString(),
        justificativa: "Horário de final do dia recomendado para conciliação com a jornada de trabalho do paciente (perfil CLT)."
      }
    ]

    return new Response(JSON.stringify({ 
      success: true, 
      sugestoes: suggestions 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
