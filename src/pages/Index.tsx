import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  TrendingUp,
  Plus,
  Clock,
  Wallet,
  GripHorizontal,
  CalendarDays,
  FileText,
  ChevronRight,
  Bell,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  LayoutDashboard,
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatBRL, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import WhatsAppBillingDialog from '@/components/WhatsAppBillingDialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet'

const DEFAULT_ORDER = ['upcoming', 'finances', 'alerts', 'shortcuts']

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [widgetOrder, setWidgetOrder] = useState<string[]>(DEFAULT_ORDER)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const [stats, setStats] = useState({ sessoesHoje: 0, saldoMes: 0, pacientesAtivos: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [inadimplentes, setInadimplentes] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_order')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const validWidgets = parsed.filter((w: string) => DEFAULT_ORDER.includes(w))
        const missingWidgets = DEFAULT_ORDER.filter((w) => !validWidgets.includes(w))
        setWidgetOrder([...validWidgets, ...missingWidgets])
      } catch (e) {
        setWidgetOrder(DEFAULT_ORDER)
      }
    }
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1

      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      const [aptRes, finRes, patRes, despRes, alertRes, allFinRes] = await Promise.all([
        supabase
          .from('agendamentos')
          .select('*, pacientes(nome, telefone)')
          .eq('usuario_id', user.id)
          .gte('data_hora', startOfDay)
          .lte('data_hora', endOfDay)
          .order('data_hora'),
        supabase.from('financeiro').select('*').eq('usuario_id', user.id).eq('ano', year),
        supabase.from('pacientes').select('id', { count: 'exact' }).eq('usuario_id', user.id),
        supabase
          .from('despesas')
          .select('*')
          .eq('usuario_id', user.id)
          .gte('data', `${year}-01-01`),
        supabase
          .from('financeiro')
          .select('*, pacientes(nome)')
          .eq('usuario_id', user.id)
          .gt('valor_a_receber', 0)
          .lt('mes', month),
        supabase
          .from('financeiro')
          .select('*, pacientes(nome, telefone)')
          .eq('usuario_id', user.id)
          .gt('valor_a_receber', 0),
      ])

      const todayApts = aptRes.data || []
      setStats({
        sessoesHoje: todayApts.length,
        saldoMes:
          (finRes.data || [])
            .filter((f) => f.mes === month)
            .reduce((acc, curr) => acc + Number(curr.valor_recebido), 0) -
          (despRes.data || [])
            .filter((d) => new Date(d.data).getMonth() + 1 === month)
            .reduce((acc, curr) => acc + Number(curr.valor), 0),
        pacientesAtivos: patRes.count || 0,
      })

      setUpcoming(todayApts.filter((a) => a.status === 'agendado'))
      setAlerts(alertRes.data || [])

      const nowTime = new Date().getTime()
      const inadimplentesFiltered = (allFinRes.data || [])
        .map((f) => {
          const diffTime = Math.abs(nowTime - new Date(f.data_atualizacao).getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return { ...f, diffDays }
        })
        .filter((f) => f.diffDays > 30)
        .sort((a, b) => b.diffDays - a.diffDays)

      setInadimplentes(inadimplentesFiltered)

      const monthsData = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(today.getMonth() - i)
        const m = d.getMonth() + 1
        const y = d.getFullYear()

        monthsData.push({
          name: d.toLocaleDateString('pt-BR', { month: 'short' }),
          receitas: (finRes.data || [])
            .filter((f) => f.mes === m && f.ano === y)
            .reduce((acc, curr) => acc + Number(curr.valor_recebido), 0),
          despesas: (despRes.data || [])
            .filter(
              (f) => new Date(f.data).getMonth() + 1 === m && new Date(f.data).getFullYear() === y,
            )
            .reduce((acc, curr) => acc + Number(curr.valor), 0),
        })
      }
      setChartData(monthsData)
      setLoading(false)
    }

    const fetchNotifs = async () => {
      if (!user) return
      const { data } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false })
        .limit(20)
      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.lida).length)
      }
    }

    fetchDashboardData()
    fetchNotifs()

    if (user) {
      const sub = supabase
        .channel('dashboard_notifs')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notificacoes',
            filter: `usuario_id=eq.${user.id}`,
          },
          () => {
            fetchNotifs()
          },
        )
        .subscribe()
      return () => {
        supabase.removeChannel(sub)
      }
    }
  }, [user])

  const getNotificationIcon = (titulo: string) => {
    const lower = titulo.toLowerCase()
    if (lower.includes('pagamento') || lower.includes('cobrança') || lower.includes('fatura'))
      return <Wallet className="w-4 h-4 text-emerald-500" />
    if (lower.includes('sessão') || lower.includes('agendamento') || lower.includes('consulta'))
      return <CalendarDays className="w-4 h-4 text-primary" />
    if (lower.includes('paciente') || lower.includes('cadastro'))
      return <Users className="w-4 h-4 text-indigo-500" />
    return <Bell className="w-4 h-4 text-slate-500" />
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('widgetId', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedId(id)
    setTimeout(() => {
      const el = document.getElementById(`widget-${id}`)
      if (el) el.style.opacity = '0.3'
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== draggedId) {
      setDragOverId(id)
    }
  }

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (dragOverId === id) {
      setDragOverId(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverId(null)
    const dId = e.dataTransfer.getData('widgetId')

    const el = document.getElementById(`widget-${dId}`)
    if (el) el.style.opacity = '1'

    if (!dId || dId === targetId) {
      setDraggedId(null)
      return
    }

    const newOrder = [...widgetOrder]
    const draggedIdx = newOrder.indexOf(dId)
    const targetIdx = newOrder.indexOf(targetId)

    newOrder.splice(draggedIdx, 1)
    newOrder.splice(targetIdx, 0, dId)

    setWidgetOrder(newOrder)
    localStorage.setItem('dashboard_order', JSON.stringify(newOrder))
    setDraggedId(null)
  }

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    setDraggedId(null)
    setDragOverId(null)
    const el = document.getElementById(`widget-${id}`)
    if (el) el.style.opacity = '1'
  }

  const resetLayout = () => {
    setWidgetOrder(DEFAULT_ORDER)
    localStorage.removeItem('dashboard_order')
  }

  const WidgetWrapper = ({ id, title, children }: { id: string; title: string; children: any }) => {
    const index = widgetOrder.indexOf(id)
    const isFirst = index === 0
    const isLast = index === widgetOrder.length - 1

    const moveUp = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isFirst) return
      const newOrder = [...widgetOrder]
      const temp = newOrder[index - 1]
      newOrder[index - 1] = newOrder[index]
      newOrder[index] = temp
      setWidgetOrder(newOrder)
      localStorage.setItem('dashboard_order', JSON.stringify(newOrder))
    }

    const moveDown = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isLast) return
      const newOrder = [...widgetOrder]
      const temp = newOrder[index + 1]
      newOrder[index + 1] = newOrder[index]
      newOrder[index] = temp
      setWidgetOrder(newOrder)
      localStorage.setItem('dashboard_order', JSON.stringify(newOrder))
    }

    const isOver = dragOverId === id
    const isDragged = draggedId === id

    return (
      <div
        id={`widget-${id}`}
        draggable
        onDragStart={(e) => handleDragStart(e, id)}
        onDrop={(e) => handleDrop(e, id)}
        onDragOver={(e) => handleDragOver(e, id)}
        onDragLeave={(e) => handleDragLeave(e, id)}
        onDragEnd={(e) => handleDragEnd(e, id)}
        className={cn(
          'bg-white rounded-[2rem] shadow-sm border p-6 sm:p-8 flex flex-col gap-4 transition-all duration-200 relative group h-full',
          !isDragged && 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300',
          isOver && 'border-primary border-dashed bg-primary/5 scale-[1.02] shadow-lg z-10',
          !isOver && !isDragged && 'border-slate-100/60',
        )}
      >
        <div className="flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-800 text-lg sm:text-xl tracking-tight">{title}</h3>
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-slate-50/80 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-primary md:hidden"
              onClick={moveUp}
              disabled={isFirst}
              title="Mover para cima"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-primary md:hidden"
              onClick={moveDown}
              disabled={isLast}
              title="Mover para baixo"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <div
              className="h-8 w-8 items-center justify-center text-slate-400 hover:text-primary hidden md:flex cursor-grab active:cursor-grabbing"
              title="Arraste para reordenar"
            >
              <GripHorizontal className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="flex-1 w-full flex flex-col">{children}</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-slate-500 font-medium animate-pulse">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  const renderWidget = (id: string) => {
    switch (id) {
      case 'upcoming':
        return (
          <WidgetWrapper key={id} id={id} title="Próximas Sessões Hoje">
            {upcoming.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed flex-1">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-slate-100">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">Nenhuma sessão pendente para hoje.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {upcoming.slice(0, 4).map((apt) => {
                  const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-colors cursor-pointer group"
                      onClick={() => navigate('/agenda')}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0 group-hover:border-primary/30 transition-colors">
                          <span className="font-bold text-primary text-sm">
                            {new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                            {p?.nome}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {apt.is_online ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 py-0 h-4 px-2"
                              >
                                Online
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 py-0 h-4 px-2"
                              >
                                Presencial
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  )
                })}
                {upcoming.length > 4 && (
                  <Button
                    variant="ghost"
                    className="w-full text-slate-500 mt-2 rounded-xl hover:bg-slate-50"
                    onClick={() => navigate('/agenda')}
                  >
                    Ver todas (+{upcoming.length - 4})
                  </Button>
                )}
              </div>
            )}
          </WidgetWrapper>
        )
      case 'finances':
        return (
          <WidgetWrapper key={id} id={id} title="Fluxo Financeiro (6 Meses)">
            <div className="h-[250px] w-full mt-auto flex-1 flex flex-col justify-end">
              <ChartContainer
                config={{
                  receitas: { label: 'Receitas', color: '#10b981' },
                  despesas: { label: 'Despesas', color: '#f43f5e' },
                }}
                className="w-full h-full min-h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: '#f8fafc' }} />
                    <Bar
                      dataKey="receitas"
                      fill="var(--color-receitas)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                    />
                    <Bar
                      dataKey="despesas"
                      fill="var(--color-despesas)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </WidgetWrapper>
        )
      case 'alerts':
        return (
          <WidgetWrapper key={id} id={id} title="Pendências de Meses Anteriores">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 border-dashed flex-1">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3 border border-emerald-100">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-slate-500 font-medium">Nenhuma pendência crítica encontrada.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {alerts.slice(0, 4).map((al) => {
                  const p = Array.isArray(al.pacientes) ? al.pacientes[0] : al.pacientes
                  return (
                    <div
                      key={al.id}
                      className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex justify-between items-center hover:bg-amber-100/50 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-amber-900 line-clamp-1">{p?.nome}</p>
                        <p className="text-xs text-amber-700 mt-0.5 font-medium">
                          Ref: {String(al.mes).padStart(2, '0')}/{al.ano}
                        </p>
                      </div>
                      <span className="font-extrabold text-amber-700 bg-amber-100/50 px-3 py-1.5 rounded-lg border border-amber-200/50">
                        {formatBRL(al.valor_a_receber)}
                      </span>
                    </div>
                  )
                })}
                {alerts.length > 4 && (
                  <Button
                    variant="ghost"
                    className="w-full text-amber-700 mt-2 rounded-xl hover:bg-amber-50"
                    onClick={() => navigate('/carteira')}
                  >
                    Ver todas (+{alerts.length - 4})
                  </Button>
                )}
              </div>
            )}
          </WidgetWrapper>
        )
      case 'shortcuts':
        return (
          <WidgetWrapper key={id} id={id} title="Acesso Rápido">
            <div className="grid grid-cols-2 gap-3 h-full pb-4 flex-1">
              <Button
                variant="outline"
                className="h-auto w-full py-5 flex flex-col items-center justify-center gap-3 rounded-2xl border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm hover:shadow"
                onClick={() => navigate('/agenda')}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full text-primary shrink-0">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-700 text-center text-sm leading-tight block w-full">
                  Novo Agendamento
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto w-full py-5 flex flex-col items-center justify-center gap-3 rounded-2xl border-slate-200 hover:border-indigo-500/30 hover:bg-indigo-50 transition-all shadow-sm hover:shadow"
                onClick={() => navigate('/pacientes/novo')}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full text-indigo-600 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-700 text-center text-sm leading-tight block w-full">
                  Novo Paciente
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto w-full py-5 flex flex-col items-center justify-center gap-3 rounded-2xl border-slate-200 hover:border-emerald-500/30 hover:bg-emerald-50 transition-all shadow-sm hover:shadow"
                onClick={() => navigate('/carteira')}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-700 text-center text-sm leading-tight block w-full">
                  Receber Pagamento
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto w-full py-5 flex flex-col items-center justify-center gap-3 rounded-2xl border-slate-200 hover:border-rose-500/30 hover:bg-rose-50 transition-all shadow-sm hover:shadow"
                onClick={() => navigate('/carteira')}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full text-rose-600 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="font-semibold text-slate-700 text-center text-sm leading-tight block w-full">
                  Nova Despesa
                </span>
              </Button>
            </div>
          </WidgetWrapper>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-12 px-4 sm:px-6 lg:px-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-slate-200/60 shadow-sm">
        <div className="px-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Olá, {user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base font-medium">
            Aqui está o resumo do seu consultório hoje.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl gap-2 relative border-slate-200 text-slate-700 hover:text-primary hover:bg-primary/5 shadow-sm h-11 px-5 w-full sm:w-auto bg-white"
              >
                <Bell className="w-5 h-5" />
                <span className="font-semibold">Notificações</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] text-white items-center justify-center font-bold shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md border-l border-slate-200 px-0 flex flex-col bg-slate-50/50 backdrop-blur-xl">
              <SheetHeader className="px-6 py-5 border-b border-slate-200/60 shrink-0 bg-white">
                <SheetTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  Central de Alertas
                </SheetTitle>
                <SheetDescription className="font-medium mt-1">
                  Acompanhe lembretes de sessão, pagamentos e atualizações em tempo real.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">Nenhuma notificação recente.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'p-4 rounded-2xl border transition-all shadow-sm',
                        n.lida
                          ? 'bg-white border-slate-200/60 opacity-75 hover:opacity-100'
                          : 'bg-white border-primary/20 ring-1 ring-primary/5',
                      )}
                    >
                      <div className="flex gap-4">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border',
                            n.lida
                              ? 'bg-slate-50 border-slate-100'
                              : 'bg-primary/5 border-primary/10',
                          )}
                        >
                          {getNotificationIcon(n.titulo)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={cn(
                                'text-sm font-bold',
                                n.lida ? 'text-slate-700' : 'text-slate-900',
                              )}
                            >
                              {n.titulo}
                            </h4>
                            {!n.lida && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 shadow-sm" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                            {n.mensagem}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-2.5 font-semibold uppercase tracking-wider">
                            {new Date(n.data_criacao).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-6 border-t border-slate-200/60 shrink-0 bg-white">
                <Button
                  className="w-full rounded-xl font-bold h-12 shadow-sm"
                  onClick={() => navigate('/notificacoes')}
                >
                  Ver todas as notificações
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Static KPIs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-2">
          <div className="bg-white border border-slate-200/60 shadow-sm rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex items-center gap-3 text-primary mb-4 relative">
              <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/10">
                <CalendarDays className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-wide uppercase text-slate-600 group-hover:text-primary transition-colors">
                Sessões Hoje
              </span>
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tight relative">
              {stats.sessoesHoje}
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 shadow-sm rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="flex items-center gap-3 text-emerald-600 mb-4 relative">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-wide uppercase text-slate-600 group-hover:text-emerald-600 transition-colors">
                Saldo Mensal
              </span>
            </div>
            <p className="text-4xl font-black text-emerald-950 tracking-tight relative">
              {formatBRL(stats.saldoMes)}
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 shadow-sm rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
            <div className="flex items-center gap-3 text-indigo-600 mb-4 relative">
              <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-wide uppercase text-slate-600 group-hover:text-indigo-600 transition-colors">
                Pacientes Ativos
              </span>
            </div>
            <p className="text-4xl font-black text-indigo-950 tracking-tight relative">
              {stats.pacientesAtivos}
            </p>
          </div>
        </div>

        {/* Fixed Full-Width Section for Inadimplentes */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 p-6 sm:p-8 flex flex-col gap-5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl shadow-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
                  Pacientes Inadimplentes
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  Faturas em aberto com mais de 30 dias.
                </p>
              </div>
            </div>
            {inadimplentes.length > 0 && (
              <Badge variant="destructive" className="px-3 py-1 text-sm rounded-lg shadow-sm">
                {inadimplentes.length} {inadimplentes.length === 1 ? 'pendência' : 'pendências'}
              </Badge>
            )}
          </div>

          {inadimplentes.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center text-center py-12 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <h4 className="text-slate-900 font-bold mb-1">Tudo em dia!</h4>
              <p className="text-slate-500 font-medium">Nenhum paciente com faturas em atraso.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <div className="block md:hidden divide-y divide-slate-100">
                {inadimplentes.slice(0, 10).map((item) => {
                  const p = Array.isArray(item.pacientes) ? item.pacientes[0] : item.pacientes
                  const isCritical = item.diffDays > 60
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'p-4 flex flex-col gap-3',
                        isCritical ? 'bg-red-50/30' : 'bg-white',
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="font-bold text-slate-900 truncate">{p?.nome}</p>
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border mt-1',
                              isCritical
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-amber-100 text-amber-700 border-amber-200',
                            )}
                          >
                            {item.diffDays} dias de atraso
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={cn(
                              'font-black tracking-tight',
                              isCritical ? 'text-red-700' : 'text-amber-700',
                            )}
                          >
                            {formatBRL(item.valor_a_receber)}
                          </p>
                        </div>
                      </div>
                      <div className="w-full pt-2 border-t border-slate-100/60 flex justify-end">
                        <WhatsAppBillingDialog
                          pacienteId={item.paciente_id}
                          patientName={p?.nome || ''}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50 border-slate-200">
                      <TableHead className="font-bold text-slate-700 py-4 h-auto">
                        Paciente
                      </TableHead>
                      <TableHead className="font-bold text-slate-700 py-4 h-auto">
                        Valor em Aberto
                      </TableHead>
                      <TableHead className="font-bold text-slate-700 py-4 h-auto">Atraso</TableHead>
                      <TableHead className="text-right font-bold text-slate-700 py-4 h-auto">
                        Ação
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {inadimplentes.slice(0, 10).map((item) => {
                      const p = Array.isArray(item.pacientes) ? item.pacientes[0] : item.pacientes
                      const isCritical = item.diffDays > 60
                      return (
                        <TableRow
                          key={item.id}
                          className={cn(
                            'transition-colors border-slate-100',
                            isCritical ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-slate-50/80',
                          )}
                        >
                          <TableCell className="font-semibold text-slate-900 py-4">
                            {p?.nome}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'font-black tracking-tight py-4',
                              isCritical ? 'text-red-700' : 'text-amber-700',
                            )}
                          >
                            {formatBRL(item.valor_a_receber)}
                          </TableCell>
                          <TableCell className="py-4">
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border shadow-sm',
                                isCritical
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : 'bg-amber-100 text-amber-700 border-amber-200',
                              )}
                            >
                              {item.diffDays} dias
                            </span>
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <WhatsAppBillingDialog
                              pacienteId={item.paciente_id}
                              patientName={p?.nome || ''}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          {inadimplentes.length > 10 && (
            <Button
              variant="outline"
              className="w-full text-slate-600 mt-1 rounded-xl h-12 font-bold shadow-sm"
              onClick={() => navigate('/carteira')}
            >
              Ver todos os {inadimplentes.length} pacientes em atraso na Carteira
            </Button>
          )}
        </div>

        {/* Sortable Widgets Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
          {widgetOrder.map((id) => (
            <div key={id} className="h-full">
              {renderWidget(id)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
