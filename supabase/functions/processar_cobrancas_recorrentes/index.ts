import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()

    const { data: patients, error } = await supabase
      .from('pacientes')
      .select('id, usuario_id, nome, valor_sessao, dia_pagamento, telefone')
      .eq('recorrencia', 'mensal')
      .eq('dia_pagamento', currentDay)

    if (error) throw error

    const results = []

    for (const patient of patients || []) {
      const amountToCharge = patient.valor_sessao || 0

      if (amountToCharge > 0) {
        const { data: finData } = await supabase
          .from('financeiro')
          .select('id, valor_a_receber')
          .eq('paciente_id', patient.id)
          .eq('mes', currentMonth)
          .eq('ano', currentYear)
          .maybeSingle()

        if (finData) {
          await supabase
            .from('financeiro')
            .update({
              valor_a_receber: Number(finData.valor_a_receber) + Number(amountToCharge),
              data_atualizacao: new Date().toISOString(),
            })
            .eq('id', finData.id)
        } else {
          await supabase.from('financeiro').insert({
            usuario_id: patient.usuario_id,
            paciente_id: patient.id,
            mes: currentMonth,
            ano: currentYear,
            valor_recebido: 0,
            valor_a_receber: amountToCharge,
          })
        }

        await supabase.from('historico_cobrancas').insert({
          usuario_id: patient.usuario_id,
          paciente_id: patient.id,
          valor_cobrado: amountToCharge,
          mes_referencia: currentMonth,
          ano_referencia: currentYear,
        })

        // Also trigger the whatsapp function if needed (simulated via edge function invoke)
        await supabase.functions
          .invoke('enviar_cobranca_whatsapp', {
            body: { paciente_id: patient.id, mes: currentMonth, ano: currentYear },
          })
          .catch(console.error)

        results.push({ patient: patient.nome, amount: amountToCharge })
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
