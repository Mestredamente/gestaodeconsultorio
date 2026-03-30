import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'


Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { proposta_id, numero_whatsapp, mensagem_personalizada, incluir_pdf, incluir_link } = await req.json()
    if (!proposta_id || !numero_whatsapp) throw new Error('Parâmetros incompletos')

    const cleanPhone = String(numero_whatsapp).replace(/\D/g, '')
    if (cleanPhone.length < 10) throw new Error('Número de WhatsApp inválido')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: proposta, error: propError } = await supabase
      .from('propostas')
      .select('*, contatos(nome)')
      .eq('id', proposta_id)
      .single()

    if (propError || !proposta) throw new Error('Proposta não encontrada')

    const token = btoa(proposta_id + Date.now().toString()).substring(0, 20)
    const origin = req.headers.get('origin') || 'https://lmconsultoria.goskip.app'
    const linkUrl = `${origin}/proposals/${proposta_id}/view?token=${token}`

    let pdfUrl = null
    if (incluir_pdf) {
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('gerar-pdf-proposta', {
        body: { proposta_id }
      })
      if (!pdfError && pdfData?.url) {
        pdfUrl = pdfData.url
      }
    }

    let textoBase = `Olá ${proposta.contatos?.nome || 'Cliente'}, segue em anexo sua proposta comercial ${proposta.numero_proposta || 'S/N'}.`
    if (incluir_link) {
      textoBase += ` Clique aqui para visualizar online: ${linkUrl}`
    }

    const finalMessage = mensagem_personalizada 
      ? `${mensagem_personalizada}\n\n${textoBase}`
      : textoBase

    // Simulação de envio via API do WhatsApp Business (Twilio/Evolution API)
    console.log(`[WhatsApp API Simulada] Enviando para ${cleanPhone}:`, finalMessage, pdfUrl ? `[Anexo PDF: ${pdfUrl}]` : '')
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Registra envio no histórico
    await supabase.from('historico_propostas').insert({
      proposta_id,
      acao: 'Enviada via WhatsApp',
      usuario_id: user.id
    })

    // Atualiza status da proposta
    await supabase.from('propostas').update({ status: 'Enviada via WhatsApp' }).eq('id', proposta_id)

    return new Response(JSON.stringify({ success: true, message_id: 'wa_' + Date.now() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
