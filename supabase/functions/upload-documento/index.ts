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

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const proposta_id = formData.get('proposta_id') as string | null
    const tipo_documento = formData.get('tipo_documento') as string | null

    if (!file) throw new Error('Nenhum arquivo enviado')
    if (file.size > 50 * 1024 * 1024) throw new Error('Arquivo excede o tamanho máximo de 50MB')

    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      'image/png', 
      'image/jpeg'
    ]
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido')
    }

    const folderMap: Record<string, string> = {
      'Proposta': 'propostas',
      'Contrato': 'contratos',
      'Relatório': 'relatorios',
      'Anexo': 'anexos'
    }

    const folderName = folderMap[tipo_documento || ''] || 'anexos'
    const fileName = `${crypto.randomUUID()}_${file.name}`
    const filePath = `${user.id}/${folderName}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documentos-propostas')
      .upload(filePath, file, { contentType: file.type, upsert: false })

    if (uploadError) throw uploadError

    const insertData: any = {
      tipo: tipo_documento || 'Anexo',
      nome_arquivo: file.name,
      caminho_storage: filePath,
      tamanho_bytes: file.size,
      usuario_id: user.id
    }

    if (proposta_id && proposta_id.trim() !== '' && proposta_id !== 'null') {
      insertData.proposta_id = proposta_id
    }

    const { data: docData, error: docError } = await supabase.from('documentos').insert(insertData).select().single()

    if (docError) {
      await supabase.storage.from('documentos-propostas').remove([filePath])
      throw docError
    }

    return new Response(JSON.stringify({ success: true, documento_id: docData.id, url_publica: filePath }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
