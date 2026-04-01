import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  XCircle,
  Video,
  Loader2,
  Trash2,
  Ban,
  Share2,
  MoreVertical,
} from 'lucide-react'
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, formatBRL } from '@/lib/utils'

export default function Agenda() {
  const { user, userProfile } = useAuth()
  const role = userProfile?.role || 'admin'
  const canCreate = ['admin', 'superadmin', 'secretaria'].includes(role)
  const canEdit = ['admin', 'superadmin', 'secretaria'].includes(role)
  const canDelete = ['admin', 'superadmin'].includes(role)
  const canCancel = ['admin', 'superadmin', 'secretaria'].includes(role)
  const isProfissional = role === 'profissional'
  const { toast } = useToast()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week')

  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    paciente_id: '',
    profissional_id: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    hora: '09:00',
    status: 'agendado',
    is_online: false,
    tipo_pagamento: 'particular',
    valor_total: '',
  })

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [isCanceling, setIsCanceling] = useState(false)

  const fetchAgenda = async () => {
    if (!user) return
    setLoading(true)

    let start, end
    if (viewMode === 'month') {
      start = startOfMonth(currentDate)
      end = endOfMonth(currentDate)
    } else if (viewMode === 'week') {
      start = startOfWeek(currentDate, { weekStartsOn: 0 })
      end = addDays(start, 6)
    } else {
      start = new Date(currentDate)
      start.setHours(0, 0, 0, 0)
      end = new Date(currentDate)
      end.setHours(23, 59, 59, 999)
    }

    const tenantId = userProfile?.parent_id || user.id

    let agendaQuery = supabase
      .from('agendamentos')
      .select('*, pacientes(id, nome, valor_sessao, telefone)')
      .eq('usuario_id', tenantId)
      .gte('data_hora', start.toISOString())
      .lte('data_hora', end.toISOString())

    if (isProfissional) {
      agendaQuery = agendaQuery.eq('profissional_id', user.id)
    }

    const { data } = await agendaQuery.order('data_hora')

    let patsQuery = supabase
      .from('pacientes')
      .select('id, nome, valor_sessao, telefone')
      .eq('usuario_id', tenantId)

    if (isProfissional) {
      patsQuery = patsQuery.eq('profissional_id', user.id)
    }

    const { data: pats } = await patsQuery

    const { data: profs } = await supabase
      .from('usuarios')
      .select('id, nome, role')
      .or(`id.eq.${tenantId},parent_id.eq.${tenantId}`)

    if (data) setAppointments(data)
    if (pats) setPatients(pats)
    if (profs)
      setProfessionals(profs.filter((p: any) => p.role === 'admin' || p.role === 'profissional'))
    setLoading(false)
  }

  useEffect(() => {
    fetchAgenda()
  }, [user, currentDate, viewMode])

  const openNewAppointment = (dateStr?: string, timeStr?: string) => {
    if (!canCreate) return
    setFormData({
      id: '',
      paciente_id: '',
      profissional_id: isProfissional ? user.id : userProfile?.parent_id || user.id,
      data: dateStr || format(currentDate, 'yyyy-MM-dd'),
      hora: timeStr || '09:00',
      status: 'agendado',
      is_online: false,
      tipo_pagamento: 'particular',
      valor_total: '',
    })
    setIsModalOpen(true)
  }

  const openEditAppointment = (apt: any) => {
    if (!canEdit) return
    const d = new Date(apt.data_hora)
    setFormData({
      id: apt.id,
      paciente_id: apt.paciente_id,
      profissional_id: apt.profissional_id || apt.usuario_id,
      data: format(d, 'yyyy-MM-dd'),
      hora: format(d, 'HH:mm'),
      status: apt.status,
      is_online: apt.is_online || false,
      tipo_pagamento: apt.tipo_pagamento || 'particular',
      valor_total: apt.valor_total?.toString() || '',
    })
    setIsModalOpen(true)
  }

  const handlePatientSelect = (pid: string) => {
    const p = patients.find((x) => x.id === pid)
    setFormData({ ...formData, paciente_id: pid, valor_total: p?.valor_sessao?.toString() || '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    const dateTime = new Date(`${formData.data}T${formData.hora}:00`)
    const valorNumber = formData.valor_total
      ? Number(String(formData.valor_total).replace(',', '.'))
      : 0

    const tenantId = userProfile?.parent_id || user.id

    const payload = {
      usuario_id: tenantId,
      profissional_id: formData.profissional_id,
      paciente_id: formData.paciente_id,
      data_hora: dateTime.toISOString(),
      status: formData.status,
      is_online: formData.is_online,
      tipo_pagamento: formData.tipo_pagamento,
      valor_total: valorNumber,
    }

    try {
      if (formData.id) {
        await supabase.from('agendamentos').update(payload).eq('id', formData.id)
        toast({ title: 'Agendamento atualizado!' })
      } else {
        await supabase.from('agendamentos').insert(payload)
        toast({ title: 'Agendamento criado!' })

        // Notify patient
        const p = patients.find((x) => x.id === formData.paciente_id)
        if (p?.telefone) {
          const dateStr = format(dateTime, 'dd/MM/yyyy')
          const timeStr = format(dateTime, 'HH:mm')
          const msg = `Olá ${p.nome}, sua sessão foi agendada para ${dateStr} às ${timeStr}. Confirme sua presença respondendo SIM ou NÃO.`
          const cleanPhone = p.telefone.replace(/\D/g, '')

          await supabase.functions.invoke('enviar_mensagem_whatsapp', {
            body: {
              tipo_whatsapp: 'padrao',
              telefone: cleanPhone,
              mensagem: msg,
              usuario_id: user.id,
            },
          })
        }
      }
      setIsModalOpen(false)
      fetchAgenda()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!appointmentToCancel || !user || !cancelReason.trim()) return
    setIsCanceling(true)

    try {
      const p = Array.isArray(appointmentToCancel.pacientes)
        ? appointmentToCancel.pacientes[0]
        : appointmentToCancel.pacientes

      if (p?.telefone) {
        const dateStr = format(new Date(appointmentToCancel.data_hora), 'dd/MM/yyyy')
        const timeStr = format(new Date(appointmentToCancel.data_hora), 'HH:mm')

        // Offering 3 alternative times as requested
        const d1 = addDays(new Date(appointmentToCancel.data_hora), 1)
        const d2 = addDays(new Date(appointmentToCancel.data_hora), 2)
        const msg = `Olá ${p.nome}, informamos que o seu agendamento para ${dateStr} às ${timeStr} foi cancelado. Que tal reagendar? Opções: 1) ${format(d1, 'dd/MM HH:mm')}, 2) ${format(d2, 'dd/MM HH:mm')}. Responda com o número da opção.`

        const cleanPhone = p.telefone.replace(/\D/g, '')
        await supabase.functions.invoke('enviar_mensagem_whatsapp', {
          body: {
            tipo_whatsapp: 'padrao',
            telefone: cleanPhone,
            mensagem: msg,
            usuario_id: user.id,
          },
        })
      }

      await supabase
        .from('agendamentos')
        .update({
          status: 'desmarcou',
          motivo_cancelamento: cancelReason,
        })
        .eq('id', appointmentToCancel.id)

      await supabase.from('agendamentos').delete().eq('id', appointmentToCancel.id)

      toast({
        title: 'Agendamento cancelado!',
        description: 'O paciente foi notificado do cancelamento.',
        className: 'bg-emerald-500 text-white',
        duration: 3000,
      })
      fetchAgenda()
    } catch (err: any) {
      toast({ title: 'Erro ao cancelar', description: err.message, variant: 'destructive' })
    } finally {
      setIsCanceling(false)
      setIsCancelDialogOpen(false)
      setAppointmentToCancel(null)
      setCancelReason('')
    }
  }

  const updateStatus = async (apt: any, newStatus: string) => {
    try {
      await supabase.from('agendamentos').update({ status: newStatus }).eq('id', apt.id)

      if (newStatus === 'compareceu') {
        const dt = new Date(apt.data_hora)
        const month = dt.getMonth() + 1
        const year = dt.getFullYear()

        const tenantId = userProfile?.parent_id || user?.id
        await supabase.from('financeiro').insert({
          usuario_id: tenantId,
          paciente_id: apt.paciente_id,
          mes: month,
          ano: year,
          valor_a_receber: apt.valor_total || 0,
          valor_recebido: 0,
          status: 'pendente',
        })
        toast({
          title: 'Presença confirmada!',
          description: 'Cobrança gerada com sucesso.',
          className: 'bg-emerald-500 text-white',
          duration: 3000,
        })
      } else {
        toast({ title: `Status atualizado para ${newStatus}`, duration: 3000 })
      }
      fetchAgenda()
    } catch (e: any) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive', duration: 5000 })
    }
  }

  const handleShareLink = async (apt: any) => {
    let link = apt.link_sala_virtual
    if (!link) {
      const res = await supabase.functions.invoke('gerar_link_sala_virtual', {
        body: { agendamento_id: apt.id },
      })
      link = res.data?.link
    }
    if (link) {
      navigator.clipboard.writeText(link)
      const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
      if (p?.telefone) {
        const cleanPhone = p.telefone.replace(/\D/g, '')
        const msg = `Olá ${p.nome}, sua sessão virtual está pronta! Acesse aqui: ${link}. Você entrará em sala de espera até eu aprová-lo.`
        await supabase.functions.invoke('enviar_mensagem_whatsapp', {
          body: {
            tipo_whatsapp: 'padrao',
            telefone: cleanPhone,
            mensagem: msg,
            usuario_id: user?.id,
          },
        })
        toast({ title: 'Link enviado via WhatsApp!' })
      } else {
        toast({ title: 'Link copiado para a área de transferência!' })
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'confirmado':
      case 'compareceu':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'faltou':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'desmarcou':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      default:
        return 'bg-slate-50 text-slate-700'
    }
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 8)
    const dayAppointments = appointments.filter(
      (a) => isSameDay(new Date(a.data_hora), currentDate) && a.status !== 'desmarcou',
    )

    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-slate-800 capitalize">
            {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {hours.map((hour) => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`
            const aptsInHour = dayAppointments.filter(
              (a) => new Date(a.data_hora).getHours() === hour,
            )

            return (
              <div key={hour} className="flex gap-4 group">
                <div className="w-16 text-right text-slate-400 font-medium text-sm pt-2 shrink-0">
                  {timeStr}
                </div>
                <div className="flex-1 min-h-[4rem] border-l-2 border-slate-100 pl-4 py-1 relative">
                  {aptsInHour.length === 0 ? (
                    canCreate ? (
                      <div
                        className="h-full w-full rounded-xl border-2 border-dashed border-transparent group-hover:border-slate-200 flex items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
                        onClick={() =>
                          openNewAppointment(format(currentDate, 'yyyy-MM-dd'), timeStr)
                        }
                      >
                        <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                          <Plus className="w-4 h-4" /> Agendar
                        </span>
                      </div>
                    ) : (
                      <div className="h-full w-full"></div>
                    )
                  ) : (
                    <div className="flex flex-col gap-2">
                      {aptsInHour.map((apt) => {
                        const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                        return (
                          <div
                            key={apt.id}
                            className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group/card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div
                              className="flex items-center gap-3 cursor-pointer flex-1"
                              onClick={() => openEditAppointment(apt)}
                            >
                              <div
                                className={cn(
                                  'w-2 h-10 rounded-full shrink-0',
                                  getStatusColor(apt.status).split(' ')[0],
                                )}
                              ></div>
                              <div>
                                <p className="font-bold text-slate-800">{p?.nome}</p>
                                <div className="flex items-center flex-wrap gap-2 mt-1">
                                  <span className="text-xs text-slate-500 font-medium">
                                    {format(new Date(apt.data_hora), 'HH:mm')}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'text-[10px] py-0 h-4 border',
                                      getStatusColor(apt.status),
                                    )}
                                  >
                                    {apt.status}
                                  </Badge>
                                  {apt.is_online && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] bg-blue-50 text-blue-700 py-0 h-4 gap-1"
                                    >
                                      <Video className="w-3 h-3" /> Online
                                    </Badge>
                                  )}
                                  {apt.valor_total > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] bg-emerald-50 text-emerald-700 py-0 h-4 border-emerald-200"
                                    >
                                      {formatBRL(apt.valor_total)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {/* Mobile Dropdown */}
                              <div className="sm:hidden">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-500"
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                    {apt.is_online && (
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleShareLink(apt)
                                        }}
                                        className="py-2.5"
                                      >
                                        <Share2 className="w-4 h-4 mr-2 text-blue-600" />{' '}
                                        Compartilhar Link
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        updateStatus(apt, 'compareceu')
                                      }}
                                      className="py-2.5"
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />{' '}
                                      Compareceu
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        updateStatus(apt, 'faltou')
                                      }}
                                      className="py-2.5"
                                    >
                                      <XCircle className="w-4 h-4 mr-2 text-amber-600" /> Faltou
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (!canCancel)
                                          return toast({
                                            title: 'Acesso Negado',
                                            variant: 'destructive',
                                          })
                                        setAppointmentToCancel(apt)
                                        setCancelReason('')
                                        setIsCancelDialogOpen(true)
                                      }}
                                      className="text-red-600 focus:bg-red-50 py-2.5"
                                      disabled={!canCancel}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" /> Cancelar Sessão
                                    </DropdownMenuItem>

                                    {canDelete && (
                                      <DropdownMenuItem
                                        onClick={async (e) => {
                                          e.stopPropagation()
                                          if (
                                            confirm('Excluir permanentemente este agendamento?')
                                          ) {
                                            await supabase
                                              .from('agendamentos')
                                              .delete()
                                              .eq('id', apt.id)
                                            toast({ title: 'Excluído' })
                                            fetchAgenda()
                                          }
                                        }}
                                        className="text-red-600 focus:bg-red-50 py-2.5"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" /> Excluir Registro
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {/* Desktop Actions */}
                              <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                {apt.is_online && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleShareLink(apt)
                                    }}
                                    title="Compartilhar Link"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateStatus(apt, 'compareceu')
                                  }}
                                  title="Presença"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 border-red-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateStatus(apt, 'faltou')
                                  }}
                                  title="Falta"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (canCancel) {
                                      setAppointmentToCancel(apt)
                                      setCancelReason('')
                                      setIsCancelDialogOpen(true)
                                    }
                                  }}
                                  title="Cancelado"
                                  disabled={!canCancel}
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {days.map((day, idx) => {
            const dayApts = appointments.filter(
              (a) => isSameDay(new Date(a.data_hora), day) && a.status !== 'desmarcou',
            )
            const isTdy = isToday(day)
            return (
              <div
                key={idx}
                className={cn(
                  'min-h-[200px] sm:min-h-[600px] p-3 flex flex-col transition-colors',
                  isTdy ? 'bg-primary/5' : 'hover:bg-slate-50/50',
                )}
              >
                <div className="text-center mb-4 pb-3 border-b border-slate-100">
                  <p
                    className={cn(
                      'text-xs font-bold uppercase tracking-wider mb-1',
                      isTdy ? 'text-primary' : 'text-slate-500',
                    )}
                  >
                    {format(day, 'EEE', { locale: ptBR })}
                  </p>
                  <div
                    className={cn(
                      'w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold',
                      isTdy ? 'bg-primary text-white shadow-md' : 'text-slate-700',
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {dayApts.length === 0 ? (
                    canCreate ? (
                      <div
                        className="flex-1 border-2 border-dashed border-transparent hover:border-slate-200 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                        onClick={() => openNewAppointment(format(day, 'yyyy-MM-dd'))}
                      >
                        <Plus className="w-4 h-4 text-slate-300" />
                      </div>
                    ) : (
                      <div className="flex-1"></div>
                    )
                  ) : (
                    dayApts.map((apt) => {
                      const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                      return (
                        <div
                          key={apt.id}
                          onClick={() => openEditAppointment(apt)}
                          className={cn(
                            'p-2.5 rounded-xl border text-left cursor-pointer hover:shadow-md transition-all flex flex-col group/weekcard',
                            getStatusColor(apt.status),
                          )}
                        >
                          <div className="flex items-center justify-between mb-1 opacity-70">
                            <p className="text-xs font-bold">
                              {format(new Date(apt.data_hora), 'HH:mm')}
                            </p>
                            <div className="flex items-center gap-1">
                              {apt.is_online && <Video className="w-3 h-3" />}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-red-600 opacity-100 sm:opacity-0 sm:group-hover/weekcard:opacity-100 transition-opacity p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (canCancel) {
                                    setAppointmentToCancel(apt)
                                    setCancelReason('')
                                    setIsCancelDialogOpen(true)
                                  }
                                }}
                                title="Cancelar Agendamento"
                                disabled={!canCancel}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="font-bold text-sm leading-tight line-clamp-2">{p?.nome}</p>
                          {apt.valor_total > 0 && (
                            <p className="text-[10px] opacity-80 font-bold mt-1.5">
                              {formatBRL(apt.valor_total)}
                            </p>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 })
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end: addDays(end, 6 - end.getDay()) })

    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-100">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div
              key={d}
              className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 border-l border-slate-100">
          {days.map((day, idx) => {
            const dayApts = appointments.filter(
              (a) => isSameDay(new Date(a.data_hora), day) && a.status !== 'desmarcou',
            )
            const isCurrMonth = isSameMonth(day, currentDate)
            const isTdy = isToday(day)

            return (
              <div
                key={idx}
                className={cn(
                  'min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col cursor-pointer transition-colors',
                  !isCurrMonth && 'bg-slate-50/50 opacity-50',
                  isTdy && 'bg-primary/5',
                )}
                onClick={() => {
                  setViewMode('day')
                  setCurrentDate(day)
                }}
              >
                <div className="flex justify-end mb-1">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      isTdy ? 'bg-primary text-white' : 'text-slate-600',
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
                  {dayApts.slice(0, 3).map((apt) => {
                    const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                    return (
                      <div
                        key={apt.id}
                        className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium truncate border flex items-center justify-between group/monthchip',
                          getStatusColor(apt.status),
                        )}
                        title={p?.nome}
                      >
                        <span className="truncate">
                          {format(new Date(apt.data_hora), 'HH:mm')} {p?.nome?.split(' ')[0]}
                        </span>
                      </div>
                    )
                  })}
                  {dayApts.length > 3 && (
                    <div className="text-[10px] text-center text-slate-400 font-medium pt-0.5">
                      +{dayApts.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Agenda</h1>
          <p className="text-slate-500 mt-1 text-base">Gerencie seus horários e consultas.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentDate(
                  viewMode === 'month'
                    ? addDays(currentDate, -30)
                    : addDays(currentDate, viewMode === 'week' ? -7 : -1),
                )
              }
              className="h-10 w-10 rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="px-4 font-bold text-slate-800 min-w-[140px] text-center capitalize">
              {viewMode === 'month'
                ? format(currentDate, 'MMMM yyyy', { locale: ptBR })
                : viewMode === 'week'
                  ? `Semana de ${format(startOfWeek(currentDate), 'dd/MM')}`
                  : format(currentDate, "dd 'de' MMM", { locale: ptBR })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentDate(
                  viewMode === 'month'
                    ? addDays(currentDate, 30)
                    : addDays(currentDate, viewMode === 'week' ? 7 : 1),
                )
              }
              className="h-10 w-10 rounded-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>
          <Tabs
            value={viewMode}
            onValueChange={(v: any) => setViewMode(v)}
            className="w-full sm:w-auto"
          >
            <TabsList className="h-10 bg-slate-100 p-1 rounded-xl grid grid-cols-3 w-full">
              <TabsTrigger value="day" className="rounded-lg text-xs font-bold">
                Dia
              </TabsTrigger>
              <TabsTrigger value="week" className="rounded-lg text-xs font-bold">
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="rounded-lg text-xs font-bold">
                Mês
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {canCreate && (
            <Button
              onClick={() => openNewAppointment()}
              className="h-10 rounded-xl gap-2 w-full sm:w-auto ml-0 sm:ml-2"
            >
              <Plus className="w-4 h-4" /> Novo
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-0 flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-primary" />
              {formData.id ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Paciente</Label>
                <Select value={formData.paciente_id} onValueChange={handlePatientSelect} required>
                  <SelectTrigger className="bg-slate-50 h-12 rounded-xl text-base">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-64">
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Profissional</Label>
                <Select
                  value={formData.profissional_id}
                  onValueChange={(v) => setFormData({ ...formData, profissional_id: v })}
                  required
                  disabled={isProfissional}
                >
                  <SelectTrigger className="bg-slate-50 h-12 rounded-xl text-base">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-64">
                    {professionals.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome || 'Profissional'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Data</Label>
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                  className="bg-slate-50 h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Hora</Label>
                <Input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  required
                  className="bg-slate-50 h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="bg-slate-50 h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="compareceu">Compareceu</SelectItem>
                    <SelectItem value="faltou">Faltou</SelectItem>
                    <SelectItem value="desmarcou">Desmarcou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_total}
                  onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                  className="bg-slate-50 h-12 rounded-xl"
                  placeholder="0,00"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <Checkbox
                id="online"
                checked={formData.is_online}
                onCheckedChange={(c) => setFormData({ ...formData, is_online: !!c })}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label
                htmlFor="online"
                className="cursor-pointer font-bold text-blue-900 flex items-center gap-2"
              >
                <Video className="w-4 h-4" /> Sessão Online
              </Label>
            </div>
            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 h-12 rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Tem certeza que deseja cancelar este agendamento?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O agendamento será removido e o paciente será
              notificado.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-slate-700 font-bold mb-2 block">Motivo do Cancelamento</Label>
            <Textarea
              placeholder="Ex: Imprevisto pessoal..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="bg-slate-50 border-slate-200"
            />
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isCanceling}
            >
              Voltar
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault()
                handleCancel()
              }}
              disabled={isCanceling || !cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCanceling ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Ban className="w-4 h-4 mr-2" />
              )}{' '}
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
