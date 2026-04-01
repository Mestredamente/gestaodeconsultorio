import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Plus, Settings2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { DashboardUpcoming } from '@/components/dashboard/DashboardUpcoming'
import { DashboardAlerts } from '@/components/dashboard/DashboardAlerts'
import { DashboardRisks } from '@/components/dashboard/DashboardRisks'
import { DashboardConfig, WidgetPref } from '@/components/dashboard/DashboardConfig'

const defaultPrefs: WidgetPref[] = [
  { id: 'stats', title: 'Métricas Principais', visible: true, order: 0 },
  { id: 'upcoming', title: 'Próximas Sessões', visible: true, order: 1 },
  { id: 'alerts', title: 'Alertas e Inadimplências', visible: true, order: 2 },
  { id: 'risks', title: 'Pacientes em Risco', visible: true, order: 3 },
]

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  const [preferences, setPreferences] = useState<WidgetPref[]>(defaultPrefs)
  const [isConfigOpen, setIsConfigOpen] = useState(false)

  const [stats, setStats] = useState({ sessoesHoje: 0, saldoAReceber: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [inadimplentes, setInadimplentes] = useState<any[]>([])
  const [riscoPacientes, setRiscoPacientes] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      const { data: userData } = await supabase
        .from('usuarios')
        .select('preferencias_dashboard')
        .eq('id', user.id)
        .single()
      if (userData?.preferencias_dashboard && Array.isArray(userData.preferencias_dashboard)) {
        const saved = userData.preferencias_dashboard
        const merged = defaultPrefs
          .map((dp) => {
            const found = saved.find((s: any) => s.id === dp.id)
            return found ? { ...dp, visible: found.visible, order: found.order } : dp
          })
          .sort((a, b) => a.order - b.order)
        setPreferences(merged)
      }

      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      const [aptRes, finRes, alertRes, allFinRes] = await Promise.all([
        supabase
          .from('agendamentos')
          .select('*, pacientes(nome, telefone)')
          .eq('usuario_id', user.id)
          .gte('data_hora', startOfDay)
          .order('data_hora'),
        supabase
          .from('financeiro')
          .select('valor_a_receber')
          .eq('usuario_id', user.id)
          .eq('status', 'pendente'),
        supabase
          .from('agendamentos')
          .select('*, pacientes(nome)')
          .eq('usuario_id', user.id)
          .eq('status', 'desmarcou')
          .order('data_hora', { ascending: false })
          .limit(5),
        supabase
          .from('financeiro')
          .select('*, pacientes(nome, telefone)')
          .eq('usuario_id', user.id)
          .gt('valor_a_receber', 0)
          .eq('status', 'pendente'),
      ])

      const allApts = aptRes.data || []
      const todayApts = allApts.filter((a) => a.data_hora <= endOfDay)
      const upcomingApts = allApts.filter((a) => a.status === 'agendado').slice(0, 5)
      const saldoAReceber = (finRes.data || []).reduce(
        (acc, curr) => acc + Number(curr.valor_a_receber),
        0,
      )

      const nowTime = new Date().getTime()
      const inadimplentesFiltered = (allFinRes.data || [])
        .map((f) => {
          const diffTime = Math.abs(nowTime - new Date(f.data_atualizacao).getTime())
          return { ...f, diffDays: Math.ceil(diffTime / (1000 * 60 * 60 * 24)) }
        })
        .filter((f) => f.diffDays > 30)
        .sort((a, b) => b.diffDays - a.diffDays)

      const pacientesComRisco = allApts
        .filter((a) => a.risco_cancelamento === 'alto' || a.status === 'desmarcou')
        .reduce((acc: any[], curr) => {
          const p = Array.isArray(curr.pacientes) ? curr.pacientes[0] : curr.pacientes
          if (p && !acc.find((x) => x.id === p.id))
            acc.push({ id: p.id, nome: p.nome, risco: curr.risco_cancelamento || 'alto' })
          return acc
        }, [])
        .slice(0, 5)

      setStats({ sessoesHoje: todayApts.length, saldoAReceber })
      setUpcoming(upcomingApts)
      setAlerts(alertRes.data || [])
      setInadimplentes(inadimplentesFiltered)
      setRiscoPacientes(pacientesComRisco)
      setLoading(false)
    }

    fetchDashboardData()
  }, [user])

  const handlePreferencesChange = async (newPrefs: WidgetPref[]) => {
    setPreferences(newPrefs)
    if (user) {
      const { error } = await supabase
        .from('usuarios')
        .update({ preferencias_dashboard: newPrefs })
        .eq('id', user.id)
      if (error) toast({ title: 'Erro ao salvar preferências', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Olá, {user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium">
            Aqui está o resumo do seu consultório hoje.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsConfigOpen(true)}
            className="h-12 px-4 rounded-xl font-bold shadow-sm flex-1 sm:flex-none gap-2 border-slate-200 hover:bg-slate-50"
            title="Personalizar Painel"
          >
            <Settings2 className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => navigate('/agenda')}
            className="h-12 px-6 rounded-xl font-bold shadow-sm flex-1 sm:flex-none gap-2 text-[0.75rem]"
          >
            <Plus className="w-5 h-5" /> Nova Sessão
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {preferences
          .filter((p) => p.visible)
          .map((pref) => {
            switch (pref.id) {
              case 'stats':
                return <DashboardStats key="stats" stats={stats} />
              case 'upcoming':
                return <DashboardUpcoming key="upcoming" upcoming={upcoming} />
              case 'alerts':
                return (
                  <DashboardAlerts key="alerts" alerts={alerts} inadimplentes={inadimplentes} />
                )
              case 'risks':
                return <DashboardRisks key="risks" riscoPacientes={riscoPacientes} />
              default:
                return null
            }
          })}
      </div>

      <DashboardConfig
        open={isConfigOpen}
        onOpenChange={setIsConfigOpen}
        preferences={preferences}
        onChange={handlePreferencesChange}
      />
    </div>
  )
}
