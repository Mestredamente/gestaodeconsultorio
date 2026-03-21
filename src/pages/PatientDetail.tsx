import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import NewPatientForm from '@/components/NewPatientForm'
import PatientEditForm from '@/components/PatientEditForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  UserRound,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  FileText,
  ExternalLink,
  Info,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatBRL } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export default function PatientDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(id !== 'novo')
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPatient = async () => {
    if (!user || id === 'novo') return
    setLoading(true)
    const { data, error } = await supabase
      .from('pacientes')
      .select('*, convenios(nome)')
      .eq('id', id)
      .single()

    if (error) {
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' })
      navigate('/pacientes')
    } else {
      setPatient(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPatient()
  }, [id, user])

  const handleDelete = async () => {
    setIsDeleting(true)
    const { error } = await supabase.from('pacientes').delete().eq('id', id)
    setIsDeleting(false)
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Paciente excluído com sucesso' })
      navigate('/pacientes')
    }
  }

  if (id === 'novo') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/pacientes')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Novo Paciente</h1>
            <p className="text-slate-500">Cadastre as informações completas do paciente.</p>
          </div>
        </div>
        <NewPatientForm />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!patient) return null

  if (isEditing) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(false)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Editar Paciente</h1>
        </div>
        <PatientEditForm
          patient={patient}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false)
            fetchPatient()
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/pacientes')}
            className="rounded-full bg-slate-100 hover:bg-slate-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {patient.nome}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {patient.cpf && (
                <Badge variant="secondary" className="font-mono text-xs rounded-md">
                  {patient.cpf}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 rounded-md"
              >
                Ativo
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="gap-2 rounded-xl flex-1 sm:flex-none"
            onClick={() => navigate(`/pacientes/${patient.id}/prontuario`)}
          >
            <FileText className="w-4 h-4" /> Prontuário
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl flex-1 sm:flex-none"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="w-4 h-4" /> Editar
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4" /> Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] shadow-sm border-slate-100 md:col-span-2">
          <CardContent className="p-8 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Informações de Contato
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Telefone</p>
                    <p className="font-semibold text-slate-800">
                      {patient.telefone || 'Não informado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500 font-medium">E-mail</p>
                    <p className="font-semibold text-slate-800 truncate">
                      {patient.email || 'Não informado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Nascimento</p>
                    <p className="font-semibold text-slate-800">
                      {patient.data_nascimento
                        ? new Date(patient.data_nascimento).toLocaleDateString('pt-BR')
                        : 'Não informado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Endereço</p>
                    <p className="font-semibold text-slate-800 text-sm leading-tight">
                      {patient.endereco || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Contato de Emergência
              </h3>
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-amber-900">
                    {patient.contato_emergencia_nome || 'Não cadastrado'}
                  </p>
                  <p className="text-amber-700 font-medium">
                    {patient.contato_emergencia_telefone || 'Sem telefone'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] shadow-sm border-slate-100 bg-indigo-50/30">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-4">
                Dados Financeiros
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Valor da Sessão</p>
                  <p className="text-2xl font-extrabold text-indigo-900">
                    {formatBRL(patient.valor_sessao || 0)}
                  </p>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-indigo-100/50">
                  <span className="text-sm text-slate-500 font-medium">Frequência</span>
                  <Badge
                    variant="outline"
                    className="capitalize bg-white border-indigo-200 text-indigo-700"
                  >
                    {patient.frequencia_pagamento}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-indigo-100/50">
                  <span className="text-sm text-slate-500 font-medium">Dia de Pagamento</span>
                  <span className="font-bold text-slate-800">{patient.dia_pagamento || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Convênio</span>
                  <span className="font-bold text-slate-800 text-right">
                    {patient.convenios?.nome || 'Particular'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] shadow-sm border-slate-100">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Acessos
              </h3>
              <Button
                variant="outline"
                className="w-full justify-between rounded-xl h-12"
                onClick={() => window.open(`/portal/${patient.hash_anamnese}`, '_blank')}
              >
                <span className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-primary" /> Portal do Paciente
                </span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">Excluir Paciente</DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Tem certeza que deseja excluir o paciente{' '}
              <span className="font-bold text-slate-900">{patient.nome}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-xl text-sm text-red-800 border border-red-100 my-2 flex gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Esta ação é irreversível. Todos os agendamentos, prontuários e históricos financeiros
              vinculados a este paciente serão permanentemente apagados do sistema.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="rounded-xl h-11"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl h-11 px-8"
            >
              {isDeleting ? 'Excluindo...' : 'Sim, Excluir Paciente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  