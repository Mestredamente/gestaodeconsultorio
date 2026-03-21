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
  AlertCircle,
  GripHorizontal,
  RefreshCw,
  CalendarDays,
  FileText,
  ChevronRight,
} from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatBRL, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const DEFAULT_ORDER = ['kpis', 'upcoming', 'finances', 'alerts', 'shortcuts']

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [widgetOrder, setWidgetOrder] = useState<string[]>(DEFAULT_ORDER)

  const [stats, setStats] = useState({ sessoesHoje: 0, saldoMes: 0, pacientesAtivos: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_order')
    if (saved) {
      try {
        setWidgetOrder(JSON.parse(saved))
      } catch (e) {}
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

      const [aptRes, finRes, patRes, despRes, alertRes] = await Promise.all([
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
      ])

      const todayApts = aptRes.data || []
      const sessoesHoje = todayApts.length

      const currMonthFin = (finRes.data || []).filter((f) => f.mes === month)
      const currMonthDesp = (despRes.data || []).filter(
        (d) => new Date(d.data).getMonth() + 1 === month,
      )

      const receitas = currMonthFin.reduce((acc, curr) => acc + Number(curr.valor_recebido), 0)
      const despesas = currMonthDesp.reduce((acc, curr) => acc + Number(curr.valor), 0)

      setStats({
        sessoesHoje,
        saldoMes: receitas - despesas,
        pacientesAtivos: patRes.count || 0,
      })

      setUpcoming(todayApts.filter((a) => a.status === 'agendado'))
      setAlerts(alertRes.data || [])

      // Build chart data for the last 6 months
      const monthsData = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(today.getMonth() - i)
        const m = d.getMonth() + 1
        const y = d.getFullYear()

        const r = (finRes.data || [])
          .filter((f) => f.mes === m && f.ano === y)
          .reduce((acc, curr) => acc + Number(curr.valor_recebido), 0)

        const ex = (despRes.data || [])
          .filter(
            (f) => new Date(f.data).getMonth() + 1 === m && new Date(f.data).getFullYear() === y,
          )
          .reduce((acc, curr) => acc + Number(curr.valor), 0)

        monthsData.push({
          name: d.toLocaleDateString('pt-BR', { month: 'short' }),
          receitas: r,
          despesas: ex,
        })
      }
      setChartData(monthsData)
      setLoading(false)
    }

    fetchDashboardData()
  }, [user])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('widgetId', id)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const draggedId = e.dataTransfer.getData('widgetId')
    if (!draggedId || draggedId === targetId || draggedId === 'kpis' || targetId === 'kpis') return

    const newOrder = [...widgetOrder]
    const draggedIdx = newOrder.indexOf(draggedId)
    const targetIdx = newOrder.indexOf(targetId)

    newOrder.splice(draggedIdx, 1)
    newOrder.splice(targetIdx, 0, draggedId)

    setWidgetOrder(newOrder)
    localStorage.setItem('dashboard_order', JSON.stringify(newOrder))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const WidgetWrapper = ({ id, title, children }: any) => (
    <div
      draggable={id !== 'kpis'}
      onDragStart={(e) => handleDragStart(e, id)}
      onDrop={(e) => handleDrop(e, id)}
      onDragOver={handleDragOver}
      className={cn(
        'bg-white rounded-[2rem] shadow-sm border border-slate-100/60 p-6 sm:p-8 flex flex-col gap-4 transition-all relative group h-full',
        id !== 'kpis' && 'cursor-grab active:cursor-grabbing hover:shadow-md',
      )}
    >
      {id !== 'kpis' && (
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 text-slate-300 transition-opacity">
          <GripHorizontal className="w-5 h-5" />
        </div>
      )}
      {title && (
        <h3 className="font-bold text-slate-800 text-lg sm:text-xl tracking-tight">{title}</h3>
      )}
      <div className="flex-1 w-full">{children}</div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const renderWidget = (id: string) => {
    switch (id) {
      case 'kpis':
        return (
          <div key={id} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-2">
            <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-primary mb-4">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm tracking-wide uppercase">Sessões Hoje</span>
              </div>
              <p className="text-4xl font-extrabold text-slate-900">{stats.sessoesHoje}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-emerald-600 mb-4">
                <div className="p-2.5 bg-emerald-100 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm tracking-wide uppercase">Saldo Mensal</span>
              </div>
              <p className="text-4xl font-extrabold text-emerald-900">
                {formatBRL(stats.saldoMes)}
              </p>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3 text-indigo-600 mb-4">
                <div className="p-2.5 bg-indigo-100 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm tracking-wide uppercase">Pacientes Ativos</span>
              </div>
              <p className="text-4xl font-extrabold text-indigo-900">{stats.pacientesAtivos}</p>
            </div>
          </div>
        )
      case 'upcoming':
        return (
          <WidgetWrapper key={id} id={id} title="Próximas Sessões Hoje">
            {upcoming.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">Nenhuma sessão pendente para hoje.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 4).map((apt) => {
                  const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate('/agenda')}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                          <span className="font-bold text-primary text-sm">
                            {new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1">{p?.nome}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {apt.is_online ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 py-0 h-4"
                              >
                                <Video className="w-3 h-3 mr-1" /> Online
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 py-0 h-4"
                              >
                                Presencial
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  )
                })}
                {upcoming.length > 4 && (
                  <Button
                    variant="ghost"
                    className="w-full text-slate-500 mt-2 rounded-xl"
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
            <div className="h-[250px] w-full mt-4">
              <ChartContainer
                config={{
                  receitas: { label: 'Receitas', color: '#10b981' },
                  despesas: { label: 'Despesas', color: '#f43f5e' },
                }}
                className="w-full h-full"
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
          <WidgetWrapper key={id} id={id} title="Inadimplência (> 30 dias)">
            {alerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-slate-500 font-medium">Nenhuma pendência crítica.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 4).map((al) => {
                  const p = Array.isArray(al.pacientes) ? al.pacientes[0] : al.pacientes
                  return (
                    <div
                      key={al.id}
                      className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-amber-900 line-clamp-1">{p?.nome}</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Ref: {String(al.mes).padStart(2, '0')}/{al.ano}
                        </p>
                      </div>
                      <span className="font-extrabold text-amber-700">
                        {formatBRL(al.valor_a_receber)}
                      </span>
                    </div>
                  )
                })}
                {alerts.length > 4 && (
                  <Button
                    variant="ghost"
                    className="w-full text-amber-700 mt-2 rounded-xl hover:bg-amber-100"
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
            <div className="grid grid-cols-2 gap-3 h-full pb-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 rounded-2xl border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={() => navigate('/agenda')}
              >
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-semibold text-slate-700">Novo Agendamento</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 rounded-2xl border-slate-200 hover:border-indigo-500/30 hover:bg-indigo-50 transition-all"
                onClick={() => navigate('/pacientes/novo')}
              >
                <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-semibold text-slate-700">Novo Paciente</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 rounded-2xl border-slate-200 hover:border-emerald-500/30 hover:bg-emerald-50 transition-all"
                onClick={() => navigate('/carteira')}
              >
                <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="font-semibold text-slate-700">Receber Pagamento</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 rounded-2xl border-slate-200 hover:border-rose-500/30 hover:bg-rose-50 transition-all"
                onClick={() => navigate('/carteira')}
              >
                <div className="p-3 bg-rose-100 rounded-full text-rose-600">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-semibold text-slate-700">Nova Despesa</span>
              </Button>
            </div>
          </WidgetWrapper>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Olá, {user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1.5 text-base">
            Aqui está o resumo do seu consultório hoje.
          </p>
        </div>
        <Button
          variant="ghost"
          className="rounded-xl gap-2 text-slate-400 hover:text-slate-700"
          onClick={() => {
            setWidgetOrder(DEFAULT_ORDER)
            localStorage.removeItem('dashboard_order')
          }}
          title="Resetar ordem dos widgets"
        >
          <RefreshCw className="w-4 h-4" /> <span className="hidden sm:inline">Resetar Layout</span>
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {widgetOrder.includes('kpis') && renderWidget('kpis')}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {widgetOrder
            .filter((id) => id !== 'kpis')
            .map((id) => (
              <div key={id} className="h-full">
                {renderWidget(id)}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
