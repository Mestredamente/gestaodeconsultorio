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

export default function Agenda() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<any[]>([])
  const [externalEvents, setExternalEvents] = useState<any[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
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

  const [blockData, setBlockData] = useState({ data_inicio: '', data_fim: '', descricao: '' })

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
        `id, data_hora, status, especialidade, valor_total, tipo_pagamento, status_nota_fiscal, paciente_id, justificativa_falta, is_online, status_whatsapp_lembrete, pacientes (id, nome, valor_sessao, telefone)`,
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
            titulo: 'Compromisso Externo (Sincronizado)',
            pacientes: { nome: 'Bloqueio Externo' },
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

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    const baseDate = new Date(formData.data_hora)
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
      if (usrSettings?.whatsapp_confirmacao_ativa && inserted && inserted.length > 0) {
        supabase.functions.invoke('enviar_lembrete_consulta', {
          body: { agendamento_id: inserted[0].id },
        })
      }
      toast({
        title:
          count > 1 ? `${count} sessões agendadas com sucesso!` : 'Agendamento salvo com sucesso!',
      })
      setIsNewModalOpen(false)
    }
    setIsSubmitting(false)
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
          await supabase
            .from('financeiro')
            .insert({
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
      Endereco: 'Consultório Principal', // Pode ser melhorado se endereço salvo
    })
    const link = generateWhatsAppLink(pInfo.telefone, msg, usrSettings?.whatsapp_tipo || 'personal')
    window.open(link, '_blank')
  }

  const getDaysForView = () => {
    if (view === 'daily') return [currentDate]
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
          className="bg-slate-50 border-l-4 border-indigo-400 opacity-80 shadow-none border-t-0 border-r-0 border-b-0"
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-slate-200 min-w-[70px] py-2 rounded-lg text-center border border-slate-300 shrink-0">
              <span className="font-bold text-slate-600 text-lg">{timeStr}</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700">{item.pacientes.nome}</h3>
              <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
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
        <CardContent className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start lg:items-center gap-5 w-full lg:w-auto">
            <div className="bg-slate-50 min-w-[70px] py-2 rounded-lg flex flex-col items-center justify-center border border-slate-100 shrink-0 group">
              <span className="font-bold text-slate-700 text-lg leading-none mb-1">{timeStr}</span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-lg text-slate-900">{patientName}</h3>
                {apt.especialidade && (
                  <Badge variant="secondary" className="text-xs">
                    {apt.especialidade}
                  </Badge>
                )}
                {apt.is_online && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 gap-1"
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
              <p className="text-sm text-slate-500 font-medium">Valor: {valueStr}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
            {apt.status === 'confirmado' && usrSettings?.pre_consulta_ativa && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                onClick={() => sendPreConsulta(apt)}
              >
                <Send className="w-4 h-4" /> Pré-Consulta
              </Button>
            )}
            {(apt.status === 'agendado' || apt.status === 'confirmado') && apt.is_online && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                onClick={() => navigate(`/consulta-online/${apt.id}`)}
              >
                <Video className="w-4 h-4" /> Entrar
              </Button>
            )}
            <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>
            <Button
              size="icon"
              variant="outline"
              className={cn(
                'hover:bg-emerald-50',
                apt.status === 'compareceu' && 'bg-emerald-50 border-emerald-200',
              )}
              onClick={() => handleUpdateStatus(apt, 'compareceu')}
            >
              <Check className="w-5 h-5 text-emerald-500" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className={cn(
                'hover:bg-red-50',
                apt.status === 'faltou' && 'bg-red-50 border-red-200',
              )}
              onClick={() => handleUpdateStatus(apt, 'faltou')}
            >
              <X className="w-5 h-5 text-red-500" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className={cn(
                'hover:bg-amber-50 font-bold text-amber-500',
                apt.status === 'desmarcou' && 'bg-amber-50 border-amber-200',
              )}
              onClick={() => handleUpdateStatus(apt, 'desmarcou')}
            >
              D
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-1 bg-white border rounded-md shadow-sm p-1">
            <Button variant="ghost" size="icon" onClick={prevPeriod} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="h-8 min-w-[140px] font-medium px-2 capitalize">
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
            className="bg-white border rounded-md shadow-sm"
          >
            <TabsList className="h-10 p-1 bg-transparent">
              <TabsTrigger value="daily">Dia</TabsTrigger>
              <TabsTrigger value="weekly">Semana</TabsTrigger>
              <TabsTrigger value="monthly">Mês</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsBlockModalOpen(true)}
            className="gap-2 text-slate-600"
          >
            <Lock className="w-4 h-4" /> Bloquear Horário
          </Button>
          <Button onClick={() => setIsNewModalOpen(true)} className="gap-2 rounded-full shadow-sm">
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
          {view === 'monthly' ? (
            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((wd) => (
                <div
                  key={wd}
                  className="text-center font-bold text-xs text-slate-400 py-2 uppercase"
                >
                  {wd}
                </div>
              ))}
              {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {getDaysForView().map((d) => {
                const dayAppts = [...appointments, ...externalEvents, ...blocks].filter((a) => {
                  if (a.data_hora) return isSameDay(new Date(a.data_hora), d)
                  if (a.data_inicio) return isSameDay(new Date(a.data_inicio), d)
                  return false
                })
                return (
                  <div
                    key={d.toISOString()}
                    onClick={() => {
                      setCurrentDate(d)
                      setView('daily')
                    }}
                    className={cn(
                      'border border-slate-200 rounded-lg p-2 min-h-[80px] bg-white cursor-pointer hover:bg-slate-50 transition-colors',
                      isSameDay(d, new Date()) && 'ring-2 ring-primary ring-offset-1',
                    )}
                  >
                    <div
                      className={cn(
                        'font-bold text-sm text-right',
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
                            'w-2 h-2 rounded-full',
                            a.data_inicio
                              ? 'bg-slate-400'
                              : a.status === 'external'
                                ? 'bg-indigo-400'
                                : 'bg-primary',
                          )}
                        />
                      ))}
                      {dayAppts.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          +{dayAppts.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-8">
              {getDaysForView().map((d) => {
                const dayAppts = appointments.filter((a) => isSameDay(new Date(a.data_hora), d))
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
                  <div key={d.toISOString()} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Confirmar Bloqueio'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Appointment Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
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
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Agendamento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
