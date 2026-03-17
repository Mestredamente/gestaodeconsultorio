import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Target, RefreshCw } from 'lucide-react'
import { measurePerformance } from '@/lib/performance'
import { Button } from '@/components/ui/button'

export function ServiceGoalTracker() {
  const { user } = useAuth()
  const [goal, setGoal] = useState(0)
  const [current, setCurrent] = useState(0)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchGoalData = useCallback(async () => {
    if (!user) return
    setError(false)
    setLoading(true)

    try {
      await measurePerformance('fetchGoalData', async () => {
        const { data: u, error: uError } = await supabase
          .from('usuarios')
          .select('meta_mensal_consultas')
          .eq('id', user.id)
          .maybeSingle()

        if (uError) throw uError

        if (u && u.meta_mensal_consultas) {
          setGoal(u.meta_mensal_consultas)
        } else {
          setGoal(0)
        }

        const start = new Date()
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setMonth(end.getMonth() + 1)

        const { count, error: countError } = await supabase
          .from('agendamentos')
          .select('id', { count: 'exact' })
          .eq('usuario_id', user.id)
          .eq('status', 'compareceu')
          .gte('data_hora', start.toISOString())
          .lt('data_hora', end.toISOString())
          .limit(0)

        if (countError) throw countError

        if (count !== null) {
          setCurrent(count)
        }
      })
    } catch (err) {
      console.error('Error fetching goal data:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchGoalData()
  }, [fetchGoalData])

  if (loading && !goal) return null

  if (error) {
    return (
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-slate-500 mb-3">Não foi possível carregar estes dados</p>
          <Button variant="outline" size="sm" onClick={fetchGoalData} className="gap-2">
            <RefreshCw className="w-3 h-3" /> Tentar novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

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
