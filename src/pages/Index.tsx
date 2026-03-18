import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Check,
  X,
  LogOut,
  Settings2,
  Bell,
  Users,
  MessageCircle,
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ServiceGoalTracker } from '@/components/ServiceGoalTracker'
import { PerformanceDashboard } from '@/components/PerformanceDashboard'
import { MentalHealthIndicators } from '@/components/MentalHealthIndicators'
import { measurePerformance } from '@/lib/performance'

const DEFAULT_WIDGETS = [
  { id: 'agenda', label: 'Agenda de Hoje', visible: true, order: 0 },
  { id: 'dashboard', label: 'Dashboard de Performance', visible: true, order: 1 },
  { id: 'indicators', label: 'Indicadores de Bem-estar', visible: true, order: 2 },
  { id: 'goals', label: 'Metas e Supervisão', visible: true, order: 3 },
]

export default function Index() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [waitlist, setWaitlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS)
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  const todayStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  useEffect(() => {
    if (!user) return
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false })
        .limit(6)
      if (data) setNotifications(data)
    }
    fetchNotifs()

    const channelNotif = supabase
      .channel('notificacoes_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `usuario_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 6))
          toast({ title: payload.new.titulo, description: payload.new.mensagem })
        },
      )
      .subscribe()

    const channelApt = supabase
      .channel('dashboard_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agendamentos',
          filter: `usuario_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.status === 'confirmado' && payload.old.status !== 'confirmado')
            fetchIndexData()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelNotif)
      supabase.removeChannel(channelApt)
    }
  }, [user, toast])

  const fetchIndexData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(false)

    try {
      await measurePerformance('index_data', async () => {
        const { data: u } = await supabase
          .from('usuarios')
          .select('preferencias_dashboard')
          .eq('id', user.id)
          .maybeSingle()

        if (u?.preferencias_dashboard?.widgets) {
          setWidgets(u.preferencias_dashboard.widgets)
        } else if (u?.preferencias_dashboard) {
          // Backward compatibility mapping
          const mapped = DEFAULT_WIDGETS.map((w) => {
            if (w.id === 'agenda' && u.preferencias_dashboard.show_agenda === false)
              return { ...w, visible: false }
            if (w.id === 'dashboard' && u.preferencias_dashboard.show_dashboard === false)
              return { ...w, visible: false }
            return w
          })
          setWidgets(mapped)
        }

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(startOfDay)
        endOfDay.setDate(endOfDay.getDate() + 1)

        const apptsRes = await supabase
          .from('agendamentos')
          .select(
            'id, data_hora, status, is_online, paciente_id, pacientes(id, nome, valor_sessao)',
          )
          .eq('usuario_id', user.id)
          .gte('data_hora', startOfDay.toISOString())
          .lt('data_hora', endOfDay.toISOString())
          .order('data_hora', { ascending: true })

        if (apptsRes.data) setAppointments(apptsRes.data)

        const { data: wlData } = await supabase
          .from('lista_espera' as any)
          .select('id, dias_semana, periodos, pacientes(nome, telefone)')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (wlData) setWaitlist(wlData)
      })
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchIndexData()
  }, [fetchIndexData])

  const updateStatus = async (id: string, status: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    const { error } = await supabase.from('agendamentos').update({ status }).eq('id', id)
    if (!error) toast({ title: `Status atualizado: ${status.toUpperCase()}` })
    else fetchIndexData()
  }

  const savePrefs = async (newWidgets: typeof widgets) => {
    setWidgets(newWidgets)
    await supabase
      .from('usuarios')
      .update({ preferencias_dashboard: { widgets: newWidgets } })
      .eq('id', user?.id)
  }

  const toggleWidget = (id: string, visible: boolean) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible } : w))
    savePrefs(updated)
  }

  const moveWidget = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= widgets.length) return
    const updated = [...widgets]
    const temp = updated[index]
    updated[index] = updated[index + direction]
    updated[index + direction] = temp

    const reordered = updated.map((w, i) => ({ ...w, order: i }))
    savePrefs(reordered)
  }

  const renderWidget = (id: string) => {
    switch (id) {
      case 'dashboard':
        return <PerformanceDashboard key="dashboard" />
      case 'indicators':
        return (
          <div key="indicators" className="w-full lg:w-1/2">
            <MentalHealthIndicators />
          </div>
        )
      case 'agenda':
        return (
          <Card key="agenda" className="shadow-sm border-slate-200 w-full lg:w-2/3 h-fit">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Sessões de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Nenhuma sessão para hoje.</div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {appointments.map((apt) => {
                    const pInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                    const time = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    return (
                      <div
                        key={apt.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-14 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-primary font-bold shadow-sm">
                            {time}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {pInfo?.nome || 'Paciente Excluído'}
                            </p>
                            <span
                              className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider mt-1 inline-block',
                                apt.status === 'compareceu'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : apt.status === 'confirmado'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : apt.status === 'desmarcou'
                                      ? 'bg-amber-100 text-amber-700'
                                      : apt.status === 'faltou'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-slate-100 text-slate-700',
                              )}
                            >
                              {apt.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 hover:bg-emerald-50"
                            onClick={() => updateStatus(apt.id, 'compareceu')}
                          >
                            <Check className="w-4 h-4 mr-1" /> Comp.
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => updateStatus(apt.id, 'faltou')}
                          >
                            <X className="w-4 h-4 mr-1" /> Faltou
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )
      case 'goals':
        return (
          <div key="goals" className="space-y-6 w-full lg:w-1/3">
            <ServiceGoalTracker />
            <Card
              className="shadow-sm border-slate-200 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate('/supervisao')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">Supervisão Clínica</h3>
                    <p className="text-xs text-slate-500">Casos e orientações</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Users className="w-4 h-4 text-primary" /> Fila de Espera
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => navigate('/agenda')}
                >
                  Gerenciar
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto">
                  {waitlist.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      Nenhum paciente aguardando.
                    </div>
                  ) : (
                    waitlist.map((wl) => (
                      <div
                        key={wl.id}
                        className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center gap-2"
                      >
                        <div>
                          <p className="font-semibold text-sm text-slate-800 leading-tight">
                            {wl.pacientes?.nome}
                          </p>
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {wl.dias_semana.slice(0, 2).map((d: string) => (
                              <span
                                key={d}
                                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded capitalize"
                              >
                                {d}
                              </span>
                            ))}
                            {wl.periodos.slice(0, 1).map((p: string) => (
                              <span
                                key={p}
                                className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded capitalize"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                        {wl.pacientes?.telefone && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 shrink-0 text-emerald-600 hover:bg-emerald-50"
                            onClick={() =>
                              window.open(
                                `https://wa.me/${wl.pacientes.telefone.replace(/\D/g, '')}`,
                                '_blank',
                              )
                            }
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Bell className="w-4 h-4 text-primary" /> Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      Nenhuma notificação.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <p className="font-semibold text-sm text-slate-800 leading-tight">
                          {n.titulo}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.mensagem}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {new Date(n.data_criacao).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return null
    }
  }

  const visibleWidgets = [...widgets].sort((a, b) => a.order - b.order).filter((w) => w.visible)

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo(a)!</h1>
          <p className="text-slate-500 capitalize">{todayStr}</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Configurar Dashboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 py-4">
                {widgets
                  .sort((a, b) => a.order - b.order)
                  .map((w, index) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                        <Label className="cursor-pointer">{w.label}</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={w.visible}
                          onCheckedChange={(v) => toggleWidget(w.id, v)}
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveWidget(index, -1)}
                            disabled={index === 0}
                            className="text-slate-400 hover:text-primary disabled:opacity-30"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveWidget(index, 1)}
                            disabled={index === widgets.length - 1}
                            className="text-slate-400 hover:text-primary disabled:opacity-30"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="text-slate-600 gap-2" onClick={() => signOut()}>
            <LogOut className="w-4 h-4" /> Sair da Conta
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        {visibleWidgets.map((w) => renderWidget(w.id))}
      </div>
    </div>
  )
}
