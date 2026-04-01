import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Unauthorized')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { records, preview } = await req.json()
    if (!Array.isArray(records)) throw new Error('Formato inválido')

    const startTime = Date.now()
    const results = { total: records.length, sucesso: 0, erros: [] as any[], tempo_ms: 0 }
    const validRecords = []
    
    for (let i = 0; i < records.length; i++) {
      const rec = records[i]
      const linha = i + 1
      if (!rec.nome || rec.nome.trim() === '') {
        results.erros.push({ linha, motivo: 'Nome é obrigatório' })
        continue
      }
      validRecords.push({
        ...rec,
        usuario_id: user.id,
        _linha: linha
      })
    }

    if (preview) {
      results.sucesso = validRecords.length
      results.tempo_ms = Date.now() - startTime
      return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    for (const rec of validRecords) {
      const linha = rec._linha
      delete rec._linha
      
      if (rec.num_funcionarios) rec.num_funcionarios = parseInt(rec.num_funcionarios) || 0

      const { error } = await supabase.from('empresas').insert(rec)
      if (error) {
        results.erros.push({ linha, motivo: error.message })
      } else {
        results.sucesso++
      }
    }

    results.tempo_ms = Date.now() - startTime
    return new Response(JSON.stringify(results), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
