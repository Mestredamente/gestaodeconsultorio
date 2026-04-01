import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { titulo, conteudo, tipo, objetivo_terapeutico } = await req.json()

    // Registra a campanha no banco
    const { data: campanha, error: campError } = await supabase
      .from('comunicacoes_campanhas')
      .insert({ usuario_id: user.id, titulo, conteudo, tipo })
      .select()
      .single()

    if (campError) throw campError

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Busca emails dos pacientes do usuário logado
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id, email, nome')
      .eq('usuario_id', user.id)
      .not('email', 'is', null)

    const { data: agendamentos } = await supabase
      .from('agendamentos')
      .select('paciente_id')
      .eq('usuario_id', user.id)
      .gte('data_hora', ninetyDaysAgo.toISOString())

    let activePatientIds = new Set(agendamentos?.map(a => a.paciente_id) || [])

    // Lógica para filtrar por objetivo (Dynamic Newsletter). Em um cenário real, 
    // os prontuários ou a tabela de pacientes teriam uma flag `objetivo_terapeutico`.
    // Aqui usamos uma simulação que checaria o histórico ou simplesmente pegaria todos se for 'all'.
    if (objetivo_terapeutico && objetivo_terapeutico !== 'all') {
      const { data: prontuarios } = await supabase
        .from('prontuarios')
        .select('paciente_id, queixa_principal')
        .eq('usuario_id', user.id)
        .ilike('queixa_principal', `%${objetivo_terapeutico}%`)
      
      const filteredSet = new Set(prontuarios?.map(p => p.paciente_id) || [])
      // Intersection
      activePatientIds = new Set([...activePatientIds].filter(x => filteredSet.has(x)))
    }

    const validPatients = (pacientes || []).filter(p => p.email && p.email.trim() !== '' && activePatientIds.has(p.id))

    // Simulando o delay do envio
    await new Promise(resolve => setTimeout(resolve, 500))

    // Log de auditoria da ação
    await supabase.from('logs_auditoria').insert({
      usuario_id: user.id,
      acao: 'SEND_MASS_EMAIL',
      tabela_afetada: 'comunicacoes_campanhas',
      registro_id: campanha.id,
      detalhes: { recipients_count: validPatients.length, titulo, action: 'Mock Send', filter: objetivo_terapeutico }
    })

    return new Response(JSON.stringify({ success: true, count: validPatients.length, campanha }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

