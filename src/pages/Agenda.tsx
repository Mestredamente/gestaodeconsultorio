import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Plus, FileText, CheckCircle2, XCircle, AlertCircle, Video } from 'lucide-react'
import { startOfWeek, addDays, format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export default function Agenda() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week')
  
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    paciente_id: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    hora: '09:00',
    status: 'agendado',
    is_online: false,
    tipo_pagamento: 'particular',
    valor_total: ''
  })

  const fetchAgenda = async () => {
    if (!user) return
    setLoading(true)
    
    let start, end;
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

    const { data } = await supabase
      .from('agendamentos')
      .select('*, pacientes(nome, valor_sessao)')
      .eq('usuario_id', user.id)
      .gte('data_hora', start.toISOString())
      .lte('data_hora', end.toISOString())
      .order('data_hora')

    const { data: pats } = await supabase.from('pacientes').select('id, nome, valor_sessao').eq('usuario_id', user.id)
    
    if (data) setAppointments(data)
    if (pats) setPatients(pats)
    setLoading(false)
  }

  useEffect(() => {
    fetchAgenda()
  }, [user, currentDate, viewMode])

  const openNewAppointment = (dateStr?: string, timeStr?: string) => {
    setFormData({
      id: '',
      paciente_id: '',
      data: dateStr || format(currentDate, 'yyyy-MM-dd'),
      hora: timeStr || '09:00',
      status: 'agendado',
      is_online: false,
      tipo_pagamento: 'particular',
      valor_total: ''
    })
    setIsModalOpen(true)
  }

  const openEditAppointment = (apt: any) => {
    const d = new Date(apt.data_hora)
    setFormData({
      id: apt.id,
      paciente_id: apt.paciente_id,
      data: format(d, 'yyyy-MM-dd'),
      hora: format(d, 'HH:mm'),
      status: apt.status,
      is_online: apt.is_online || false,
      tipo_pagamento: apt.tipo_pagamento || 'particular',
      valor_total: apt.valor_total?.toString() || ''
    })
    setIsModalOpen(true)
  }

  const handlePatientSelect = (pid: string) => {
    const p = patients.find(x => x.id === pid)
    setFormData({ ...formData, paciente_id: pid, valor_total: p?.valor_sessao?.toString() || '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    const dateTime = new Date(`${formData.data}T${formData.hora}:00`)

    const payload = {
      usuario_id: user.id,
      paciente_id: formData.paciente_id,
      data_hora: dateTime.toISOString(),
      status: formData.status,
      is_online: formData.is_online,
      tipo_pagamento: formData.tipo_pagamento,
      valor_total: formData.valor_total ? Number(formData.valor_total) : 0
    }

    try {
      if (formData.id) {
        await supabase.from('agendamentos').update(payload).eq('id', formData.id)
        toast({ title: 'Agendamento atualizado!' })
      } else {
        await supabase.from('agendamentos').insert(payload)
        toast({ title: 'Agendamento criado!' })
      }
      setIsModalOpen(false)
      fetchAgenda()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('agendamentos').update({ status: newStatus }).eq('id', id)
    fetchAgenda()
    toast({ title: `Status atualizado para ${newStatus}` })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'confirmado': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'compareceu': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'faltou': return 'bg-red-50 text-red-700 border-red-200'
      case 'desmarcou': return 'bg-slate-100 text-slate-700 border-slate-200'
      default: return 'bg-slate-50 text-slate-700'
    }
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 8h to 21h
    const dayAppointments = appointments.filter(a => isSameDay(new Date(a.data_hora), currentDate))

    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-slate-800 capitalize">{format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {hours.map(hour => {
             const timeStr = `${hour.toString().padStart(2, '0')}:00`
             const aptsInHour = dayAppointments.filter(a => new Date(a.data_hora).getHours() === hour)
             
             return (
               <div key={hour} className="flex gap-4 group">
                 <div className="w-16 text-right text-slate-400 font-medium text-sm pt-2 shrink-0">{timeStr}</div>
                 <div className="flex-1 min-h-[4rem] border-l-2 border-slate-100 pl-4 py-1 relative">
                   {aptsInHour.length === 0 ? (
                     <div 
                       className="h-full w-full rounded-xl border-2 border-dashed border-transparent group-hover:border-slate-200 flex items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
                       onClick={() => openNewAppointment(format(currentDate, 'yyyy-MM-dd'), timeStr)}
                     >
                       <span className="text-slate-400 text-sm font-medium flex items-center gap-1"><Plus className="w-4 h-4"/> Agendar</span>
                     </div>
                   ) : (
                     <div className="flex flex-col gap-2">
                       {aptsInHour.map(apt => {
                         const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                         return (
                           <div key={apt.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group/card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                             <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => openEditAppointment(apt)}>
                                <div className={cn("w-2 h-10 rounded-full shrink-0", getStatusColor(apt.status).split(' ')[0])}></div>
                                <div>
                                  <p className="font-bold text-slate-800">{p?.nome}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-500 font-medium">{format(new Date(apt.data_hora), 'HH:mm')}</span>
                                    <Badge variant="outline" className={cn("text-[10px] py-0 h-4 border", getStatusColor(apt.status))}>{apt.status}</Badge>
                                    {apt.is_online && <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 py-0 h-4 gap-1"><Video className="w-3 h-3"/> Online</Badge>}
                                  </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => updateStatus(apt.id, 'compareceu')} title="Compareceu"><CheckCircle2 className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => updateStatus(apt.id, 'faltou')} title="Faltou"><XCircle className="w-4 h-4"/></Button>
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
            const dayApts = appointments.filter(a => isSameDay(new Date(a.data_hora), day))
            const isTdy = isToday(day)
            return (
              <div key={idx} className={cn("min-h-[200px] sm:min-h-[600px] p-3 flex flex-col transition-colors", isTdy ? "bg-primary/5" : "hover:bg-slate-50/50")}>
                <div className="text-center mb-4 pb-3 border-b border-slate-100">
                  <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", isTdy ? "text-primary" : "text-slate-500")}>
                    {format(day, 'EEE', { locale: ptBR })}
                  </p>
                  <div className={cn("w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold", isTdy ? "bg-primary text-white shadow-md" : "text-slate-700")}>
                    {format(day, 'd')}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {dayApts.length === 0 ? (
                    <div 
                      className="flex-1 border-2 border-dashed border-transparent hover:border-slate-200 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                      onClick={() => openNewAppointment(format(day, 'yyyy-MM-dd'))}
                    >
                      <Plus className="w-4 h-4 text-slate-300" />
                    </div>
                  ) : (
                    dayApts.map(apt => {
                      const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                      return (
                        <div key={apt.id} onClick={() => openEditAppointment(apt)} className={cn("p-2.5 rounded-xl border text-left cursor-pointer hover:shadow-md transition-all", getStatusColor(apt.status))}>
                          <p className="text-xs font-bold mb-1 opacity-70">{format(new Date(apt.data_hora), 'HH:mm')}</p>
                          <p className="font-bold text-sm leading-tight line-clamp-2">{p?.nome}</p>
                          {apt.is_online && <Video className="w-3 h-3 mt-1.5 opacity-60" />}
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
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 border-l border-slate-100">
          {days.map((day, idx) => {
            const dayApts = appointments.filter(a => isSameDay(new Date(a.data_hora), day))
            const isCurrMonth = isSameMonth(day, currentDate)
            const isTdy = isToday(day)

            return (
              <div key={idx} className={cn("min-h-[100px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col cursor-pointer transition-colors", !isCurrMonth && "bg-slate-50/50 opacity-50", isTdy && "bg-primary/5")} onClick={() => { setViewMode('day'); setCurrentDate(day); }}>
                <div className="flex justify-end mb-1">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", isTdy ? "bg-primary text-white" : "text-slate-600")}>
                    {format(day, 'd')}
                  </div>
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
                  {dayApts.slice(0, 3).map(apt => {
                    const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                    return (
                      <div key={apt.id} className={cn("px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium truncate border", getStatusColor(apt.status))} title={p?.nome}>
                        {format(new Date(apt.data_hora), 'HH:mm')} {p?.nome?.split(' ')[0]}
                      </div>
                    )
                  })}
                  {dayApts.length > 3 && (
                    <div className="text-[10px] text-center text-slate-400 font-medium pt-0.5">+{dayApts.length - 3} mais</div>
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
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(viewMode === 'month' ? addDays(currentDate, -30) : addDays(currentDate, viewMode === 'week' ? -7 : -1))} className="h-10 w-10 rounded-xl">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="px-4 font-bold text-slate-800 min-w-[140px] text-center capitalize">
              {viewMode === 'month' ? format(currentDate, 'MMMM yyyy', { locale: ptBR }) : 
               viewMode === 'week' ? `Semana de ${format(startOfWeek(currentDate), 'dd/MM')}` :
               format(currentDate, "dd 'de' MMM", { locale: ptBR })}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(viewMode === 'month' ? addDays(currentDate, 30) : addDays(currentDate, viewMode === 'week' ? 7 : 1))} className="h-10 w-10 rounded-xl">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>
          
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full sm:w-auto">
            <TabsList className="h-10 bg-slate-100 p-1 rounded-xl grid grid-cols-3 w-full">
              <TabsTrigger value="day" className="rounded-lg text-xs font-bold">Dia</TabsTrigger>
              <TabsTrigger value="week" className="rounded-lg text-xs font-bold">Semana</TabsTrigger>
              <TabsTrigger value="month" className="rounded-lg text-xs font-bold">Mês</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={() => openNewAppointment()} className="h-10 rounded-xl gap-2 w-full sm:w-auto ml-0 sm:ml-2">
            <Plus className="w-4 h-4" /> Novo
          </Button>
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
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Paciente</Label>
              <Select value={formData.paciente_id} onValueChange={handlePatientSelect} required>
                <SelectTrigger className="bg-slate-50 h-12 rounded-xl text-base">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-64">
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Data</Label>
                <Input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} required className="bg-slate-50 h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Hora</Label>
                <Input type="time" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} required className="bg-slate-50 h-12 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-slate-700 font-bold">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
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
                <Input type="number" step="0.01" value={formData.valor_total} onChange={e => setFormData({...formData, valor_total: e.target.value})} className="bg-slate-50 h-12 rounded-xl" placeholder="0.00" />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <Checkbox 
                id="online" 
                checked={formData.is_online} 
                onCheckedChange={(c) => setFormData({...formData, is_online: !!c})}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="online" className="cursor-pointer font-bold text-blue-900 flex items-center gap-2">
                <Video className="w-4 h-4" /> Sessão Online (Telemedicina)
              </Label>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 h-12 rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
