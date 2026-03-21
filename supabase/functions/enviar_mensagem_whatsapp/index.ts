import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tipo_whatsapp, telefone, mensagem } = await req.json()

    if (!tipo_whatsapp) {
      throw new Error('O parâmetro "tipo_whatsapp" é obrigatório.')
    }

    if (!telefone || !mensagem) {
      throw new Error('Os parâmetros "telefone" e "mensagem" são obrigatórios.')
    }

    if (tipo_whatsapp === 'padrao') {
      const apiKey = Deno.env.get('WHATSAPP_API_KEY')

      if (!apiKey) {
        throw new Error('WHATSAPP_API_KEY não configurada no ambiente para a API padrão.')
      }

      // Simulação de chamada para a API padrão
      console.log(`[API Padrão] Enviando mensagem para ${telefone}...`)
      await new Promise((resolve) => setTimeout(resolve, 500))

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'padrao',
          message: 'Mensagem processada com sucesso pela API Padrão do WhatsApp.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      )
    } else if (tipo_whatsapp === 'business') {
      const businessApiKey = Deno.env.get('WHATSAPP_BUSINESS_API_KEY')
      const phoneId = Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID')
      const accountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID')

      if (!businessApiKey || !phoneId || !accountId) {
        throw new Error(
          'Credenciais da API Business (KEY, PHONE_ID, ACCOUNT_ID) incompletas no ambiente.',
        )
      }

      // Simulação de chamada para a Graph API da Meta (WhatsApp Business)
      console.log(
        `[API Business] Enviando mensagem via Graph API (Phone ID: ${phoneId}) para ${telefone}...`,
      )
      await new Promise((resolve) => setTimeout(resolve, 800))

      return new Response(
        JSON.stringify({
          success: true,
          provider: 'business',
          message: 'Mensagem processada com sucesso pela API Oficial do WhatsApp Business.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      )
    } else {
      throw new Error('tipo_whatsapp inválido. Os valores permitidos são "padrao" ou "business".')
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
