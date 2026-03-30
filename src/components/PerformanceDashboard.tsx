import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Users, Coins, CalendarCheck } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { formatBRL } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const cancelConfig = {
  Imprevisto: { label: 'Imprevisto', color: '#f43f5e' },
  Remarcação: { label: 'Remarcação', color: '#f59e0b' },
  Saúde: { label: 'Saúde', color: '#10b981' },
  Outros: { label: 'Outros', color: '#64748b' },
}

export function PerformanceDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    monthlyRevenue: 0,
    monthlyAppointments: 0,
    cancelReasons: [] as any[],
    monthlyCancellations: [] as any[],
    patientCancellationRate: [] as any[],
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      setLoading(true)

      const now = new Date()
      const startCurrentMonth = startOfMonth(now)
      const endCurrentMonth = endOfMonth(now)

      const [{ data: apts }, { data: fins }] = await Promise.all([
        supabase.from('agendamentos').select('*, pacientes(nome)').eq('usuario_id', user.id),
        supabase
          .from('financeiro')
          .select('*')
          .eq('usuario_id', user.id)
          .eq('mes', now.getMonth() + 1)
          .eq('ano', now.getFullYear()),
      ])

      const allApts = apts || []
      const currentMonthApts = allApts.filter(
        (a) =>
          a.data_hora >= startCurrentMonth.toISOString() &&
          a.data_hora <= endCurrentMonth.toISOString(),
      )

      const cancelledApts = allApts.filter((a) => a.status === 'desmarcou')

      // Razões de cancelamento (Pie Chart)
      const reasonsMap: Record<string, number> = {}
      cancelledApts.forEach((a) => {
        const reason = a.motivo_cancelamento?.toLowerCase() || 'outros'
        let category = 'Outros'
        if (reason.includes('imprevisto') || reason.includes('trabalho')) category = 'Imprevisto'
        if (reason.includes('remarcação') || reason.includes('viagem')) category = 'Remarcação'
        if (reason.includes('saúde') || reason.includes('doente') || reason.includes('médico'))
          category = 'Saúde'
        reasonsMap[category] = (reasonsMap[category] || 0) + 1
      })
      const cancelReasons = Object.keys(reasonsMap).map((k) => ({
        name: k,
        value: reasonsMap[k],
        fill: cancelConfig[k as keyof typeof cancelConfig]?.color || '#000',
      }))

      // Tendência de cancelamentos mensal (Line Chart)
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(now, 5 - i)
        return {
          month: d.getMonth() + 1,
          year: d.getFullYear(),
          label: d.toLocaleString('pt-BR', { month: 'short' }),
        }
      })

      const monthlyCancellations = last6Months.map((m) => {
        const total = allApts.filter(
          (a) =>
            new Date(a.data_hora).getMonth() + 1 === m.month &&
            new Date(a.data_hora).getFullYear() === m.year,
        ).length
        const cancelled = allApts.filter(
          (a) =>
            a.status === 'desmarcou' &&
            new Date(a.data_hora).getMonth() + 1 === m.month &&
            new Date(a.data_hora).getFullYear() === m.year,
        ).length
        return { name: m.label, total, cancelados: cancelled }
      })

      // Taxa de cancelamento por paciente
      const patientStats: Record<string, { total: number; cancelled: number; nome: string }> = {}
      allApts.forEach((a) => {
        const pid = a.paciente_id
        if (!patientStats[pid])
          patientStats[pid] = {
            total: 0,
            cancelled: 0,
            nome: Array.isArray(a.pacientes) ? a.pacientes[0]?.nome : a.pacientes?.nome,
          }
        patientStats[pid].total += 1
        if (a.status === 'desmarcou') patientStats[pid].cancelled += 1
      })

      const patientRate = Object.values(patientStats)
        .filter((p) => p.total > 2) // only patients with more than 2 appointments
        .map((p) => ({
          nome: p.nome,
          taxa: Math.round((p.cancelled / p.total) * 100),
          total: p.total,
          cancelados: p.cancelled,
        }))
        .sort((a, b) => b.taxa - a.taxa)
        .slice(0, 5)

      setMetrics({
        totalPatients: Object.keys(patientStats).length,
        monthlyRevenue: (fins || []).reduce((acc, f) => acc + Number(f.valor_recebido), 0),
        monthlyAppointments: currentMonthApts.length,
        cancelReasons,
        monthlyCancellations,
        patientCancellationRate: patientRate,
      })
      setLoading(false)
    }
    fetchData()
  }, [user])

  if (loading)
    return (
      <div className="h-40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )

  const chartHeight = isMobile ? 250 : 300

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pacientes Ativos</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.totalPatients}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Receita (Mês)</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {formatBRL(metrics.monthlyRevenue)}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Atendimentos (Mês)</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.monthlyAppointments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200 rounded-[1.5rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800">
              Motivos de Cancelamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.cancelReasons.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">
                Nenhum dado disponível
              </div>
            ) : (
              <ChartContainer config={cancelConfig} className={`h-[${chartHeight}px] w-full`}>
                <PieChart>
                  <Pie
                    data={metrics.cancelReasons}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {metrics.cancelReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 rounded-[1.5rem]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800">
              Tendência de Cancelamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ cancelados: { label: 'Cancelados', color: '#f43f5e' } }}
              className={`h-[${chartHeight}px] w-full min-h-[200px]`}
            >
              <LineChart data={metrics.monthlyCancellations}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 13, fill: '#64748b' }}
                  dy={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="cancelados"
                  stroke="#f43f5e"
                  strokeWidth={4}
                  dot={{ r: 5, fill: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 rounded-[1.5rem] lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800">
              Maior Taxa de Evasão/Cancelamento
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {metrics.patientCancellationRate.length === 0 ? (
              <div className="text-slate-400 text-sm">Dados insuficientes.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead className="text-center">Total Agendado</TableHead>
                    <TableHead className="text-center">Cancelados</TableHead>
                    <TableHead className="text-right">Taxa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.patientCancellationRate.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-bold">{p.nome}</TableCell>
                      <TableCell className="text-center">{p.total}</TableCell>
                      <TableCell className="text-center text-red-500 font-semibold">
                        {p.cancelados}
                      </TableCell>
                      <TableCell className="text-right font-black text-red-600">
                        {p.taxa}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
