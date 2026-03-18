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
const retentionConfig = {
  retidos: { label: 'Retidos', color: '#10b981' },
  nao_retidos: { label: 'Não Retidos', color: '#64748b' },
}
const attendanceAnalyticsConfig = {
  compareceu: { label: 'Compareceu', color: '#10b981' },
  faltou_desmarcou: { label: 'Não Compareceu', color: '#f43f5e' },
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
    retentionData: [] as any[],
    analyticsChartData: [] as any[],
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      setLoading(true)

      const now = new Date()
      const startCurrentMonth = startOfMonth(now)
      const endCurrentMonth = endOfMonth(now)
      const sixMonthsAgo = subMonths(startCurrentMonth, 5)

      const [
        { data: pats },
        { data: fins },
        { data: apts },
        { data: allCompareceu },
        { data: msgs },
      ] = await Promise.all([
        supabase
          .from('pacientes')
          .select('id, data_criacao, recorrencia')
          .eq('usuario_id', user.id),
        supabase
          .from('financeiro')
          .select('mes, ano, valor_recebido, valor_a_receber')
          .eq('usuario_id', user.id)
          .gte('ano', sixMonthsAgo.getFullYear()),
        supabase
          .from('agendamentos')
          .select('status, data_hora, paciente_id')
          .eq('usuario_id', user.id)
          .gte('data_hora', startCurrentMonth.toISOString())
          .lt('data_hora', endCurrentMonth.toISOString()),
        supabase
          .from('agendamentos')
          .select('paciente_id')
          .eq('usuario_id', user.id)
          .eq('status', 'compareceu'),
        supabase
          .from('historico_mensagens')
          .select('paciente_id, data_envio')
          .eq('usuario_id', user.id)
          .in('tipo', ['lembrete', 'pre_consulta', 'lembrete_whatsapp'])
          .gte('data_envio', subMonths(startCurrentMonth, 1).toISOString()),
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

      const compareceuCountByPatient =
        allCompareceu?.reduce(
          (acc, a) => {
            acc[a.paciente_id] = (acc[a.paciente_id] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      let retainedCount = 0
      const validPats = pats || []
      validPats.forEach((p) => {
        if (
          (compareceuCountByPatient[p.id] && compareceuCountByPatient[p.id] > 1) ||
          ['mensal', 'semanal'].includes(p.recorrencia?.toLowerCase() || '')
        ) {
          retainedCount++
        }
      })
      const notRetainedCount = Math.max(validPats.length - retainedCount, 0)

      const retentionData = [
        { name: 'Retidos', value: retainedCount, fill: '#10b981' },
        { name: 'Não Retidos', value: notRetainedCount, fill: '#64748b' },
      ].filter((d) => d.value > 0)

      const appointmentsWithReminder =
        apts
          ?.filter((a) => ['compareceu', 'faltou', 'desmarcou'].includes(a.status))
          .map((apt) => {
            const aptDate = new Date(apt.data_hora).getTime()
            const hasReminder = msgs?.some((m) => {
              if (m.paciente_id !== apt.paciente_id) return false
              const msgDate = new Date(m.data_envio).getTime()
              const diff = aptDate - msgDate
              return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000
            })
            return { ...apt, hasReminder }
          }) || []

      const attendedWithReminder = appointmentsWithReminder.filter(
        (a) => a.hasReminder && a.status === 'compareceu',
      ).length
      const totalWithReminder = appointmentsWithReminder.filter((a) => a.hasReminder).length

      const attendedWithoutReminder = appointmentsWithReminder.filter(
        (a) => !a.hasReminder && a.status === 'compareceu',
      ).length
      const totalWithoutReminder = appointmentsWithReminder.filter((a) => !a.hasReminder).length

      const analyticsChartData = [
        {
          name: 'Com Lembrete',
          compareceu: attendedWithReminder,
          faltou_desmarcou: totalWithReminder - attendedWithReminder,
        },
        {
          name: 'Sem Lembrete',
          compareceu: attendedWithoutReminder,
          faltou_desmarcou: totalWithoutReminder - attendedWithoutReminder,
        },
      ].filter((d) => d.compareceu + d.faltou_desmarcou > 0)

      setMetrics({
        totalPatients,
        monthlyRevenue,
        monthlyAppointments,
        growthData,
        financeData,
        attendanceData,
        retentionData,
        analyticsChartData,
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Crescimento de Pacientes (6 meses)
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

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Crescimento Mensal da Receita
            </CardTitle>
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

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Taxa de Retenção de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.retentionData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">
                Sem dados suficientes
              </div>
            ) : (
              <ChartContainer config={retentionConfig} className="h-[200px] w-full">
                <PieChart>
                  <Pie
                    data={metrics.retentionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {metrics.retentionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Taxa de Comparecimento (Mês Atual)
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

        <Card className="shadow-sm border-slate-200 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Impacto dos Lembretes na Assiduidade (Mês Atual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.analyticsChartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">
                Nenhum dado consolidado no mês
              </div>
            ) : (
              <ChartContainer config={attendanceAnalyticsConfig} className="h-[200px] w-full">
                <BarChart
                  data={metrics.analyticsChartData}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="compareceu"
                    name="Compareceu"
                    fill="var(--color-compareceu)"
                    stackId="a"
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="faltou_desmarcou"
                    name="Não Compareceu"
                    fill="var(--color-faltou_desmarcou)"
                    radius={[0, 4, 4, 0]}
                    stackId="a"
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
