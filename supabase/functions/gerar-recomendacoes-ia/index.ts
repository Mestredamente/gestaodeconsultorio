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

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Simular chamada ao Gemini API (Google Generative AI)
    await new Promise(res => setTimeout(res, 1500))

    const dicas = [
      "Aumentar margem em **Consultoria Estratégica**: Sua margem atual é de 35%, mas o benchmark do mercado para o seu perfil permite chegar a 42% sem perda de conversão.",
      "Focar em clientes como a **TechCorp** (maior potencial de receita recorrente).",
      "Período de pico de vendas identificado: **Março a Maio**. Prepare sua equipe comercial para este ciclo.",
      "O responsável **João Silva** tem a melhor taxa de conversão em Treinamentos (65%). Sugerimos que ele compartilhe suas táticas com o restante da equipe."
    ]

    return new Response(JSON.stringify({ success: true, recommendations: dicas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
