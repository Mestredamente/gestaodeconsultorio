import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Video,
  Lock,
  Send,
  RefreshCw,
  Trash2,
  Filter,
  Search,
  MoreVertical,
  CalendarSync,
  FileText,
  Link as LinkIcon,
  BrainCircuit,
  Loader2,
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
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { generateWhatsAppLink } from '@/lib/whatsapp'

export default function Agenda() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const [appointments, setAppointments] = useState<any[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [waitlist, setWaitlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly' | 'waitlist'>('daily')
  const [convenioFilter, setConvenioFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)

  const [patients, setPatients] = useState<any[]>([])
  const [convenios, setConvenios] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isSuggesting, setIsSuggesting] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])

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
    plataforma: 'google_meet',
  })

  const [rescheduleData, setRescheduleData] = useState({
    id: '',
    paciente_id: '',
    data_hora: '',
    patientName: '',
  })

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
        `id, data_hora, status, especialidade, valor_total, tipo_pagamento, status_nota_fiscal, paciente_id, justificativa_falta, is_online, room_id, status_whatsapp_lembrete, convenio_id, pacientes (id, nome, valor_sessao, telefone, hash_anamnese)`,
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

    setLoading(false)
  }, [user, view, currentDate])

  const fetchInitialData = useCallback(async () => {
    if (!user) return
    const [pts, cvs] = await Promise.all([
      supabase
        .from('pacientes')
        .select('id, nome, valor_sessao, convenio_id')
        .eq('usuario_id', user.id)
        .order('nome'),
      supabase
        .from('convenios' as any)
        .select('*')
        .eq('usuario_id', user.id),
    ])
    if (pts.data) setPatients(pts.data)
    if (cvs.data) setConvenios(cvs.data)
  }, [user])

  useEffect(() => {
    fetchAppointments()
    fetchInitialData()
  }, [fetchAppointments, fetchInitialData])

  const handleSuggestTime = async () => {
    if (!formData.paciente_id) {
      toast({ title: 'Selecione um paciente primeiro', variant: 'destructive' })
      return
    }
    setIsSuggesting(true)
    try {
      const { data, error } = await supabase.functions.invoke('sugerir_horario_ia', {
        body: { paciente_id: formData.paciente_id, usuario_id: user?.id },
      })
      if (error) throw error
      setSuggestions(data.sugestoes || [])
      toast({ title: 'Sugestões carregadas com sucesso!' })
    } catch (err) {
      toast({
        title: 'Erro ao gerar sugestões',
        description: 'Verifique se a Gemini API Key está configurada nas integrações.',
        variant: 'destructive',
      })
    } finally {
      setIsSuggesting(false)
    }
  }

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const baseDate = new Date(formData.data_hora)
    if (baseDate < new Date()) {
      toast({
        title: 'Atenção',
        description: 'Não é possível agendar no passado.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

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
        is_online: formData.is_online,
        room_id: formData.is_online ? `${formData.plataforma}-${crypto.randomUUID()}` : null,
      })
    }

    const { error } = await supabase.from('agendamentos').insert(appointmentsToInsert as any)

    setIsSubmitting(false)
    if (error) {
      toast({ title: 'Erro ao agendar', description: error.message, variant: 'destructive' })
    } else {
      toast({
        title:
          count > 1 ? `${count} sessões agendadas com sucesso!` : 'Agendamento salvo com sucesso!',
      })
      setIsNewModalOpen(false)
      fetchAppointments()
    }
  }

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('agendamentos').update({ status }).eq('id', id)
    if (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    } else {
      toast({ title: 'Status atualizado para ' + status })
      fetchAppointments()
    }
  }

  const handleStartVirtualSession = async (apt: any) => {
    try {
      toast({ title: 'Gerando link seguro...', description: 'Aguarde um momento.' })

      const { data, error } = await supabase.functions.invoke('gerar_link_sala_virtual', {
        body: { agendamento_id: apt.id },
      })

      if (error) throw error

      if (data?.link) {
        const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes

        if (pacienteInfo?.telefone) {
          const message = `Olá ${pacienteInfo.nome || ''}, sua sessão virtual está pronta! Acesse aqui: ${data.link}. Você entrará em uma sala de espera até o psicólogo aprová-lo.`
          const wpLink = generateWhatsAppLink(pacienteInfo.telefone, message)
          window.open(wpLink, '_blank')
        } else {
          toast({
            title: 'Sessão Iniciada',
            description:
              'Paciente sem telefone. O link foi gerado e você pode gerenciá-lo na Sala Virtual.',
          })
        }

        navigate('/sala-virtual')
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao gerar link',
        description: err.message || 'Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const renderAppointmentCard = (apt: any) => {
    const timeStr = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
    const patientName = pacienteInfo?.nome || 'Desconhecido'
    const statusColors: any = {
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
          'bg-white shadow-sm border-l-4 border-t-0 border-r-0 border-b-0 h-full flex flex-col hover:shadow-md rounded-[1.5rem]',
          statusColors[apt.status] || statusColors.agendado,
        )}
      >
        <CardContent className="p-5 flex flex-col h-full gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-slate-50 px-3 py-2 rounded-xl flex flex-col items-center justify-center border border-slate-100 shrink-0">
              <span className="font-bold text-slate-700 text-sm leading-none">{timeStr}</span>
            </div>
            <div className="space-y-1 w-full min-w-0">
              <h3 className="font-bold text-base text-slate-900 truncate" title={patientName}>
                {patientName}
              </h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {apt.is_online && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200 gap-1 rounded-md"
                  >
                    <Video className="w-3 h-3" /> Online
                  </Badge>
                )}
                {apt.status === 'confirmado' && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 border-transparent rounded-md"
                  >
                    Confirmado
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 flex flex-col gap-3 border-t border-slate-100">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 w-full sm:w-auto justify-center sm:justify-start">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-emerald-600 hover:bg-emerald-100"
                  title="Confirmar"
                  onClick={() => updateStatus(apt.id, 'confirmado')}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-600 hover:bg-red-100"
                  title="Faltou"
                  onClick={() => updateStatus(apt.id, 'faltou')}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-amber-600 hover:bg-amber-100"
                  title="Desmarcou"
                  onClick={() => updateStatus(apt.id, 'desmarcou')}
                >
                  <span className="font-bold text-sm">D</span>
                </Button>
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 text-slate-600 hover:bg-slate-50 border-slate-200 rounded-lg"
                  onClick={() => navigate(`/pacientes/${apt.paciente_id}/prontuario`)}
                  title="Prontuário"
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem
                      onClick={() => {
                        setRescheduleData({
                          id: apt.id,
                          paciente_id: apt.paciente_id,
                          data_hora: apt.data_hora.slice(0, 16),
                          patientName,
                        })
                        setIsRescheduleModalOpen(true)
                      }}
                      className="rounded-lg"
                    >
                      <CalendarSync className="w-4 h-4 mr-2" /> Remarcar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {apt.is_online && (
              <Button
                size="sm"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 h-11 sm:h-9 shadow-sm"
                onClick={() => handleStartVirtualSession(apt)}
              >
                <Video className="w-4 h-4" /> Iniciar Sessão Virtual
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredAppointments = appointments.filter((a) => {
    const matchConvenio =
      convenioFilter === 'all' ||
      (convenioFilter === 'particular' && a.tipo_pagamento !== 'convenio') ||
      a.convenio_id === convenioFilter
    const pInfo = Array.isArray(a.pacientes) ? a.pacientes[0] : a.pacientes
    const s = searchTerm.toLowerCase()
    const matchSearch =
      !s || pInfo?.nome?.toLowerCase().includes(s) || pInfo?.telefone?.toLowerCase().includes(s)
    return matchConvenio && matchSearch
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center justify-between gap-1 bg-slate-50 border border-slate-200 rounded-2xl p-1 shrink-0 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(subDays(currentDate, 1))}
              className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl"
            >
              <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 sm:h-9 flex-1 sm:min-w-[140px] font-medium px-2 hover:bg-white rounded-xl text-base sm:text-sm"
                >
                  {format(currentDate, 'dd/MM/yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-3xl border-slate-100 shadow-xl">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(d) => d && setCurrentDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
              className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl"
            >
              <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as any)}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-1 shrink-0 w-full sm:w-auto"
          >
            <TabsList className="h-11 sm:h-10 bg-transparent gap-1 w-full flex">
              <TabsTrigger
                value="daily"
                className="flex-1 rounded-xl data-[state=active]:shadow-sm"
              >
                Dia
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="flex-1 rounded-xl data-[state=active]:shadow-sm"
              >
                Semana
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto justify-end shrink-0">
          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="gap-2 rounded-2xl h-12 sm:h-11 px-8 shadow-sm w-full sm:w-auto text-base sm:text-sm"
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4" /> Novo Agendamento
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAppointments.map((apt) => renderAppointmentCard(apt))}
            {filteredAppointments.length === 0 && (
              <div className="col-span-full text-center p-12 bg-white rounded-[2rem] shadow-sm border border-slate-100 text-slate-500 font-medium">
                Nenhum agendamento para este dia.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col w-[95vw] p-0 rounded-[2rem] overflow-hidden">
          <DialogHeader className="p-6 pb-4 shrink-0 border-b border-slate-100">
            <DialogTitle className="text-2xl font-bold">Novo Agendamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select
                value={formData.paciente_id}
                onValueChange={(v) => setFormData({ ...formData, paciente_id: v })}
                required
              >
                <SelectTrigger className="bg-slate-50 h-12 rounded-xl border-slate-200">
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <Label className="text-base font-bold text-slate-800">Data e Hora</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 rounded-lg"
                  onClick={handleSuggestTime}
                  disabled={isSuggesting}
                >
                  {isSuggesting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <BrainCircuit className="w-4 h-4 mr-2" />
                  )}
                  IA Sugestão
                </Button>
              </div>
              <Input
                type="datetime-local"
                required
                value={formData.data_hora}
                onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                className="bg-white h-12 rounded-xl text-base"
              />

              {suggestions.length > 0 && (
                <div className="mt-4 space-y-2 animate-fade-in-up">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider pl-1">
                    Sugestões (Gemini AI)
                  </p>
                  {suggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white border border-indigo-100 shadow-sm cursor-pointer hover:border-indigo-300"
                      onClick={() => setFormData({ ...formData, data_hora: sug.data_hora })}
                    >
                      <div className="bg-indigo-50 text-indigo-700 font-bold text-xs px-3 py-2 rounded-lg shrink-0">
                        {new Date(sug.data_hora).toLocaleDateString('pt-BR')} <br />
                        <span className="text-lg">
                          {new Date(sug.data_hora).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-snug mt-1">
                        {sug.justificativa}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 bg-blue-50/30 p-5 rounded-2xl border border-blue-100">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="is_online"
                  checked={formData.is_online}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_online: !!checked })}
                  className="w-5 h-5 rounded-md"
                />
                <Label
                  htmlFor="is_online"
                  className="font-bold text-slate-800 text-base cursor-pointer"
                >
                  Consulta Online (Gerar Link de Vídeo)
                </Label>
              </div>
              {formData.is_online && (
                <div className="space-y-2 pt-2">
                  <Label>Plataforma</Label>
                  <Select
                    value={formData.plataforma}
                    onValueChange={(v) => setFormData({ ...formData, plataforma: v })}
                  >
                    <SelectTrigger className="bg-white h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="google_meet">Google Meet</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="portal">Portal Interno (Recomendado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Invisibile div for spacing above footer */}
            <div className="pb-2"></div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 flex gap-3 sm:static sm:bg-transparent sm:border-0 sm:p-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewModalOpen(false)}
                className="w-full sm:w-auto h-12 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-12 px-8 rounded-xl text-base"
              >
                {isSubmitting ? 'Salvando...' : 'Confirmar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
