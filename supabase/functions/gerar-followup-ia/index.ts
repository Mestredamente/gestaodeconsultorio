import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { titulo, descricao, contato_nome } = await req.json()

    // Simulação do delay de processamento da IA
    await new Promise(resolve => setTimeout(resolve, 1500))

    const intro = contato_nome ? `Olá ${contato_nome},` : 'Olá,'
    const assunto = titulo || 'nossa última reunião'
    const body = descricao 
      ? `Gostaria de agradecer pelo tempo dedicado e pelas discussões produtivas sobre ${assunto}.\n\nConforme conversamos:\n- ${descricao.substring(0, 150)}...\n\nVou compilar as informações internamente e retorno muito em breve com a proposta desenhada sob medida para o seu cenário atual.`
      : `Gostaria de agradecer pela nossa reunião sobre ${assunto}.\n\nJá estamos alinhando internamente os próximos passos e te enviarei novidades muito em breve.`

    const draft = `${intro}\n\n${body}\n\nQualquer dúvida nesse meio tempo, estou à inteira disposição!\n\nUm abraço,`

    return new Response(JSON.stringify({ 
      success: true, 
      email_draft: draft
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
