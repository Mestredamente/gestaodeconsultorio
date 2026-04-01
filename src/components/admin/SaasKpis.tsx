import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Users, TrendingUp, UserMinus, AlertCircle } from 'lucide-react'

export default function SaasKpis() {
  const [stats, setStats] = useState({ total: 0, revenue: 0, churn: 0, pending: 0 })
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(name, price)')
    const { data: payments } = await supabase.from('payments').select('*').eq('status', 'pending')

    if (subs) {
      const active = subs.filter((s) => s.status === 'active')
      const cancelled = subs.filter((s) => s.status === 'cancelled')
      const revenue = active.reduce((acc, s) => acc + (Number(s.subscription_plans?.price) || 0), 0)
      const churn = subs.length ? (cancelled.length / subs.length) * 100 : 0

      setStats({
        total: active.length,
        revenue,
        churn: churn,
        pending: payments?.length || 0,
      })

      const plansCount: any = { Gratuito: 0, Básico: 0, Pro: 0 }
      active.forEach((s) => {
        const name = s.subscription_plans?.name
        if (name && plansCount[name] !== undefined) plansCount[name]++
        else if (name) plansCount[name] = 1
      })
      setChartData(Object.keys(plansCount).map((k) => ({ name: k, assinantes: plansCount[k] })))
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total de Assinantes
            </CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Receita Mensal</CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">R$ {stats.revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">Taxa de Churn</CardTitle>
            <UserMinus className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.churn.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">
              Pagamentos Pendentes
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Assinantes por Plano</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer
            config={{ assinantes: { label: 'Assinantes', color: 'hsl(var(--primary))' } }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="assinantes"
                  fill="var(--color-assinantes)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
