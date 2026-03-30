import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, CartesianGrid, YAxis } from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { BrainCircuit } from 'lucide-react'
import { startOfDay, subDays } from 'date-fns'

export function MentalHealthIndicators() {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const { data: testes } = await supabase
        .from('testes_pacientes')
        .select('data_conclusao, respostas_json, paciente_id, pacientes(nome)')
        .eq('usuario_id', user.id)
        .eq('status', 'concluido')
        .order('data_conclusao', { ascending: true })

      const parsedData = (testes || []).map((t) => {
        let score = 5
        if (t.respostas_json) {
          const r = t.respostas_json as Record<string, any>
          if (r.bem_estar) score = Number(r.bem_estar)
          else if (r.humor) score = Number(r.humor)
          else {
            const firstNum = Object.values(r).find((v) => !isNaN(Number(v)))
            if (firstNum) score = Number(firstNum)
          }
        }
        return {
          date: new Date(t.data_conclusao || '').getTime(),
          dateStr: new Date(t.data_conclusao || '').toLocaleDateString('pt-BR', {
            month: 'short',
            day: 'numeric',
          }),
          score,
          paciente: Array.isArray(t.pacientes) ? t.pacientes[0]?.nome : t.pacientes?.nome,
        }
      })

      if (parsedData.length === 0) {
        const mock = Array.from({ length: 10 }).map((_, i) => ({
          date: Date.now() - (10 - i) * 86400000 * 3,
          dateStr: new Date(Date.now() - (10 - i) * 86400000 * 3).toLocaleDateString('pt-BR', {
            month: 'short',
            day: 'numeric',
          }),
          score: Math.floor(Math.random() * 4) + 5 + i * 0.2,
          paciente: 'Geral (Exemplo)',
        }))
        setData(mock)
      } else {
        setData(parsedData)
      }
    }
    fetchData()
  }, [user])

  const filteredData = useMemo(() => {
    if (period === 'all') return data
    const days = parseInt(period)
    const limit = subDays(startOfDay(new Date()), days).getTime()
    return data.filter((d) => d.date >= limit)
  }, [data, period])

  const chartConfig = { score: { label: 'Bem-estar', color: '#10b981' } }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
          <BrainCircuit className="w-4 h-4 text-emerald-600" /> Indicadores de Bem-estar
        </CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Todo o período</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-6">
        {filteredData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">
            Nenhum dado no período.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[200px] md:h-[250px] w-full min-h-[200px]"
          >
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="dateStr"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis domain={[1, 10]} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-score)"
                strokeWidth={3}
                dot={{ r: 4, fill: 'var(--color-score)' }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
