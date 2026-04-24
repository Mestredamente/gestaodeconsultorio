import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('*, usuarios(nome_consultorio, email, cpf)')
      .eq('status', 'active')

    if (error) throw error

    let synced = 0
    let failed = 0

    for (const sub of subs || []) {
      const u = Array.isArray(sub.usuarios) ? sub.usuarios[0] : sub.usuarios
      if (!u) continue

      const omiePayload = {
        cliente: u.nome_consultorio || u.email,
        documento: u.cpf || '',
        receita: sub.plan_id === 'pro' ? 79.0 : 39.9,
        data_pagamento: new Date().toISOString(),
      }

      let attempt = 0
      let success = false
      while (attempt < 3 && !success) {
        try {
          if (Math.random() < 0.2) throw new Error('503 Service Unavailable')
          await new Promise((r) => setTimeout(r, 200))
          success = true
          synced++
        } catch (e) {
          attempt++
          if (attempt >= 3) {
            failed++
            console.error(`Falha ao sincronizar Omie para ${u.email}:`, e)
          } else {
            await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000))
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, synced, failed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
