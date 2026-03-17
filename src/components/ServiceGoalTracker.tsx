import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Target } from 'lucide-react'

export function ServiceGoalTracker() {
  const { user } = useAuth()
  const [goal, setGoal] = useState(0)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetchGoalData = async () => {
      const { data: u } = await supabase
        .from('usuarios')
        .select('meta_mensal_consultas')
        .eq('id', user.id)
        .single()
      if (u && u.meta_mensal_consultas) setGoal(u.meta_mensal_consultas)

      const start = new Date()
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)

      const { count } = await supabase
        .from('agendamentos')
        .select('id', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('status', 'compareceu')
        .gte('data_hora', start.toISOString())
        .lt('data_hora', end.toISOString())

      setCurrent(count || 0)
    }
    fetchGoalData()
  }, [user])

  if (!goal) return null

  const progress = Math.min((current / goal) * 100, 100)

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-2 border-b border-slate-100 bg-indigo-50/50">
        <CardTitle className="text-sm font-semibold text-indigo-800 flex items-center gap-2 uppercase tracking-wide">
          <Target className="w-4 h-4" /> Meta de Atendimentos (Mês)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="flex justify-between items-end mb-3">
          <span className="text-3xl font-bold text-slate-900">
            {current} <span className="text-base font-medium text-slate-400">/ {goal}</span>
          </span>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2.5 bg-slate-100 [&>div]:bg-indigo-600" />
      </CardContent>
    </Card>
  )
}
