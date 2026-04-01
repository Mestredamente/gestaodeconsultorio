import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { email, role_name, clinic_id, clinic_name } = await req.json()
    const token = crypto.randomUUID()
    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + 7)
    
    const { data: roleData } = await supabase.from('roles').select('id').eq('name', role_name).single()
    if (!roleData) throw new Error('Role não encontrado')

    await supabase.from('invitation_links').insert({
      clinic_id,
      role_id: roleData.id,
      email,
      token,
      expires_at: expires_at.toISOString()
    })
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      const origin = req.headers.get('origin') || 'https://gestaodeconsultorio.goskip.app'
      const joinLink = `${origin}/join/${token}`
      
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Gestão de Consultório <onboarding@resend.dev>',
          to: [email],
          subject: `Convite para se juntar à clínica ${clinic_name}`,
          html: `<p>Você foi convidado para se juntar à equipe da clínica <strong>${clinic_name}</strong>.</p><p><a href="${joinLink}">Clique aqui para criar sua conta e acessar o sistema</a></p><p>Este link expira em 7 dias.</p>`
        })
      })
    } else {
      console.log('RESEND_API_KEY missing. Mocking email send.')
    }

    return new Response(JSON.stringify({ success: true, token }), { headers: { ...corsHeaders, 'Content-Type': 'application/json'} })
  } catch(e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json'} })
  }
})
