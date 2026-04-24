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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { payment_id, clinic_id, patient_id, amount } = await req.json()

    const { data: clinic } = await supabase.from('usuarios').select('nome_consultorio, cep, rua').eq('id', clinic_id).single()
    const { data: patient } = await supabase.from('pacientes').select('nome, cpf').eq('id', patient_id).single()

    await new Promise(r => setTimeout(r, 1000))
    const nfse_number = `NFS-${Math.floor(Math.random() * 100000)}`
    const xml_data = `<nfse><numero>${nfse_number}</numero><valor>${amount}</valor><prestador>${clinic?.nome_consultorio}</prestador><tomador>${patient?.nome}</tomador></nfse>`

    const { error } = await supabase.from('nfse_records').insert({
      clinic_id,
      payment_id,
      nfse_number,
      status: 'emitida',
      xml_data
    })

    if (error) throw error

    return new Response(JSON.stringify({ success: true, nfse_number }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
