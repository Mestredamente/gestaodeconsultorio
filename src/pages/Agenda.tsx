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
  CircleDollarSign,
  Calendar as CalendarIcon,
  Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import ReceiptDialog from '@/components/ReceiptDialog'
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

export default function Agenda() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<any[]>([])
  const [externalEvents, setExternalEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [clinicName, setClinicName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    paciente_id: '',
    data_hora: '',
    especialidade: '',
    valor_total: '0',
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
        `id, data_hora, status, especialidade, valor_total, status_nota_fiscal, paciente_id, justificativa_falta, pacientes (id, nome, valor_sessao)`,
      )
      .eq('usuario_id', user.id)
      .gte('data_hora', s.toISOString())
      .lt('data_hora', e.toISOString())
      .order('data_hora', { ascending: true })

    if (!error && data) setAppointments(data)

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
            pacientes: { nome: 'Bloqueio de Agenda' },
          },
        ])
      } else setExternalEvents([])
    } else setExternalEvents([])

    setLoading(false)
  }, [user, view, currentDate])

  const fetchInitialData = useCallback(async () => {
    if (!user) return
    const [pts, usr] = await Promise.all([
      supabase
        .from('pacientes')
        .select('id, nome, valor_sessao')
        .eq('usuario_id', user.id)
        .order('nome'),
      supabase
        .from('usuarios')
        .select('especialidades_disponiveis, nome_consultorio')
        .eq('id', user.id)
        .single(),
    ])
    if (pts.data) setPatients(pts.data)
    if (usr.data) {
      setEspecialidades(usr.data.especialidades_disponiveis || [])
      setClinicName(usr.data.nome_consultorio || '')
    }
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
    view === 'monthly'
      ? setCurrentDate(addMonths(currentDate, 1))
      : view === 'weekly'
        ? setCurrentDate(addDays(currentDate, 7))
        : setCurrentDate(addDays(currentDate, 1))
  }
  const prevPeriod = () => {
    view === 'monthly'
      ? setCurrentDate(subMonths(currentDate, 1))
      : view === 'weekly'
        ? setCurrentDate(subDays(currentDate, 7))
        : setCurrentDate(subDays(currentDate, 1))
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)
    const { data: newAppt, error } = await supabase
      .from('agendamentos')
      .insert({
        usuario_id: user.id,
        paciente_id: formData.paciente_id,
        data_hora: new Date(formData.data_hora).toISOString(),
        especialidade: formData.especialidade || null,
        valor_total: Number(formData.valor_total),
        status: 'agendado',
      })
      .select()
      .single()
    if (error)
      toast({ title: 'Erro ao agendar', description: error.message, variant: 'destructive' })
    else {
      supabase.functions.invoke('enviar_lembrete_consulta', {
        body: { agendamento_id: newAppt.id },
      })
      toast({ title: 'Agendamento salvo com sucesso!' })
      setIsNewModalOpen(false)
      setFormData({ paciente_id: '', data_hora: '', especialidade: '', valor_total: '0' })
    }
    setIsSubmitting(false)
  }

  const handleUpdateStatus = async (apt: any, newStatus: string) => {
    if (apt.status === newStatus) return
    setAppointments((prev) => prev.map((a) => (a.id === apt.id ? { ...a, status: newStatus } : a)))
    await supabase.from('agendamentos').update({ status: newStatus }).eq('id', apt.id)
    toast({ title: `Status atualizado: ${newStatus}` })

    if (newStatus === 'compareceu' && user) {
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

  const renderAppointmentCard = (apt: any) => {
    const timeStr = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    if (apt.status === 'external') {
      return (
        <Card
          key={apt.id}
          className="bg-slate-50 border-l-4 border-indigo-400 opacity-80 shadow-none border-t-0 border-r-0 border-b-0"
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-slate-200 min-w-[70px] py-2 rounded-lg text-center border border-slate-300 shrink-0">
              <span className="font-bold text-slate-600 text-lg">{timeStr}</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-700">{apt.pacientes.nome}</h3>
              <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" /> {apt.titulo}
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
    const patientName = pacienteInfo?.nome || 'Paciente Desconhecido'
    const valueStr = Number(
      apt.valor_total > 0 ? apt.valor_total : pacienteInfo?.valor_sessao || 0,
    ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const statusColors: Record<string, string> = {
      agendado: 'border-l-slate-200',
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
            <div className="bg-slate-50 min-w-[70px] py-2 rounded-lg text-center border border-slate-100 shrink-0">
              <span className="font-bold text-slate-700 text-lg">{timeStr}</span>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-lg text-slate-900">{patientName}</h3>
                {apt.especialidade && (
                  <Badge variant="secondary" className="text-xs">
                    {apt.especialidade}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium">Valor: {valueStr}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
            {apt.status === 'agendado' && isSameDay(new Date(apt.data_hora), new Date()) && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                onClick={() => navigate(`/atendimento/${apt.id}`)}
              >
                <Video className="w-4 h-4" /> Entrar Sessão
              </Button>
            )}
            <Button
              size="icon"
              variant="outline"
              className="text-slate-400 hover:text-primary"
              onClick={() =>
                window.open(
                  formatGoogleCalendarLink(`Consulta: ${patientName}`, clinicName, apt.data_hora),
                  '_blank',
                )
              }
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>
            <Button
              size="icon"
              variant="outline"
              className={cn(
                'hover:bg-emerald-50 hover:border-emerald-200',
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
                'hover:bg-red-50 hover:border-red-200',
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
                'hover:bg-amber-50 hover:border-amber-200 font-bold text-lg text-amber-500',
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
        <Button onClick={() => setIsNewModalOpen(true)} className="gap-2 rounded-full shadow-sm">
          <Plus className="w-4 h-4" /> Novo Agendamento
        </Button>
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
                const dayAppts = [...appointments, ...externalEvents].filter((a) =>
                  isSameDay(new Date(a.data_hora), d),
                )
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
                            a.status === 'external' ? 'bg-indigo-400' : 'bg-primary',
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
                const dayAppts = [...appointments, ...externalEvents]
                  .filter((a) => isSameDay(new Date(a.data_hora), d))
                  .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
                if (dayAppts.length === 0)
                  return view === 'daily' ? (
                    <div
                      key={d.toISOString()}
                      className="text-center p-12 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500"
                    >
                      Nenhuma sessão agendada.
                    </div>
                  ) : null
                return (
                  <div key={d.toISOString()} className="space-y-4">
                    {view === 'weekly' && (
                      <h3 className="font-bold text-slate-700 border-b border-slate-200 pb-2 capitalize">
                        {format(d, 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                      </h3>
                    )}
                    {dayAppts.map((apt) => renderAppointmentCard(apt))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select
                value={formData.paciente_id}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    paciente_id: v,
                    valor_total: patients.find((p) => p.id === v)?.valor_sessao?.toString() || '0',
                  })
                }
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
            {especialidades.length > 0 && (
              <div className="space-y-2">
                <Label>Especialidade</Label>
                <Select
                  value={formData.especialidade}
                  onValueChange={(v) => setFormData({ ...formData, especialidade: v })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Opcional..." />
                  </SelectTrigger>
                  <SelectContent>
                    {especialidades.map((esp) => (
                      <SelectItem key={esp} value={esp}>
                        {esp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Valor da Sessão (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_total}
                onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                className="bg-white"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
