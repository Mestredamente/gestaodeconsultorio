import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { email, role_name, clinic_id, clinic_name } = await req.json()
    const token = crypto.randomUUID()
    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + 7)

    const { data: roleData } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role_name)
      .single()
    if (!roleData) throw new Error('Role não encontrado')

    await supabase.from('invitation_links').insert({
      clinic_id,
      role_id: roleData.id,
      email,
      token,
      expires_at: expires_at.toISOString(),
    })

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const origin = req.headers.get('origin') || 'https://gestaodeconsultorio.goskip.app'
    const joinLink = `${origin}/join/${token}`

    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Gestão de Consultório <onboarding@resend.dev>',
          to: [email],
          subject: `Convite para se juntar à clínica ${clinic_name}`,
          html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #4f46e5;">Convite de Acesso</h2>
                  <p>Você foi convidado para se juntar à equipe da clínica <strong>${clinic_name}</strong> no sistema de Gestão de Consultório.</p>
                  <p>Para aceitar o convite e criar sua conta, clique no botão abaixo:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${joinLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Acessar o Sistema</a>
                  </div>
                  <p style="font-size: 12px; color: #666;">Se o botão não funcionar, copie e cole este link no seu navegador:<br/>${joinLink}</p>
                  <p style="font-size: 12px; color: #666;">Este link expira em 7 dias.</p>
                </div>`,
        }),
      })
      if (!res.ok) {
        const errorText = await res.text()
        console.error('Erro no envio do e-mail:', errorText)
        throw new Error(`Erro ao enviar e-mail: ${errorText}`)
      }
    } else {
      console.log('RESEND_API_KEY missing. Mocking email send.')
    }

    return new Response(JSON.stringify({ success: true, token, joinLink }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
