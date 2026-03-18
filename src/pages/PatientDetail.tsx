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
        .select('id, data_hora, status_whatsapp_lembrete')
        .eq('paciente_id', id)
        .gte('data_hora', new Date().toISOString())
        .order('data_hora', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (aptData) setNextAppt(aptData)
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
          {nextAppt && (
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-4 flex items-center justify-between bg-slate-50/50">
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
                <div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-full shadow-sm cursor-help">
                          <span className="text-xs font-medium text-slate-600 hidden sm:inline-block">
                            Lembrete
                          </span>
                          {nextAppt.status_whatsapp_lembrete === 'enviado' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : nextAppt.status_whatsapp_lembrete === 'falha' ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <MessageCircle className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Status do Lembrete:{' '}
                          <span className="font-semibold capitalize">
                            {nextAppt.status_whatsapp_lembrete || 'pendente'}
                          </span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          )}

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
