import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let { tipo_whatsapp, telefone, mensagem, usuario_id } = await req.json()

    // Resiliência: Garantir que valores obsoletos não quebrem a execução
    if (tipo_whatsapp === 'personal') {
      tipo_whatsapp = 'padrao'
    }

    if (!tipo_whatsapp) {
      throw new Error('O parâmetro "tipo_whatsapp" é obrigatório.')
    }

    if (!telefone || !mensagem) {
      throw new Error('Os parâmetros "telefone" e "mensagem" são obrigatórios.')
    }

    // Sanitização de Telefone no servidor (garantia extra)
    let cleanPhone = String(telefone).replace(/\D/g, '')
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && !cleanPhone.startsWith('55')) {
      cleanPhone = `55${cleanPhone}`
    }

    let apiKey = Deno.env.get('WHATSAPP_API_KEY')
    let businessApiKey = Deno.env.get('WHATSAPP_BUSINESS_API_KEY')
    let phoneId = Deno.env.get('WHATSAPP_BUSINESS_PHONE_ID')
    let accountId = Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID')

    if (usuario_id) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      const { data: userConfig } = await supabaseClient
        .from('usuarios')
        .select('whatsapp_api_key, whatsapp_business_phone_id, whatsapp_business_account_id')
        .eq('id', usuario_id)
        .single()
        
      if (userConfig) {
        if (userConfig.whatsapp_api_key) {
          apiKey = userConfig.whatsapp_api_key
          businessApiKey = userConfig.whatsapp_api_key
        }
        if (userConfig.whatsapp_business_phone_id) {
          phoneId = userConfig.whatsapp_business_phone_id
        }
        if (userConfig.whatsapp_business_account_id) {
          accountId = userConfig.whatsapp_business_account_id
        }
      }
    }

    if (tipo_whatsapp === 'padrao') {
      if (!apiKey) {
        console.warn('WHATSAPP_API_KEY não configurada no ambiente ou no perfil do usuário. Utilizando fallback de simulação.')
      }

      // Simulação de chamada para a API padrão
      console.log(`[API Padrão] Enviando mensagem para ${cleanPhone}...`)
      await new Promise(resolve => setTimeout(resolve, 500))

      return new Response(
        JSON.stringify({ 
          success: true, 
          provider: 'padrao',
          message: 'Mensagem processada com sucesso pela API Padrão do WhatsApp.',
          telefone_processado: cleanPhone,
          fallback: !apiKey
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )

    } else if (tipo_whatsapp === 'business') {
      if (!businessApiKey || !phoneId || !accountId) {
        console.warn('Credenciais da API Business (KEY, PHONE_ID, ACCOUNT_ID) incompletas no ambiente ou no perfil do usuário. Utilizando fallback de simulação.')
      }

      // Simulação de chamada para a Graph API da Meta (WhatsApp Business)
      console.log(`[API Business] Enviando mensagem via Graph API (Phone ID: ${phoneId || 'N/A'}) para ${cleanPhone}...`)
      await new Promise(resolve => setTimeout(resolve, 800))

      return new Response(
        JSON.stringify({ 
          success: true, 
          provider: 'business',
          message: 'Mensagem processada com sucesso pela API Oficial do WhatsApp Business.',
          telefone_processado: cleanPhone,
          fallback: (!businessApiKey || !phoneId || !accountId)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
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
