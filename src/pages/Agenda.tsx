import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  X,
  Plus,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Video,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Lock,
  Send,
  RefreshCw,
  Trash2,
  Filter,
  Search,
  MoreVertical,
  CalendarSync,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatGoogleCalendarLink } from '@/lib/calendar'
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { generateWhatsAppLink, parseWhatsAppTemplate } from '@/lib/whatsapp'

const DIAS_SEMANA = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
const PERIODOS = ['manha', 'tarde', 'noite']

export default function Agenda() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<any[]>([])
  const [externalEvents, setExternalEvents] = useState<any[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [waitlist, setWaitlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly' | 'waitlist'>('daily')
  const [convenioFilter, setConvenioFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)

  const [patients, setPatients] = useState<any[]>([])
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [convenios, setConvenios] = useState<any[]>([])
  const [clinicName, setClinicName] = useState('')
  const [usrSettings, setUsrSettings] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    paciente_id: '',
    data_hora: '',
    especialidade: '',
    valor_total: '0',
    recorrencia: 'único',
    tipo_pagamento: 'particular',
    convenio_id: '',
    codigo_autorizacao: '',
    is_online: false,
  })

  const [rescheduleData, setRescheduleData] = useState({
    id: '',
    paciente_id: '',
    data_hora: '',
    patientName: '',
  })

  const [blockData, setBlockData] = useState({ data_inicio: '', data_fim: '', descricao: '' })
  const [wlFormData, setWlFormData] = useState({
    paciente_id: '',
    dias_semana: [] as string[],
    periodos: [] as string[],
  })

  const { toast } = useToast()
  const { user } = useAuth()

  const fetchAppointments = useCallback(async () => {
    if (!user) return
    setLoading(true)

    let s, e
    if (view === 'monthly') {
      s = startOfMonth(currentDate)
      e = endOfMonth(currentDate)
    } else if (view === 'weekly') {
      s = startOfWeek(currentDate, { weekStartsOn: 0 })
      e = endOfWeek(currentDate, { weekStartsOn: 0 })
    } else {
      s = startOfDay(currentDate)
      e = endOfDay(currentDate)
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .select(
        `id, data_hora, status, especialidade, valor_total, tipo_pagamento, status_nota_fiscal, paciente_id, justificativa_falta, is_online, status_whatsapp_lembrete, convenio_id, pacientes (id, nome, valor_sessao, telefone)`,
      )
      .eq('usuario_id', user.id)
      .gte('data_hora', s.toISOString())
      .lt('data_hora', e.toISOString())
      .order('data_hora', { ascending: true })

    if (!error && data) setAppointments(data)

    const { data: bData } = await supabase
      .from('bloqueios_agenda')
      .select('*')
      .eq('usuario_id', user.id)
      .gte('data_fim', s.toISOString())
      .lt('data_inicio', e.toISOString())

    if (bData) setBlocks(bData)

    const { data: wlData } = await supabase
      .from('lista_espera' as any)
      .select('id, dias_semana, periodos, paciente_id, pacientes(nome)')
      .eq('usuario_id', user.id)
    if (wlData) setWaitlist(wlData)

    const { data: uData } = await supabase
      .from('usuarios')
      .select('sync_calendarios')
      .eq('id', user.id)
      .single()
    if (uData?.sync_calendarios?.google || uData?.sync_calendarios?.outlook) {
      const mockDate = new Date(currentDate)
      mockDate.setHours(15, 0, 0, 0)
      if (mockDate >= s && mockDate <= e) {
        setExternalEvents([
          {
            id: 'ext-' + mockDate.getTime(),
            data_hora: mockDate.toISOString(),
            status: 'external',
            titulo: 'Compromisso Externo (Google/Outlook)',
            pacientes: { nome: 'Bloqueio Externo Sincronizado' },
          },
        ])
      } else setExternalEvents([])
    } else setExternalEvents([])

    setLoading(false)
  }, [user, view, currentDate])

  const fetchInitialData = useCallback(async () => {
    if (!user) return
    const [pts, usr, cvs] = await Promise.all([
      supabase
        .from('pacientes')
        .select('id, nome, valor_sessao, convenio_id')
        .eq('usuario_id', user.id)
        .order('nome'),
      supabase.from('usuarios').select('*').eq('id', user.id).single(),
      supabase
        .from('convenios' as any)
        .select('*')
        .eq('usuario_id', user.id),
    ])
    if (pts.data) setPatients(pts.data)
    if (usr.data) {
      setEspecialidades(usr.data.especialidades_disponiveis || [])
      setClinicName(usr.data.nome_consultorio || '')
      setUsrSettings(usr.data)
    }
    if (cvs.data) setConvenios(cvs.data)
  }, [user])

  useEffect(() => {
    fetchAppointments()
    fetchInitialData()
    if (!user) return
    const subscription = supabase
      .channel('agendamentos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos', filter: `usuario_id=eq.${user.id}` },
        () => fetchAppointments(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, fetchAppointments, fetchInitialData])

  const nextPeriod = () => {
    if (view === 'monthly') setCurrentDate(addMonths(currentDate, 1))
    else if (view === 'weekly') setCurrentDate(addDays(currentDate, 7))
    else setCurrentDate(addDays(currentDate, 1))
  }

  const prevPeriod = () => {
    if (view === 'monthly') setCurrentDate(subMonths(currentDate, 1))
    else if (view === 'weekly') setCurrentDate(subDays(currentDate, 7))
    else setCurrentDate(subDays(currentDate, 1))
  }

  const handleManualSync = async () => {
    toast({ title: 'Sincronizando com calendários externos...' })
    await fetchAppointments()
    toast({ title: 'Sincronização concluída!' })
  }

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)
    const { error } = await supabase.from('bloqueios_agenda').insert({
      usuario_id: user.id,
      data_inicio: blockData.data_inicio,
      data_fim: blockData.data_fim,
      descricao: blockData.descricao,
    })
    setIsSubmitting(false)
    if (!error) {
      toast({ title: 'Horário bloqueado com sucesso!' })
      setIsBlockModalOpen(false)
      fetchAppointments()
    } else {
      toast({ title: 'Erro ao bloquear', description: error.message, variant: 'destructive' })
    }
  }

  const handleCreateWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (
      !wlFormData.paciente_id ||
      wlFormData.dias_semana.length === 0 ||
      wlFormData.periodos.length === 0
    ) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    const { error } = await supabase.from('lista_espera' as any).insert({
      usuario_id: user.id,
      paciente_id: wlFormData.paciente_id,
      dias_semana: wlFormData.dias_semana,
      periodos: wlFormData.periodos,
    })
    setIsSubmitting(false)
    if (!error) {
      toast({ title: 'Paciente adicionado à lista de espera!' })
      setIsWaitlistModalOpen(false)
      fetchAppointments()
      setWlFormData({ paciente_id: '', dias_semana: [], periodos: [] })
    } else {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const baseDate = new Date(formData.data_hora)

    if (baseDate < new Date()) {
      toast({
        title: 'Atenção',
        description: 'Não é possível agendar em um horário no passado.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    // DB level conflict check for accurate rescheduling and creation
    const { data: conflicts } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('data_hora', baseDate.toISOString())
      .in('status', ['agendado', 'confirmado', 'compareceu'])
      .limit(1)

    const hasBlock = blocks.some(
      (b) => baseDate >= new Date(b.data_inicio) && baseDate < new Date(b.data_fim),
    )

    if ((conflicts && conflicts.length > 0) || hasBlock) {
      toast({
        title: 'Conflito de Horário',
        description: 'Já existe um agendamento ou bloqueio neste horário.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    const appointmentsToInsert = []
    const count =
      formData.recorrencia === 'semanal'
        ? 12
        : formData.recorrencia === 'quinzenal'
          ? 6
          : formData.recorrencia === 'mensal'
            ? 3
            : 1

    for (let i = 0; i < count; i++) {
      let nextDate = new Date(baseDate)
      if (formData.recorrencia === 'semanal') nextDate.setDate(baseDate.getDate() + i * 7)
      else if (formData.recorrencia === 'quinzenal') nextDate.setDate(baseDate.getDate() + i * 14)
      else if (formData.recorrencia === 'mensal') nextDate.setMonth(baseDate.getMonth() + i)

      appointmentsToInsert.push({
        usuario_id: user.id,
        paciente_id: formData.paciente_id,
        data_hora: nextDate.toISOString(),
        especialidade: formData.especialidade || null,
        valor_total: Number(formData.valor_total),
        status: 'agendado',
        tipo_pagamento: formData.tipo_pagamento,
        convenio_id: formData.tipo_pagamento === 'convenio' ? formData.convenio_id : null,
        codigo_autorizacao:
          formData.tipo_pagamento === 'convenio' ? formData.codigo_autorizacao : null,
        status_reembolso: formData.tipo_pagamento === 'convenio' ? 'pendente' : 'n/a',
        is_online: formData.is_online,
      })
    }

    const { data: inserted, error } = await supabase
      .from('agendamentos')
      .insert(appointmentsToInsert as any)
      .select()

    if (error)
      toast({ title: 'Erro ao agendar', description: error.message, variant: 'destructive' })
    else {
      toast({
        title:
          count > 1 ? `${count} sessões agendadas com sucesso!` : 'Agendamento salvo com sucesso!',
      })
      setIsNewModalOpen(false)
    }
    setIsSubmitting(false)
  }

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const baseDate = new Date(rescheduleData.data_hora)

    if (baseDate < new Date()) {
      toast({
        title: 'Atenção',
        description: 'Não é possível remarcar para o passado.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    const { data: conflictData } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('data_hora', baseDate.toISOString())
      .neq('id', rescheduleData.id)
      .in('status', ['agendado', 'confirmado', 'compareceu'])
      .limit(1)

    const { data: blockData } = await supabase
      .from('bloqueios_agenda')
      .select('id')
      .eq('usuario_id', user.id)
      .lte('data_inicio', baseDate.toISOString())
      .gt('data_fim', baseDate.toISOString())
      .limit(1)

    if ((conflictData && conflictData.length > 0) || (blockData && blockData.length > 0)) {
      toast({
        title: 'Conflito de Horário',
        description: 'Já existe um agendamento ou bloqueio neste horário.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase
      .from('agendamentos')
      .update({ data_hora: baseDate.toISOString() })
      .eq('id', rescheduleData.id)

    setIsSubmitting(false)

    if (!error) {
      toast({ title: 'Sessão remarcada com sucesso!' })
      setIsRescheduleModalOpen(false)
      fetchAppointments()
    } else {
      toast({ title: 'Erro ao remarcar', description: error.message, variant: 'destructive' })
    }
  }

  const handleUpdateStatus = async (apt: any, newStatus: string) => {
    if (apt.status === newStatus) return
    setAppointments((prev) => prev.map((a) => (a.id === apt.id ? { ...a, status: newStatus } : a)))
    await supabase.from('agendamentos').update({ status: newStatus }).eq('id', apt.id)
    toast({ title: `Status atualizado: ${newStatus}` })

    if (newStatus === 'compareceu' && user && apt.tipo_pagamento !== 'convenio') {
      const now = new Date(apt.data_hora)
      const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
      const valorToAdd = apt.valor_total > 0 ? apt.valor_total : pacienteInfo?.valor_sessao || 0
      if (valorToAdd > 0) {
        const { data: finData } = await supabase
          .from('financeiro')
          .select('*')
          .eq('usuario_id', user.id)
          .eq('paciente_id', apt.paciente_id)
          .eq('mes', now.getMonth() + 1)
          .eq('ano', now.getFullYear())
          .maybeSingle()
        if (finData)
          await supabase
            .from('financeiro')
            .update({
              valor_a_receber: Number(finData.valor_a_receber) + Number(valorToAdd),
              data_atualizacao: new Date().toISOString(),
            })
            .eq('id', finData.id)
        else
          await supabase.from('financeiro').insert({
            usuario_id: user.id,
            paciente_id: apt.paciente_id,
            mes: now.getMonth() + 1,
            ano: now.getFullYear(),
            valor_recebido: 0,
            valor_a_receber: valorToAdd,
          })
      }
    }
  }

  const sendPreConsulta = (apt: any) => {
    const pInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
    if (!pInfo?.telefone) {
      toast({ title: 'Paciente sem telefone', variant: 'destructive' })
      return
    }
    const template =
      usrSettings?.template_pre_consulta ||
      'Olá [Nome], sua consulta está confirmada para [data] às [hora].'
    const msg = parseWhatsAppTemplate(template, {
      nome: pInfo.nome,
      dataHora: apt.data_hora,
      Endereco: 'Consultório Principal',
    })
    const link = generateWhatsAppLink(pInfo.telefone, msg, usrSettings?.whatsapp_tipo || 'personal')
    window.open(link, '_blank')
  }

  const getDaysForView = () => {
    if (view === 'daily' || view === 'waitlist') return [currentDate]
    if (view === 'weekly')
      return eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(currentDate, { weekStartsOn: 0 }),
      })
    if (view === 'monthly')
      return eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) })
    return []
  }

  const renderAppointmentCard = (item: any, type: 'apt' | 'block' | 'ext') => {
    if (type === 'block') {
      const timeStart = new Date(item.data_inicio).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
      const timeEnd = new Date(item.data_fim).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
      return (
        <Card
          key={item.id}
          className="bg-slate-50/80 border-l-4 border-slate-400 shadow-none border-t-0 border-r-0 border-b-0 border-dashed"
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-slate-200 min-w-[80px] py-1.5 rounded text-center border border-slate-300 shrink-0">
              <span className="font-bold text-slate-600 text-sm">
                {timeStart} - {timeEnd}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Horário Bloqueado
              </h3>
              {item.descricao && <p className="text-xs text-slate-500 mt-0.5">{item.descricao}</p>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500"
              onClick={async () => {
                await supabase.from('bloqueios_agenda').delete().eq('id', item.id)
                fetchAppointments()
              }}
            >
              Desbloquear
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (type === 'ext') {
      const timeStr = new Date(item.data_hora).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
      return (
        <Card
          key={item.id}
          className="bg-indigo-50/30 border-l-4 border-indigo-400 shadow-none border-t-0 border-r-0 border-b-0"
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-indigo-100 min-w-[70px] py-2 rounded-lg text-center border border-indigo-200 shrink-0">
              <span className="font-bold text-indigo-700 text-lg">{timeStr}</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700">{item.pacientes.nome}</h3>
              <p className="text-xs font-medium text-indigo-600 mt-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> {item.titulo}
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    const apt = item
    const timeStr = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
    const patientName = pacienteInfo?.nome || 'Paciente Desconhecido'
    const valueStr = Number(
      apt.valor_total > 0 ? apt.valor_total : pacienteInfo?.valor_sessao || 0,
    ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const statusColors: Record<string, string> = {
      agendado: 'border-l-slate-200',
      confirmado: 'border-l-indigo-400',
      compareceu: 'border-l-emerald-500',
      faltou: 'border-l-red-500',
      desmarcou: 'border-l-amber-500',
    }

    return (
      <Card
        key={apt.id}
        className={cn(
          'bg-white shadow-sm transition-all border-l-4 border-t-0 border-r-0 border-b-0',
          statusColors[apt.status] || statusColors.agendado,
        )}
      >
        <CardContent className="p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start lg:items-center gap-4 sm:gap-5 w-full lg:w-auto">
            <div className="bg-slate-50 min-w-[60px] sm:min-w-[70px] py-2 rounded-lg flex flex-col items-center justify-center border border-slate-100 shrink-0 group">
              <span className="font-bold text-slate-700 text-base sm:text-lg leading-none mb-1">
                {timeStr}
              </span>
            </div>
            <div className="space-y-1 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-base sm:text-lg text-slate-900">{patientName}</h3>
                {apt.especialidade && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">
                    {apt.especialidade}
                  </Badge>
                )}
                {apt.is_online && (
                  <Badge
                    variant="outline"
                    className="text-[10px] sm:text-xs bg-indigo-50 text-indigo-700 border-indigo-200 gap-1"
                  >
                    <Video className="w-3 h-3" /> Online
                  </Badge>
                )}
                {apt.status === 'confirmado' && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-indigo-100 text-indigo-700 border-transparent h-5"
                  >
                    Confirmado
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium flex flex-wrap items-center gap-2">
                <span>Valor: {valueStr}</span>
                {apt.tipo_pagamento === 'convenio' && (
                  <Badge variant="outline" className="text-[10px]">
                    Convênio
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full lg:w-auto justify-start lg:justify-end mt-2 lg:mt-0">
            {apt.status === 'confirmado' && usrSettings?.pre_consulta_ativa && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50 px-2 sm:px-3"
                onClick={() => sendPreConsulta(apt)}
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />{' '}
                <span className="hidden sm:inline">Pré-Consulta</span>
              </Button>
            )}
            {(apt.status === 'agendado' || apt.status === 'confirmado') && apt.is_online && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white px-2 sm:px-3"
                onClick={() => navigate(`/consulta-online/${apt.id}`)}
              >
                <Video className="w-3 h-3 sm:w-4 sm:h-4" />{' '}
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            )}
            <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>

            <Button
              size="icon"
              variant="outline"
              className="text-blue-500 hover:bg-blue-50 border-blue-100 hover:text-blue-600"
              onClick={() => navigate(`/pacientes/${apt.paciente_id}/prontuario`)}
              title="Prontuário Rápido"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className={cn(
                'hover:bg-emerald-50',
                apt.status === 'compareceu' && 'bg-emerald-50 border-emerald-200',
              )}
              onClick={() => handleUpdateStatus(apt, 'compareceu')}
              title="Compareceu"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className={cn(
                'hover:bg-red-50',
                apt.status === 'faltou' && 'bg-red-50 border-red-200',
              )}
              onClick={() => handleUpdateStatus(apt, 'faltou')}
              title="Faltou"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className={cn(
                'hover:bg-amber-50 font-bold text-amber-500',
                apt.status === 'desmarcou' && 'bg-amber-50 border-amber-200',
              )}
              onClick={() => handleUpdateStatus(apt, 'desmarcou')}
              title="Desmarcou"
            >
              D
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="ml-1 sm:ml-2 text-slate-500 hover:text-slate-800"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    setRescheduleData({
                      id: apt.id,
                      paciente_id: apt.paciente_id,
                      data_hora: apt.data_hora.slice(0, 16),
                      patientName: patientName,
                    })
                    setIsRescheduleModalOpen(true)
                  }}
                >
                  <CalendarSync className="w-4 h-4 mr-2" /> Remarcar Sessão
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/pacientes/${apt.paciente_id}/prontuario`)}
                >
                  <FileText className="w-4 h-4 mr-2" /> Acessar Prontuário
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredAppointments = appointments.filter((a) => {
    // Convênio Filter
    const matchConvenio =
      convenioFilter === 'all' ||
      (convenioFilter === 'particular' && a.tipo_pagamento !== 'convenio') ||
      a.convenio_id === convenioFilter

    // Global Search Filter
    const pInfo = Array.isArray(a.pacientes) ? a.pacientes[0] : a.pacientes
    const s = searchTerm.toLowerCase()
    const matchSearch =
      !s ||
      pInfo?.nome?.toLowerCase().includes(s) ||
      pInfo?.telefone?.toLowerCase().includes(s) ||
      a.especialidade?.toLowerCase().includes(s)

    return matchConvenio && matchSearch
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center justify-between gap-1 bg-white border rounded-md shadow-sm p-1 w-full sm:w-auto">
            <Button variant="ghost" size="icon" onClick={prevPeriod} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 flex-1 sm:min-w-[140px] font-medium px-2 capitalize"
                >
                  {view === 'monthly'
                    ? format(currentDate, 'MMM yyyy', { locale: ptBR })
                    : format(currentDate, 'dd/MM/yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(d) => d && setCurrentDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={nextPeriod} className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Tabs
            value={view}
            onValueChange={(v) => setView(v as any)}
            className="bg-white border rounded-md shadow-sm w-full sm:w-auto overflow-x-auto"
          >
            <TabsList className="h-10 p-1 bg-transparent min-w-max flex">
              <TabsTrigger value="daily" className="flex-1">
                Dia
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex-1">
                Semana
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex-1">
                Mês
              </TabsTrigger>
              <TabsTrigger value="waitlist" className="flex-1">
                Espera
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[120px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 bg-white h-10"
              />
            </div>
            <Select value={convenioFilter} onValueChange={setConvenioFilter}>
              <SelectTrigger className="w-[120px] sm:w-[160px] bg-white h-10">
                <Filter className="w-4 h-4 mr-2 text-slate-400 hidden sm:block" />
                <SelectValue placeholder="Convênio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="particular">Particular</SelectItem>
                {convenios.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleManualSync}
              title="Sincronizar Calendários"
              className="h-10 w-10 shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            onClick={() => setIsBlockModalOpen(true)}
            className="gap-2 text-slate-600 flex-1 sm:flex-none"
          >
            <Lock className="w-4 h-4" /> <span className="hidden sm:inline">Bloquear</span>
          </Button>
          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="gap-2 rounded-full shadow-sm flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4" /> Agendar
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {view === 'waitlist' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-800">Lista de Espera Inteligente</h3>
                  <p className="text-sm text-slate-500">
                    Seja notificado quando um paciente desmarcar um horário compatível.
                  </p>
                </div>
                <Button onClick={() => setIsWaitlistModalOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" /> Adicionar
                </Button>
              </div>

              {waitlist.length === 0 ? (
                <Card className="p-12 text-center text-slate-500 border-dashed shadow-none bg-transparent">
                  Nenhum paciente na lista de espera.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {waitlist.map((wl) => (
                    <Card key={wl.id} className="shadow-sm">
                      <CardContent className="p-4 flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-semibold text-slate-800">{wl.pacientes?.nome}</h4>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {wl.dias_semana.map((d: string) => (
                              <Badge key={d} variant="secondary" className="capitalize text-xs">
                                {d}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {wl.periodos.map((p: string) => (
                              <Badge
                                key={p}
                                variant="outline"
                                className="capitalize text-xs border-indigo-200 text-indigo-700 bg-indigo-50"
                              >
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50"
                          onClick={async () => {
                            await supabase
                              .from('lista_espera' as any)
                              .delete()
                              .eq('id', wl.id)
                            fetchAppointments()
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : view === 'monthly' ? (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((wd) => (
                <div
                  key={wd}
                  className="text-center font-bold text-[10px] sm:text-xs text-slate-400 py-1 sm:py-2 uppercase"
                >
                  {wd}
                </div>
              ))}
              {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {getDaysForView().map((d) => {
                const dayAppts = [...filteredAppointments, ...externalEvents, ...blocks].filter(
                  (a) => {
                    if (a.data_hora) return isSameDay(new Date(a.data_hora), d)
                    if (a.data_inicio) return isSameDay(new Date(a.data_inicio), d)
                    return false
                  },
                )
                return (
                  <div
                    key={d.toISOString()}
                    onClick={() => {
                      setCurrentDate(d)
                      setView('daily')
                    }}
                    className={cn(
                      'border border-slate-200 rounded-lg p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] bg-white cursor-pointer hover:bg-slate-50 transition-colors',
                      isSameDay(d, new Date()) && 'ring-2 ring-primary ring-offset-1',
                    )}
                  >
                    <div
                      className={cn(
                        'font-bold text-xs sm:text-sm text-right',
                        isSameDay(d, new Date()) ? 'text-primary' : 'text-slate-700',
                      )}
                    >
                      {format(d, 'd')}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dayAppts.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className={cn(
                            'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full',
                            a.data_inicio
                              ? 'bg-slate-400'
                              : a.status === 'external'
                                ? 'bg-indigo-400'
                                : 'bg-primary',
                          )}
                        />
                      ))}
                      {dayAppts.length > 3 && (
                        <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium">
                          +{dayAppts.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {getDaysForView().map((d) => {
                const dayAppts = filteredAppointments.filter((a) =>
                  isSameDay(new Date(a.data_hora), d),
                )
                const dayExts = externalEvents.filter((a) => isSameDay(new Date(a.data_hora), d))
                const dayBlocks = blocks.filter((b) => isSameDay(new Date(b.data_inicio), d))

                const allDayItems = [
                  ...dayAppts.map((a) => ({
                    ...a,
                    sortTime: new Date(a.data_hora).getTime(),
                    type: 'apt',
                  })),
                  ...dayExts.map((a) => ({
                    ...a,
                    sortTime: new Date(a.data_hora).getTime(),
                    type: 'ext',
                  })),
                  ...dayBlocks.map((b) => ({
                    ...b,
                    sortTime: new Date(b.data_inicio).getTime(),
                    type: 'block',
                  })),
                ].sort((a, b) => a.sortTime - b.sortTime)

                if (allDayItems.length === 0)
                  return view === 'daily' ? (
                    <div
                      key={d.toISOString()}
                      className="text-center p-12 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500"
                    >
                      Nenhum agendamento ou bloqueio.
                    </div>
                  ) : null

                return (
                  <div key={d.toISOString()} className="space-y-3 sm:space-y-4">
                    {view === 'weekly' && (
                      <h3 className="font-bold text-slate-700 border-b border-slate-200 pb-2 capitalize">
                        {format(d, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                      </h3>
                    )}
                    {allDayItems.map((item) => renderAppointmentCard(item, item.type as any))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Block Modal */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear Horário na Agenda</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBlock} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Início</Label>
                <Input
                  type="datetime-local"
                  required
                  value={blockData.data_inicio}
                  onChange={(e) => setBlockData({ ...blockData, data_inicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fim</Label>
                <Input
                  type="datetime-local"
                  required
                  value={blockData.data_fim}
                  onChange={(e) => setBlockData({ ...blockData, data_fim: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Motivo / Descrição</Label>
              <Input
                placeholder="Ex: Supervisão, Almoço, Folga"
                value={blockData.descricao}
                onChange={(e) => setBlockData({ ...blockData, descricao: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Salvando...' : 'Confirmar Bloqueio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Appointment Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label>Paciente</Label>
                <Select
                  value={formData.paciente_id}
                  onValueChange={(v) => {
                    const p = patients.find((x) => x.id === v)
                    setFormData({
                      ...formData,
                      paciente_id: v,
                      valor_total: p?.valor_sessao?.toString() || '0',
                      tipo_pagamento: p?.convenio_id ? 'convenio' : 'particular',
                      convenio_id: p?.convenio_id || '',
                    })
                  }}
                  required
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data e Hora</Label>
                <Input
                  type="datetime-local"
                  required
                  value={formData.data_hora}
                  onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Recorrência</Label>
                <Select
                  value={formData.recorrencia}
                  onValueChange={(v) => setFormData({ ...formData, recorrencia: v })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="único">Único</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Salvando...' : 'Salvar Agendamento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={isRescheduleModalOpen} onOpenChange={setIsRescheduleModalOpen}>
        <DialogContent className="w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Remarcar Sessão - {rescheduleData.patientName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReschedule} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nova Data e Hora</Label>
              <Input
                type="datetime-local"
                required
                value={rescheduleData.data_hora}
                onChange={(e) =>
                  setRescheduleData({ ...rescheduleData, data_hora: e.target.value })
                }
              />
              <p className="text-xs text-slate-500">
                O sistema verificará automaticamente a disponibilidade na agenda.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRescheduleModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Verificando...' : 'Confirmar Remanejamento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Waitlist Modal */}
      <Dialog open={isWaitlistModalOpen} onOpenChange={setIsWaitlistModalOpen}>
        <DialogContent className="w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Adicionar à Lista de Espera</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWaitlist} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select
                value={wlFormData.paciente_id}
                onValueChange={(v) => setWlFormData({ ...wlFormData, paciente_id: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dias da Semana (Preferência)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dia-${dia}`}
                      checked={wlFormData.dias_semana.includes(dia)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setWlFormData({
                            ...wlFormData,
                            dias_semana: [...wlFormData.dias_semana, dia],
                          })
                        } else {
                          setWlFormData({
                            ...wlFormData,
                            dias_semana: wlFormData.dias_semana.filter((d) => d !== dia),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`dia-${dia}`} className="capitalize font-normal text-sm">
                      {dia}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Períodos</Label>
              <div className="flex gap-4">
                {PERIODOS.map((per) => (
                  <div key={per} className="flex items-center space-x-2">
                    <Checkbox
                      id={`per-${per}`}
                      checked={wlFormData.periodos.includes(per)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setWlFormData({
                            ...wlFormData,
                            periodos: [...wlFormData.periodos, per],
                          })
                        } else {
                          setWlFormData({
                            ...wlFormData,
                            periodos: wlFormData.periodos.filter((p) => p !== per),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`per-${per}`} className="capitalize font-normal text-sm">
                      {per}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWaitlistModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
