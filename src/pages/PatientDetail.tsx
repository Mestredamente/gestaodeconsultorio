import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
} from 'lucide-react'
import PatientEditForm from '@/components/PatientEditForm'
import WhatsAppBillingDialog from '@/components/WhatsAppBillingDialog'

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
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const fetchPatient = async () => {
    setLoading(true)
    const { data } = await supabase.from('pacientes').select('*').eq('id', id).single()
    if (data) setPatient(data)
    setLoading(false)
  }

  useEffect(() => {
    if (id) fetchPatient()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!patient) return <div className="text-center py-20">Paciente não encontrado.</div>

  const formatBRL = (val: number) =>
    Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const initial = patient.nome.charAt(0).toUpperCase()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Button
        variant="ghost"
        onClick={() => navigate('/pacientes')}
        className="gap-2 -ml-4 text-slate-500"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para lista
      </Button>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="bg-primary/5 h-24 w-full"></div>
        <CardContent className="px-6 pb-6 relative pt-0">
          <Avatar className="w-20 h-20 border-4 border-white absolute -top-10 shadow-sm">
            <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{patient.nome}</h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Phone className="w-4 h-4" /> {patient.telefone || 'Sem telefone'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <WhatsAppBillingDialog pacienteId={patient.id} patientName={patient.nome} />
              {!isEditing && (
                <Button
                  variant="outline"
                  className="gap-2 flex-1 sm:flex-none"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="w-4 h-4" /> Editar
                </Button>
              )}
              <Button
                className="gap-2 flex-1 sm:flex-none"
                onClick={() => navigate(`/pacientes/${id}/prontuario`)}
              >
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
        <div className="space-y-6 animate-fade-in">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-lg">Informações Demográficas</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                label="Valor da Sessão"
                value={patient.valor_sessao ? formatBRL(patient.valor_sessao) : ''}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-lg text-rose-600 flex items-center gap-2">
                <HeartPulse className="w-5 h-5" /> Contato de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={Phone}
                label="Nome do Contato"
                value={patient.contato_emergencia_nome}
              />
              <InfoItem
                icon={Phone}
                label="Telefone de Emergência"
                value={patient.contato_emergencia_telefone}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
