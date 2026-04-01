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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Cabeçalho de autorização ausente')

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !adminUser) throw new Error('Não autorizado')

    const { usuario_id } = await req.json()

    // Verifica se o usuario alvo é filho do admin
    const { data: targetUser } = await supabase
      .from('usuarios')
      .select('parent_id')
      .eq('id', usuario_id)
      .single()

    if (!targetUser || targetUser.parent_id !== adminUser.id) {
      throw new Error('Você não tem permissão para excluir este usuário.')
    }

    // Exclui o usuário do auth.users
    const { error: deleteError } = await supabase.auth.admin.deleteUser(usuario_id)
    if (deleteError) throw deleteError

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
