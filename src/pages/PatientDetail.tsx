import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  UserRound,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Activity,
  Edit,
  ExternalLink,
  Printer,
} from 'lucide-react'
import PatientEditForm from '@/components/PatientEditForm'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [patient, setPatient] = useState<any>(null)
  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const fetchPatientData = async () => {
    if (!id) return
    setLoading(true)
    const { data: pData } = await supabase.from('pacientes').select('*').eq('id', id).single()
    if (pData) setPatient(pData)

    const { data: aData } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('paciente_id', id)
      .order('data_hora', { ascending: false })
    if (aData) setAgendamentos(aData)

    setLoading(false)
  }

  useEffect(() => {
    fetchPatientData()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!patient) {
    return <div className="text-center py-20 text-slate-500">Paciente não encontrado.</div>
  }

  const proximaSessao = agendamentos.find(
    (a) => new Date(a.data_hora) >= new Date() && a.status === 'agendado',
  )
  const portalLink = `${window.location.origin}/portal/${patient.hash_anamnese}`

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            padding: 40px;
            box-sizing: border-box;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      {/* Print View Layout */}
      <div id="print-section" className="hidden print:block">
        <div className="mb-8 border-b border-slate-300 pb-4">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-900">
            Ficha do Paciente
          </h1>
        </div>

        <div className="space-y-8 text-base">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 border-b border-slate-200 pb-2">
              Dados Pessoais
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <strong className="text-slate-500 mr-2">Nome:</strong> {patient.nome}
              </div>
              <div>
                <strong className="text-slate-500 mr-2">CPF:</strong>{' '}
                {patient.cpf || 'Não informado'}
              </div>
              <div>
                <strong className="text-slate-500 mr-2">Data de Nascimento:</strong>{' '}
                {patient.data_nascimento
                  ? new Date(patient.data_nascimento).toLocaleDateString('pt-BR', {
                      timeZone: 'UTC',
                    })
                  : 'Não informada'}
              </div>
              <div>
                <strong className="text-slate-500 mr-2">Telefone:</strong>{' '}
                {patient.telefone || 'Não informado'}
              </div>
              <div className="col-span-2">
                <strong className="text-slate-500 mr-2">Email:</strong>{' '}
                {patient.email || 'Não informado'}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 border-b border-slate-200 pb-2">
              Endereço
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="col-span-2">
                <strong className="text-slate-500 mr-2">Rua:</strong> {patient.rua || 'N/A'}
              </div>
              <div>
                <strong className="text-slate-500 mr-2">Número:</strong> {patient.numero || 'N/A'}
              </div>
              <div>
                <strong className="text-slate-500 mr-2">Bairro:</strong> {patient.bairro || 'N/A'}
              </div>
              <div>
                <strong className="text-slate-500 mr-2">Cidade/UF:</strong>{' '}
                {patient.cidade ? `${patient.cidade} - ${patient.estado}` : 'N/A'}
              </div>
              <div>
                <strong className="text-slate-500 mr-2">CEP:</strong> {patient.cep || 'N/A'}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 border-b border-slate-200 pb-2">
              Informações Clínicas e Financeiras
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <strong className="text-slate-500 mr-2">Valor da Sessão:</strong>{' '}
                {patient.valor_sessao
                  ? `R$ ${Number(patient.valor_sessao).toFixed(2).replace('.', ',')}`
                  : 'Não definido'}
              </div>
              <div>
                <strong className="text-slate-500 mr-2">Frequência de Pagamento:</strong>{' '}
                <span className="capitalize">{patient.frequencia_pagamento}</span>
              </div>
              {patient.dia_pagamento && (
                <div>
                  <strong className="text-slate-500 mr-2">Dia de Vencimento:</strong>{' '}
                  {patient.dia_pagamento}
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 border-b border-slate-200 pb-2">
              Contato de Emergência
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <strong className="text-slate-500 mr-2">Nome:</strong>{' '}
                {patient.contato_emergencia_nome || 'N/A'}
              </div>
              <div>
                <strong className="text-slate-500 mr-2">Telefone:</strong>{' '}
                {patient.contato_emergencia_telefone || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/pacientes')}
            className="text-slate-500 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex flex-wrap items-center gap-3">
              {patient.nome}
              {patient.convenio_id && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Convênio
                </Badge>
              )}
            </h1>
            <p className="text-slate-500 flex flex-wrap items-center gap-4 mt-1 text-sm">
              {patient.telefone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {patient.telefone}
                </span>
              )}
              {patient.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {patient.email}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => window.print()} className="gap-2">
              <Printer className="w-4 h-4" /> Imprimir Ficha
            </Button>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                <Edit className="w-4 h-4" /> Editar
              </Button>
            )}
            <Button onClick={() => navigate(`/pacientes/${id}/prontuario`)} className="gap-2">
              <Activity className="w-4 h-4" /> Abrir Prontuário
            </Button>
          </div>
        </div>

        {isEditing ? (
          <PatientEditForm
            patient={patient}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false)
              fetchPatientData()
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-slate-500" /> Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="text-slate-500 font-medium block mb-1">CPF</span>
                    <span className="text-slate-900">{patient.cpf || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block mb-1">
                      Data de Nascimento
                    </span>
                    <span className="text-slate-900">
                      {patient.data_nascimento
                        ? new Date(patient.data_nascimento).toLocaleDateString('pt-BR', {
                            timeZone: 'UTC',
                          })
                        : 'Não informada'}
                    </span>
                  </div>
                  {patient.endereco && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 font-medium block mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Endereço Completo
                      </span>
                      <span className="text-slate-900">
                        {patient.rua}, {patient.numero}
                        {patient.complemento ? ` - ${patient.complemento}` : ''}
                        <br />
                        {patient.bairro} - {patient.cidade}/{patient.estado}
                        <br />
                        CEP: {patient.cep}
                      </span>
                    </div>
                  )}
                  {(patient.contato_emergencia_nome || patient.contato_emergencia_telefone) && (
                    <div className="sm:col-span-2 bg-red-50 p-3 rounded-md border border-red-100 mt-2">
                      <span className="text-red-800 font-semibold block mb-1">
                        Contato de Emergência
                      </span>
                      <span className="text-red-900">
                        {patient.contato_emergencia_nome} - {patient.contato_emergencia_telefone}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="agendamentos" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
                  <TabsTrigger value="portal">Portal do Paciente</TabsTrigger>
                </TabsList>
                <TabsContent value="agendamentos" className="mt-4 space-y-3">
                  {agendamentos.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 border border-dashed rounded-lg bg-slate-50">
                      Nenhum agendamento encontrado para este paciente.
                    </div>
                  ) : (
                    agendamentos.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-primary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center shrink-0 ${new Date(a.data_hora) > new Date() ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}
                          >
                            <span className="text-sm font-bold leading-tight">
                              {new Date(a.data_hora).getDate()}
                            </span>
                            <span className="text-[10px] uppercase font-semibold leading-none">
                              {new Date(a.data_hora).toLocaleString('pt-BR', { month: 'short' })}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {new Date(a.data_hora).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">
                              {a.especialidade || 'Consulta'}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            a.status === 'agendado'
                              ? 'default'
                              : a.status === 'compareceu'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="capitalize"
                        >
                          {a.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </TabsContent>
                <TabsContent value="portal" className="mt-4">
                  <Card className="border-indigo-100 shadow-sm bg-indigo-50/30">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ExternalLink className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-900">
                          Portal do Paciente
                        </h3>
                        <p className="text-sm text-indigo-700 mt-1 max-w-md mx-auto">
                          Compartilhe este link com o paciente para que ele possa acessar seus
                          agendamentos, documentos e avaliações.
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center max-w-md mx-auto">
                        <Input
                          value={portalLink}
                          readOnly
                          className="bg-white border-indigo-200 focus-visible:ring-indigo-500 text-sm font-mono"
                        />
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(portalLink)
                            toast({ title: 'Link copiado!' })
                          }}
                          className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
                        >
                          Copiar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" /> Próxima Sessão
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  {proximaSessao ? (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary mb-1">
                        {new Date(proximaSessao.data_hora).toLocaleDateString('pt-BR', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-lg font-medium text-slate-700">
                        {new Date(proximaSessao.data_hora).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Nenhuma sessão futura agendada.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Valor da Sessão</span>
                    <span className="font-semibold text-slate-900">
                      {patient.valor_sessao
                        ? `R$ ${Number(patient.valor_sessao).toFixed(2).replace('.', ',')}`
                        : 'Não definido'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Frequência</span>
                    <span className="font-medium text-slate-900 capitalize">
                      {patient.frequencia_pagamento}
                    </span>
                  </div>
                  {patient.dia_pagamento && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Dia de Vencimento</span>
                      <span className="font-medium text-slate-900">
                        Dia {patient.dia_pagamento}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
