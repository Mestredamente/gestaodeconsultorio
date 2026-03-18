import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  ArrowLeft,
  FileText,
  Calendar,
  Mail,
  MapPin,
  DollarSign,
  HeartPulse,
  TrendingUp,
  Printer,
  BrainCircuit,
  Send,
  CheckCircle,
  Clock,
} from 'lucide-react'
import PatientEditForm from '@/components/PatientEditForm'
import PatientHeader from '@/components/PatientHeader'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

const InfoItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
    <div className="p-2 bg-white rounded-md shadow-sm text-slate-500 shrink-0">
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-900 break-words">{value || '-'}</p>
    </div>
  </div>
)

export default function PatientDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<any>(null)
  const [template, setTemplate] = useState<any[]>([])
  const [nextAppt, setNextAppt] = useState<any>(null)
  const [prontuario, setProntuario] = useState<any>(null)
  const [testTemplates, setTestTemplates] = useState<any[]>([])
  const [patientTests, setPatientTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [financeSummary, setFinanceSummary] = useState({ recebido: 0, a_receber: 0 })
  const [visibleSessionsCount, setVisibleSessionsCount] = useState(5)

  const fetchPatient = async () => {
    if (!id || !user) return
    const { data } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .eq('usuario_id', user.id)
      .single()
    if (data) {
      setPatient(data)
      const { data: uData } = await supabase
        .from('usuarios')
        .select('anamnese_template')
        .eq('id', data.usuario_id)
        .single()
      if (uData) setTemplate(uData.anamnese_template || [])

      const { data: aptData } = await supabase
        .from('agendamentos')
        .select('id, data_hora, status_whatsapp_lembrete, status')
        .eq('paciente_id', id)
        .eq('usuario_id', user.id)
        .in('status', ['agendado', 'confirmado'])
        .gte('data_hora', new Date().toISOString())
        .order('data_hora', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (aptData) setNextAppt(aptData)

      const { data: finData } = await supabase
        .from('financeiro')
        .select('valor_recebido, valor_a_receber')
        .eq('paciente_id', id)
        .eq('usuario_id', user.id)
      let totalR = 0,
        totalP = 0
      finData?.forEach((f) => {
        totalR += Number(f.valor_recebido)
        totalP += Number(f.valor_a_receber)
      })
      setFinanceSummary({ recebido: totalR, a_receber: totalP })

      const { data: prontData } = await supabase
        .from('prontuarios')
        .select('historico_sessoes')
        .eq('paciente_id', id)
        .eq('usuario_id', user.id)
        .maybeSingle()
      if (prontData) setProntuario(prontData)

      const { data: tTmpl } = await supabase
        .from('templates_documentos')
        .select('id, titulo')
        .eq('usuario_id', user.id)
        .eq('tipo', 'teste')
      if (tTmpl) setTestTemplates(tTmpl)

      const { data: pTsts } = await supabase
        .from('testes_pacientes')
        .select(
          'id, status, data_envio, data_conclusao, respostas_json, templates_documentos(titulo)',
        )
        .eq('paciente_id', id)
        .eq('usuario_id', user.id)
        .order('data_envio', { ascending: false })
      if (pTsts) setPatientTests(pTsts)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchPatient().then(() => setLoading(false))
  }, [id, user])

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 300)
  }

  const sendTest = async (templateId: string) => {
    if (!user || !id) return
    const { error } = await supabase.from('testes_pacientes').insert({
      usuario_id: user.id,
      paciente_id: id,
      template_id: templateId,
    })
    if (!error) {
      toast({ title: 'Teste enviado ao portal do paciente!' })
      fetchPatient()
    } else {
      toast({ title: 'Erro ao enviar', variant: 'destructive' })
    }
  }

  const evolutionData = useMemo(() => {
    if (!prontuario?.historico_sessoes) return []
    return prontuario.historico_sessoes.map((s: any, idx: number) => {
      let humorScore = 5
      if (s.content) {
        const text = s.content.toLowerCase()
        if (
          text.includes('melhora') ||
          text.includes('bem') ||
          text.includes('feliz') ||
          text.includes('progresso') ||
          text.includes('positivo')
        )
          humorScore = 8
        else if (
          text.includes('ansiedade') ||
          text.includes('triste') ||
          text.includes('choro') ||
          text.includes('crise') ||
          text.includes('piora')
        )
          humorScore = 3
        else humorScore = 6
      }
      return {
        session: `Sessão ${idx + 1}`,
        date: new Date(s.date + 'T12:00:00').toLocaleDateString('pt-BR', {
          month: 'short',
          day: 'numeric',
        }),
        progresso: humorScore,
      }
    })
  }, [prontuario])

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  if (!patient) return <div className="text-center py-20">Paciente não encontrado.</div>

  const formatBRL = (val: number) =>
    Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (isPrinting) {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto text-black" style={{ minHeight: '100vh' }}>
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-widest">Prontuário Médico</h1>
          <p className="text-gray-500 mt-2">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="flex items-start gap-6 mb-8">
          {patient.foto_url && (
            <img
              src={patient.foto_url}
              alt={patient.nome}
              className="w-32 h-32 rounded-lg object-cover grayscale"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold mb-2">{patient.nome}</h2>
            <p>
              <strong>CPF:</strong> {patient.cpf || 'Não informado'}
            </p>
            <p>
              <strong>Nascimento:</strong>{' '}
              {patient.data_nascimento
                ? new Date(patient.data_nascimento).toLocaleDateString('pt-BR')
                : 'Não informado'}
            </p>
            <p>
              <strong>Telefone:</strong> {patient.telefone || 'Não informado'}
            </p>
            <p>
              <strong>Email:</strong> {patient.email || 'Não informado'}
            </p>
          </div>
        </div>

        {patient.anamnese && Object.keys(patient.anamnese).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b pb-2 mb-4">Anamnese</h3>
            {Object.entries(patient.anamnese).map(([key, value]) => {
              const label = template.find((t) => t.id === key)?.label || 'Pergunta'
              return (
                <div key={key} className="mb-3">
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-sm whitespace-pre-wrap">{String(value)}</p>
                </div>
              )
            })}
          </div>
        )}

        <div>
          <h3 className="text-xl font-bold border-b pb-2 mb-4">Evolução Clínica</h3>
          {!prontuario?.historico_sessoes || prontuario.historico_sessoes.length === 0 ? (
            <p className="text-gray-500 italic">Nenhum registro clínico encontrado.</p>
          ) : (
            prontuario.historico_sessoes.map((entry: any) => (
              <div key={entry.id} className="mb-6 pb-4 border-b border-gray-200 border-dashed">
                <p className="font-bold text-sm mb-2">
                  {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{entry.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/pacientes')}
          className="gap-2 -ml-4 text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <Button
          variant="outline"
          onClick={handlePrint}
          className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
        >
          <Printer className="w-4 h-4" /> Exportar Prontuário
        </Button>
      </div>

      <PatientHeader
        patient={patient}
        onUpdate={setPatient}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        hasDebt={financeSummary.a_receber > 0}
      />

      {isEditing ? (
        <PatientEditForm
          patient={patient}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false)
            fetchPatient()
          }}
        />
      ) : (
        <Tabs defaultValue="visao" className="w-full">
          <TabsList className="mb-4 bg-white border border-slate-200 shadow-sm p-1">
            <TabsTrigger value="visao">Visão Geral</TabsTrigger>
            <TabsTrigger value="evolucao">Evolução</TabsTrigger>
            <TabsTrigger value="testes">Testes e Escalas</TabsTrigger>
          </TabsList>

          <TabsContent value="visao" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nextAppt ? (
                <Card className="shadow-sm border-slate-200 md:col-span-1">
                  <CardContent className="p-4 h-full flex flex-col justify-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-md shadow-sm text-primary shrink-0 border border-slate-100">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                          Próxima Consulta
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(nextAppt.data_hora).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-3">
                      <span className="text-xs text-slate-500 font-medium">Status:</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${nextAppt.status === 'confirmado' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {nextAppt.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-sm border-slate-200 md:col-span-1 border-dashed bg-transparent">
                  <CardContent className="p-4 h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                    Sem consultas futuras
                  </CardContent>
                </Card>
              )}

              <Card className="shadow-sm border-slate-200 md:col-span-2">
                <CardContent className="p-4 h-full flex flex-col justify-center bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Resumo Financeiro
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                      <p className="text-xs font-medium text-emerald-700 mb-1">Total Recebido</p>
                      <p className="text-lg font-bold text-emerald-900">
                        {formatBRL(financeSummary.recebido)}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg border ${financeSummary.a_receber > 0 ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50/50 border-slate-100'}`}
                    >
                      <p
                        className={`text-xs font-medium mb-1 ${financeSummary.a_receber > 0 ? 'text-rose-700' : 'text-slate-600'}`}
                      >
                        Saldo Pendente
                      </p>
                      <p
                        className={`text-lg font-bold ${financeSummary.a_receber > 0 ? 'text-rose-900' : 'text-slate-900'}`}
                      >
                        {formatBRL(financeSummary.a_receber)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-lg">Informações Demográficas</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoItem
                  icon={Calendar}
                  label="Data de Nascimento"
                  value={
                    patient.data_nascimento
                      ? new Date(patient.data_nascimento).toLocaleDateString('pt-BR')
                      : ''
                  }
                />
                <InfoItem icon={FileText} label="CPF" value={patient.cpf} />
                <InfoItem icon={Mail} label="E-mail" value={patient.email} />
                <InfoItem icon={MapPin} label="Endereço" value={patient.endereco} />
                <InfoItem
                  icon={DollarSign}
                  label="Valor Sessão"
                  value={patient.valor_sessao ? formatBRL(patient.valor_sessao) : ''}
                />
                <InfoItem
                  icon={HeartPulse}
                  label="Contato Emergência"
                  value={`${patient.contato_emergencia_nome || ''} ${patient.contato_emergencia_telefone ? `(${patient.contato_emergencia_telefone})` : ''}`}
                />
              </CardContent>
            </Card>

            {patient.anamnese && Object.keys(patient.anamnese).length > 0 && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Anamnese Digital
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {Object.entries(patient.anamnese).map(([key, value]) => {
                    const label = template.find((t) => t.id === key)?.label || 'Pergunta Excluída'
                    return (
                      <div
                        key={key}
                        className="border-b border-slate-50 pb-3 last:border-0 last:pb-0"
                      >
                        <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
                        <p className="text-slate-900 whitespace-pre-wrap">{String(value)}</p>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="evolucao" className="space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-lg">Evolução Clínica Estimada</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {evolutionData.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    Nenhum dado de sessão registrado.
                  </div>
                ) : (
                  <ChartContainer
                    config={{ progresso: { label: 'Progresso', color: '#6366f1' } }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer>
                      <LineChart
                        data={evolutionData}
                        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          dy={10}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="progresso"
                          stroke="var(--color-progresso)"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="text-lg">Histórico de Sessões</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {!prontuario?.historico_sessoes || prontuario.historico_sessoes.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 border border-dashed rounded-lg">
                    Nenhum registro encontrado.
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {prontuario.historico_sessoes
                        .slice(0, visibleSessionsCount)
                        .map((entry: any, i: number) => (
                          <div
                            key={entry.id || i}
                            className="pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                          >
                            <p className="font-semibold text-sm text-slate-800 mb-1">
                              {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </p>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                              {entry.content}
                            </p>
                          </div>
                        ))}
                    </div>
                    {visibleSessionsCount < prontuario.historico_sessoes.length && (
                      <div className="pt-4 text-center">
                        <Button
                          variant="outline"
                          onClick={() => setVisibleSessionsCount((prev) => prev + 10)}
                        >
                          Carregar mais registros
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testes" className="space-y-4">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" /> Avaliações Psicológicas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-2 mb-6">
                  <select
                    id="templateSelect"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background max-w-[300px]"
                  >
                    <option value="">Selecione um teste...</option>
                    {testTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.titulo}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => {
                      const val = (document.getElementById('templateSelect') as HTMLSelectElement)
                        .value
                      if (val) sendTest(val)
                    }}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" /> Enviar ao Portal
                  </Button>
                </div>

                <div className="space-y-3">
                  {patientTests.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg">
                      Nenhum teste enviado.
                    </div>
                  ) : (
                    patientTests.map((pt) => (
                      <div
                        key={pt.id}
                        className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4"
                      >
                        <div>
                          <h4 className="font-bold text-slate-800">
                            {pt.templates_documentos?.titulo}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Enviado em: {new Date(pt.data_envio).toLocaleDateString('pt-BR')}
                          </p>
                          {pt.status === 'concluido' && (
                            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Concluído em{' '}
                              {new Date(pt.data_conclusao).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <div>
                          {pt.status === 'pendente' ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                              <Clock className="w-3 h-3" /> Aguardando Paciente
                            </span>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      alert(JSON.stringify(pt.respostas_json, null, 2))
                                    }
                                  >
                                    Ver Respostas
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Visualizar respostas do paciente</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
