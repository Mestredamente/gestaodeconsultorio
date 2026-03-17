import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Edit3,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  HeartPulse,
  Copy,
  Link as LinkIcon,
} from 'lucide-react'
import PatientEditForm from '@/components/PatientEditForm'
import WhatsAppBillingDialog from '@/components/WhatsAppBillingDialog'
import SendContractDialog from '@/components/SendContractDialog'
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
  const navigate = useNavigate()
  const { toast } = useToast()
  const [patient, setPatient] = useState<any>(null)
  const [template, setTemplate] = useState<any[]>([])
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
  const copyLink = (path: string, msg: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${path}/${patient.hash_anamnese}`)
    toast({ title: msg })
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <Button
        variant="ghost"
        onClick={() => navigate('/pacientes')}
        className="gap-2 -ml-4 text-slate-500"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 h-32 w-full"></div>
        <CardContent className="px-6 pb-6 relative pt-0">
          <Avatar className="w-24 h-24 border-4 border-white absolute -top-12 shadow-sm bg-white">
            <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
              {patient.nome.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="mt-14 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{patient.nome}</h1>
                {patient.contrato_aceito ? (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none shadow-none">
                    Contrato Aceito
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    Contrato Pendente
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4" /> {patient.telefone || 'Sem telefone'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <SendContractDialog
                patientName={patient.nome}
                patientPhone={patient.telefone}
                hash={patient.hash_anamnese}
                accepted={patient.contrato_aceito}
              />
              <WhatsAppBillingDialog pacienteId={patient.id} patientName={patient.nome} />
              <Button
                variant="outline"
                className="gap-2 text-indigo-600 border-indigo-200 bg-indigo-50/50"
                onClick={() => copyLink('portal', 'Link do Portal copiado!')}
              >
                <LinkIcon className="w-4 h-4" /> Portal
              </Button>
              {!isEditing && (
                <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4" /> Editar
                </Button>
              )}
              <Button className="gap-2" onClick={() => navigate(`/pacientes/${id}/prontuario`)}>
                <FileText className="w-4 h-4" /> Prontuário
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
