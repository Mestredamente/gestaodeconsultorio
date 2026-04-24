import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Users, Activity } from 'lucide-react'
import { PerformanceDashboard } from '@/components/PerformanceDashboard'

export function ClinicOwnerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ revenue: 0, patients: 0, appointments: 0 })

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const today = new Date()
      const currentMonth = today.getMonth() + 1
      const currentYear = today.getFullYear()

      const { data: fin } = await supabase
        .from('financeiro')
        .select('valor_recebido')
        .eq('mes', currentMonth)
        .eq('ano', currentYear)

      const rev = fin?.reduce((acc, curr) => acc + (curr.valor_recebido || 0), 0) || 0

      const { count: pts } = await supabase.from('pacientes').select('id', { count: 'exact' })
      const { count: apts } = await supabase
        .from('agendamentos')
        .select('id', { count: 'exact' })
        .gte('data_hora', new Date(today.getFullYear(), today.getMonth(), 1).toISOString())

      setStats({ revenue: rev, patients: pts || 0, appointments: apts || 0 })
    }
    fetchData()
  }, [user])

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 p-4 md:p-8 animate-fade-in overflow-x-hidden">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Visão Geral da Clínica</h1>
          <p className="text-slate-500">
            Acompanhe os principais indicadores e fluxo de caixa do seu negócio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">
              Faturamento Realizado (Mês Atual)
            </CardTitle>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-800">
              <span className="text-2xl text-slate-400 font-medium mr-1">R$</span>
              {stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total de Pacientes Ativos
            </CardTitle>
            <Users className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-800">{stats.patients}</div>
          </CardContent>
        </Card>
        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">
              Agendamentos no Mês
            </CardTitle>
            <Calendar className="w-5 h-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-800">{stats.appointments}</div>
          </CardContent>
        </Card>
      </div>

      <PerformanceDashboard />
    </div>
  )
}
