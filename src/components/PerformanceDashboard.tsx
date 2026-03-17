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
  CartesianGrid,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

const growthConfig = { novos: { label: 'Novos Pacientes', color: '#6366f1' } }
const financeConfig = {
  recebido: { label: 'Recebido', color: '#10b981' },
  a_receber: { label: 'A Receber', color: '#f43f5e' },
}
const attendanceConfig = {
  agendado: { label: 'Agendado', color: '#6366f1' },
  compareceu: { label: 'Compareceu', color: '#10b981' },
  faltou: { label: 'Faltou', color: '#f43f5e' },
  desmarcou: { label: 'Desmarcou', color: '#f59e0b' },
}

export function PerformanceDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    monthlyRevenue: 0,
    monthlyAppointments: 0,
    growthData: [] as any[],
    financeData: [] as any[],
    attendanceData: [] as any[],
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      setLoading(true)

      const now = new Date()
      const startCurrentMonth = startOfMonth(now)
      const endCurrentMonth = endOfMonth(now)
      const sixMonthsAgo = subMonths(startCurrentMonth, 5)

      const [{ data: pats }, { data: fins }, { data: apts }] = await Promise.all([
        supabase.from('pacientes').select('id, data_criacao').eq('usuario_id', user.id),
        supabase
          .from('financeiro')
          .select('mes, ano, valor_recebido, valor_a_receber')
          .eq('usuario_id', user.id)
          .gte('ano', sixMonthsAgo.getFullYear()),
        supabase
          .from('agendamentos')
          .select('status')
          .eq('usuario_id', user.id)
          .gte('data_hora', startCurrentMonth.toISOString())
          .lt('data_hora', endCurrentMonth.toISOString()),
      ])

      const totalPatients = pats?.length || 0
      const currentMonthFins =
        fins?.filter((f) => f.mes === now.getMonth() + 1 && f.ano === now.getFullYear()) || []
      const monthlyRevenue = currentMonthFins.reduce((sum, f) => sum + Number(f.valor_recebido), 0)
      const monthlyAppointments = apts?.length || 0

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(now, 5 - i)
        return {
          month: d.getMonth() + 1,
          year: d.getFullYear(),
          label: d.toLocaleString('pt-BR', { month: 'short' }),
        }
      })

      const growthData = last6Months.map((m) => {
        const novos =
          pats?.filter((p) => {
            if (!p.data_criacao) return false
            const pd = new Date(p.data_criacao)
            return pd.getMonth() + 1 === m.month && pd.getFullYear() === m.year
          }).length || 0
        return { name: m.label, novos }
      })

      const financeData = last6Months.map((m) => {
        const mFins = fins?.filter((f) => f.mes === m.month && f.ano === m.year) || []
        const recebido = mFins.reduce((sum, f) => sum + Number(f.valor_recebido), 0)
        const a_receber = mFins.reduce((sum, f) => sum + Number(f.valor_a_receber), 0)
        return { name: m.label, recebido, a_receber }
      })

      const statusCounts =
        apts?.reduce(
          (acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      const attendanceData = [
        { name: 'Agendado', value: statusCounts['agendado'] || 0, fill: '#6366f1' },
        { name: 'Compareceu', value: statusCounts['compareceu'] || 0, fill: '#10b981' },
        { name: 'Faltou', value: statusCounts['faltou'] || 0, fill: '#f43f5e' },
        { name: 'Desmarcou', value: statusCounts['desmarcou'] || 0, fill: '#f59e0b' },
      ].filter((d) => d.value > 0)

      setMetrics({
        totalPatients,
        monthlyRevenue,
        monthlyAppointments,
        growthData,
        financeData,
        attendanceData,
      })
      setLoading(false)
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
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
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Receita (Mês)</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {metrics.monthlyRevenue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Atendimentos (Mês)</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics.monthlyAppointments}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Crescimento (Últimos 6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthConfig} className="h-[200px] w-full">
              <LineChart data={metrics.growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="novos"
                  stroke="var(--color-novos)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">Saúde Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={financeConfig} className="h-[200px] w-full">
              <BarChart data={metrics.financeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="recebido"
                  name="Recebido"
                  fill="var(--color-recebido)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
                <Bar
                  dataKey="a_receber"
                  name="A Receber"
                  fill="var(--color-a_receber)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Taxa de Comparecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.attendanceData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">
                Nenhum dado no mês
              </div>
            ) : (
              <ChartContainer config={attendanceConfig} className="h-[200px] w-full">
                <PieChart>
                  <Pie
                    data={metrics.attendanceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {metrics.attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
