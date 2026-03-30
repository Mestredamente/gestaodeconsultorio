import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib'
import { corsHeaders } from '../_shared/cors.ts'

// Edge function to generate PDF
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { proposta_id } = await req.json()
    if (!proposta_id) throw new Error('proposta_id is required')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: proposta, error } = await supabase
      .from('propostas')
      .select('*, empresas(nome), contatos(nome), usuarios(nome_consultorio)')
      .eq('id', proposta_id)
      .single()

    if (error || !proposta) throw new Error('Proposta não encontrada')

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89])
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    let y = 780
    const drawText = (text: string, font: any, size: number, x: number, color = rgb(0, 0, 0)) => {
      page.drawText(text || '', { x, y, size, font, color })
      y -= size + 10
    }

    drawText(`Proposta Comercial: ${proposta.numero_proposta}`, helveticaBold, 20, 50, rgb(0.1, 0.3, 0.6))
    y -= 15
    drawText(`Empresa: ${proposta.empresas?.nome || 'Não informada'}`, helvetica, 12, 50)
    drawText(`Contato: ${proposta.contatos?.nome || 'Não informado'}`, helvetica, 12, 50)
    drawText(`Data de Emissão: ${new Date(proposta.data_emissao).toLocaleDateString('pt-BR')}`, helvetica, 12, 50)
    if (proposta.data_validade) {
      drawText(`Validade: ${new Date(proposta.data_validade).toLocaleDateString('pt-BR')}`, helvetica, 12, 50)
    }
    
    y -= 20
    drawText(`Valor Total: R$ ${proposta.valor_total.toFixed(2)}`, helveticaBold, 16, 50, rgb(0.1, 0.6, 0.3))
    
    y -= 30
    drawText('Documento gerado automaticamente pelo CRM B2B.', helvetica, 10, 50, rgb(0.5, 0.5, 0.5))

    const pdfBytes = await pdfDoc.save()
    
    const fileName = `${proposta.numero_proposta || proposta_id}.pdf`
    
    const { error: uploadError } = await supabase
      .storage
      .from('propostas')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('propostas').getPublicUrl(fileName)

    return new Response(JSON.stringify({ url: publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
