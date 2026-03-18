import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ArrowLeft,
  FileText,
  Calendar,
  Mail,
  MapPin,
  DollarSign,
  HeartPulse,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  TrendingUp,
} from 'lucide-react'
import PatientEditForm from '@/components/PatientEditForm'
import PatientHeader from '@/components/PatientHeader'

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
  const navigate = useNavigate()
  const [patient, setPatient] = useState<any>(null)
  const [template, setTemplate] = useState<any[]>([])
  const [nextAppt, setNextAppt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [financeSummary, setFinanceSummary] = useState({ recebido: 0, a_receber: 0 })

  const fetchPatient = async () => {
    const { data } = await supabase.from('pacientes').select('*').eq('id', id).single()
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

      let totalR = 0,
        totalP = 0
      finData?.forEach((f) => {
        totalR += Number(f.valor_recebido)
        totalP += Number(f.valor_a_receber)
      })
      setFinanceSummary({ recebido: totalR, a_receber: totalP })
    }
  }

  useEffect(() => {
    if (id) {
      setLoading(true)
      fetchPatient().then(() => setLoading(false))
    }
  }, [id])

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  if (!patient) return <div className="text-center py-20">Paciente não encontrado.</div>

  const formatBRL = (val: number) =>
    Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <Button
        variant="ghost"
        onClick={() => navigate('/pacientes')}
        className="gap-2 -ml-4 text-slate-500"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <PatientHeader
        patient={patient}
        onUpdate={setPatient}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
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
        <div className="space-y-6">
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
                    <span className="text-xs text-slate-500 font-medium">Status da Sessão:</span>
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
                  <FileText className="w-5 h-5 text-primary" /> Respostas da Anamnese Digital
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
        </div>
      )}
    </div>
  )
}
