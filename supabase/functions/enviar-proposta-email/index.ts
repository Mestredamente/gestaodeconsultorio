import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Edge function to send proposal email
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { proposta_id, email_destinatario, mensagem_personalizada, incluir_pdf, incluir_link } = await req.json()
    if (!proposta_id || !email_destinatario) throw new Error('Parâmetros incompletos')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email_destinatario)) throw new Error('Email inválido')

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
      .select('*, empresas(nome), contatos(nome), usuarios(nome, nome_consultorio, email, telefone_consultorio, logo_url)')
      .eq('id', proposta_id)
      .single()

    if (propError || !proposta) throw new Error('Proposta não encontrada')

    const { data: itens } = await supabase
      .from('itens_proposta')
      .select('*')
      .eq('proposta_id', proposta_id)

    const { data: custos } = await supabase
      .from('custos_operacionais')
      .select('*')
      .eq('proposta_id', proposta_id)

    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    const token = btoa(proposta_id + Date.now().toString()).substring(0, 20)
    const trackingPixel = `${supabaseUrl}/functions/v1/rastrear-visualizacao-proposta?id=${proposta_id}&token=${token}`

    const formatCurrency = (val: number) => `R$ ${Number(val).toFixed(2).replace('.', ',')}`
    
    let itensHtml = (itens || []).map(i => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.tipo_servico}<br/><small style="color: #666;">${i.descricao || ''}</small></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${i.quantidade}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(i.valor_unitario)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(i.subtotal || i.quantidade * i.valor_unitario)}</td>
      </tr>
    `).join('')

    if (!itensHtml) itensHtml = `<tr><td colspan="4" style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">Nenhum serviço detalhado</td></tr>`

    let custosHtml = ''
    if (custos && custos.length > 0) {
      custosHtml = `
        <h3 style="margin-top: 20px; color: #2563eb; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Custos Operacionais</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 12px 10px; text-align: left;">Tipo</th>
            <th style="padding: 12px 10px; text-align: left;">Descrição</th>
            <th style="padding: 12px 10px; text-align: right;">Valor</th>
          </tr>
          ${custos.map(c => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${c.tipo}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${c.descricao || '-'}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(c.valor)}</td>
            </tr>
          `).join('')}
        </table>
      `
    }

    const consultorio = Array.isArray(proposta.usuarios) ? proposta.usuarios[0] : proposta.usuarios
    const consultorioNome = consultorio?.nome_consultorio || consultorio?.nome || 'Consultoria'
    const logoHtml = consultorio?.logo_url ? `<img src="${consultorio.logo_url}" height="40" alt="Logo" style="margin-bottom: 10px;" />` : ''

    const origin = req.headers.get('origin') || 'https://lmconsultoria.goskip.app'
    const linkUrl = `${origin}/proposals/${proposta_id}/view?token=${token}`

    let pdfHtml = ''
    if (incluir_pdf) {
      const { data: pdfData, error: pdfError } = await supabase.functions.invoke('gerar-pdf-proposta', {
        body: { proposta_id }
      })
      if (!pdfError && pdfData?.url) {
        pdfHtml = `<p style="text-align: center; margin-top: 10px;"><a href="${pdfData.url}" style="color: #2563eb; text-decoration: underline;">Download do PDF da Proposta</a></p>`
      }
    }

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Proposta Comercial</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #1e3a8a; padding: 40px 30px; text-align: center; color: #ffffff;">
          ${logoHtml ? `<div style="background-color: #ffffff; display: inline-block; padding: 10px; border-radius: 8px; margin-bottom: 20px;">${logoHtml}</div>` : ''}
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Proposta Comercial</h1>
          <p style="margin: 12px 0 0; font-size: 15px; color: #bfdbfe;">
            Ref: <strong>${proposta.numero_proposta || 'S/N'}</strong> &nbsp;|&nbsp; 
            Emissão: <strong>${new Date(proposta.data_emissao).toLocaleDateString('pt-BR')}</strong>
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #334155; margin-top: 0;">
            Prezado(a) <strong style="color: #0f172a;">${proposta.contatos?.nome || 'Cliente'}</strong>,
          </p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #475569;">
              ${mensagem_personalizada ? mensagem_personalizada.replace(/\n/g, '<br/>') : 'Agradecemos a oportunidade de apresentar nossa proposta comercial. Abaixo você encontra os detalhes dos serviços propostos e o investimento necessário.'}
            </p>
          </div>
          
          <!-- Services -->
          <h2 style="font-size: 18px; color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 32px;">Detalhes dos Serviços</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 12px; text-align: left; color: #475569; border-radius: 6px 0 0 6px;">Descrição</th>
                <th style="padding: 12px; text-align: center; color: #475569;">Qtd</th>
                <th style="padding: 12px; text-align: right; color: #475569;">Valor Un.</th>
                <th style="padding: 12px; text-align: right; color: #475569; border-radius: 0 6px 6px 0;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itensHtml}
            </tbody>
          </table>

          <!-- Costs -->
          ${custosHtml ? `
            <div style="margin-top: 32px;">
              ${custosHtml}
            </div>
          ` : ''}

          <!-- Financial Summary -->
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 24px; margin-top: 40px; text-align: right;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Resumo Financeiro Total</p>
            <p style="margin: 0; font-size: 32px; font-weight: 800; color: #1e3a8a; letter-spacing: -1px;">
              ${formatCurrency(proposta.valor_total)}
            </p>
            <p style="margin: 12px 0 0 0; font-size: 13px; color: #64748b;">
              Validade: <strong>${proposta.data_validade ? new Date(proposta.data_validade).toLocaleDateString('pt-BR') : 'A combinar'}</strong>
            </p>
          </div>

          <!-- CTAs -->
          <div style="margin-top: 40px; text-align: center;">
            ${incluir_link ? `
              <a href="${linkUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); transition: background-color 0.2s;">
                Visualizar Proposta Online
              </a>
            ` : ''}
            
            ${pdfHtml ? `
              <div style="margin-top: 20px;">
                ${pdfHtml.replace('<p', '<p style="margin:0;"').replace('<a', '<a style="color: #64748b; font-size: 14px; text-decoration: underline;"')}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569;">
            <strong>Condições de Pagamento:</strong><br/>
            ${proposta.condicoes_pagamento || 'A combinar'}
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #334155;">${consultorioNome}</p>
          <p style="margin: 6px 0 0; font-size: 13px; color: #64748b;">
            ${consultorio?.email || ''} <span style="margin: 0 8px;">|</span> ${consultorio?.telefone_consultorio || ''}
          </p>
        </div>
      </div>
      
      <!-- Tracking Pixel -->
      <img src="${trackingPixel}" width="1" height="1" alt="" style="display:block; border:none; outline:none; text-decoration:none;" />
    </body>
    </html>
    `

    let email_id_resend = null

    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${consultorioNome} <onboarding@resend.dev>`,
          to: [email_destinatario],
          subject: `Proposta Comercial - ${proposta?.numero_proposta || 'S/N'}`,
          html: html
        })
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Erro no Resend: ${errText}`)
      }
      const data = await res.json()
      email_id_resend = data.id
    } else {
      console.warn('RESEND_API_KEY não configurada. Simulando envio...')
      email_id_resend = 'simulated_' + Date.now()
    }

    const { error: insertEmailError } = await supabase.from('emails_propostas').insert({
      proposta_id,
      email_destinatario,
      assunto: `Proposta Comercial - ${proposta?.numero_proposta || 'S/N'}`,
      status: 'Enviado',
      email_id_resend
    })

    if (insertEmailError) console.error('Erro ao registrar email_proposta', insertEmailError)

    await supabase.from('historico_propostas').insert({
      proposta_id,
      acao: 'Enviada',
      usuario_id: user.id
    })

    await supabase.from('propostas').update({ status: 'Enviada' }).eq('id', proposta_id)

    return new Response(JSON.stringify({ success: true, email_id: email_id_resend, timestamp: new Date().toISOString() }), {
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
