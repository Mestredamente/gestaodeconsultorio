import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Check,
  X,
  Plus,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Receipt,
  CircleDollarSign,
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
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [receiptData, setReceiptData] = useState<any>(null)

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
    if (view === 'monthly') setCurrentDate(addMonths(currentDate, 1))
    else if (view === 'weekly') setCurrentDate(addDays(currentDate, 7))
    else setCurrentDate(addDays(currentDate, 1))
  }

  const prevPeriod = () => {
    if (view === 'monthly') setCurrentDate(subMonths(currentDate, 1))
    else if (view === 'weekly') setCurrentDate(subDays(currentDate, 7))
    else setCurrentDate(subDays(currentDate, 1))
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    const isoDate = new Date(formData.data_hora).toISOString()
    const { data: newAppt, error } = await supabase
      .from('agendamentos')
      .insert({
        usuario_id: user.id,
        paciente_id: formData.paciente_id,
        data_hora: isoDate,
        especialidade: formData.especialidade || null,
        valor_total: Number(formData.valor_total),
        status: 'agendado',
      })
      .select()
      .single()

    if (error) {
      toast({ title: 'Erro ao agendar', description: error.message, variant: 'destructive' })
      setIsSubmitting(false)
      return
    }

    // Trigger Notification
    supabase.functions.invoke('enviar_lembrete_consulta', { body: { agendamento_id: newAppt.id } })

    toast({ title: 'Agendamento salvo com sucesso!' })
    setIsNewModalOpen(false)
    setIsSubmitting(false)
    setFormData({
      paciente_id: '',
      data_hora: '',
      especialidade: '',
      valor_total: '0',
    })
  }

  const handleUpdateStatus = async (apt: any, newStatus: string) => {
    if (apt.status === newStatus) return
    setAppointments((prev) => prev.map((a) => (a.id === apt.id ? { ...a, status: newStatus } : a)))
    await supabase.from('agendamentos').update({ status: newStatus }).eq('id', apt.id)
    toast({ title: `Status atualizado: ${newStatus}` })

    if (newStatus === 'compareceu' && user) {
      const now = new Date(apt.data_hora)
      const mes = now.getMonth() + 1
      const ano = now.getFullYear()
      const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
      const valorToAdd = apt.valor_total > 0 ? apt.valor_total : pacienteInfo?.valor_sessao || 0

      if (valorToAdd > 0) {
        const { data: finData } = await supabase
          .from('financeiro')
          .select('*')
          .eq('usuario_id', user.id)
          .eq('paciente_id', apt.paciente_id)
          .eq('mes', mes)
          .eq('ano', ano)
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
            mes,
            ano,
            valor_recebido: 0,
            valor_a_receber: valorToAdd,
          })
      }
    }
  }

  const handleRegistrarPagamento = async (apt: any) => {
    if (!user) return
    const now = new Date(apt.data_hora)
    const mes = now.getMonth() + 1
    const ano = now.getFullYear()
    const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
    const valorSessao = apt.valor_total > 0 ? apt.valor_total : pacienteInfo?.valor_sessao || 0

    // Atualiza Financeiro (move de a_receber para recebido)
    const { data: finData } = await supabase
      .from('financeiro')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('paciente_id', apt.paciente_id)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle()

    if (finData) {
      await supabase
        .from('financeiro')
        .update({
          valor_recebido: Number(finData.valor_recebido) + Number(valorSessao),
          valor_a_receber: Math.max(0, Number(finData.valor_a_receber) - Number(valorSessao)),
        })
        .eq('id', finData.id)
    }

    try {
      const { error } = await supabase.functions.invoke('emitir_nota_fiscal', {
        body: { agendamento_id: apt.id, valor: valorSessao, paciente_nome: pacienteInfo?.nome },
      })
      if (error) throw error
      toast({ title: 'Pagamento registrado e Nota Fiscal emitida!' })
      fetchAppointments()
    } catch (e) {
      toast({ title: 'Erro ao emitir NF', variant: 'destructive' })
    }
  }

  const handlePatientSelect = (pid: string) => {
    const pt = patients.find((p) => p.id === pid)
    setFormData({ ...formData, paciente_id: pid, valor_total: pt?.valor_sessao?.toString() || '0' })
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
  const days = getDaysForView()

  const renderAppointmentCard = (apt: any) => {
    const timeStr = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
    const patientName = pacienteInfo?.nome || 'Paciente Desconhecido'
    const valueStr = Number(
      apt.valor_total > 0 ? apt.valor_total : pacienteInfo?.valor_sessao || 0,
    ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const eventTitle = `Consulta: ${patientName} ${apt.especialidade ? `(${apt.especialidade})` : ''}`
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
                {apt.status_nota_fiscal === 'emitida' && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 text-[10px] border-blue-200"
                  >
                    NF Emitida
                  </Badge>
                )}
                {apt.justificativa_falta && apt.status === 'desmarcou' && (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 text-[10px] border-amber-200"
                    title={apt.justificativa_falta}
                  >
                    Justificado pelo Portal
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium">Valor: {valueStr}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
            <Button
              size="icon"
              variant="outline"
              className="text-slate-400 hover:text-primary"
              onClick={() =>
                window.open(
                  formatGoogleCalendarLink(eventTitle, clinicName, apt.data_hora),
                  '_blank',
                )
              }
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            {apt.status === 'compareceu' && apt.status_nota_fiscal !== 'emitida' && (
              <Button
                variant="outline"
                className="hover:bg-emerald-50 hover:border-emerald-200 text-emerald-600 gap-2"
                onClick={() => handleRegistrarPagamento(apt)}
                title="Registrar Pagamento e Emitir NF"
              >
                <CircleDollarSign className="w-4 h-4" /> Pagar & NF
              </Button>
            )}
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
              <TabsTrigger
                value="daily"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                Dia
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                Semana
              </TabsTrigger>
              <TabsTrigger
                value="monthly"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                Mês
              </TabsTrigger>
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
              {days.map((d) => {
                const dayAppts = appointments.filter((a) => isSameDay(new Date(a.data_hora), d))
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
                        <div key={a.id} className="w-2 h-2 rounded-full bg-primary" />
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
              {days.map((d) => {
                const dayAppts = appointments.filter((a) => isSameDay(new Date(a.data_hora), d))
                if (dayAppts.length === 0) {
                  if (view === 'daily')
                    return (
                      <div
                        key={d.toISOString()}
                        className="text-center p-12 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500"
                      >
                        Nenhuma sessão agendada para esta data.
                      </div>
                    )
                  return null
                }
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

      <ReceiptDialog
        {...receiptData}
        onOpenChange={(val: boolean) => setReceiptData(val ? receiptData : null)}
      />

      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={formData.paciente_id} onValueChange={handlePatientSelect} required>
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
