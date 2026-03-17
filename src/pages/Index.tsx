import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Check, X, RefreshCw, Cake, LogOut, Settings2, Coins } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ServiceGoalTracker } from '@/components/ServiceGoalTracker'
import { measurePerformance } from '@/lib/performance'

export default function Index() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<any[]>([])
  const [birthdays, setBirthdays] = useState<any[]>([])
  const [revenue, setRevenue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [prefs, setPrefs] = useState({
    show_agenda: true,
    show_birthdays: true,
    show_revenue: true,
  })

  const todayStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  const fetchDashboardData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(false)

    try {
      await measurePerformance('dashboard_data', async () => {
        const { data: u, error: uError } = await supabase
          .from('usuarios')
          .select('preferencias_dashboard')
          .eq('id', user.id)
          .maybeSingle()

        if (!uError && u?.preferencias_dashboard) {
          setPrefs(u.preferencias_dashboard)
        }

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(startOfDay)
        endOfDay.setDate(endOfDay.getDate() + 1)

        const { data: appts, error: apptsError } = await supabase
          .from('agendamentos')
          .select('id, data_hora, status, paciente_id, pacientes(id, nome, valor_sessao)')
          .eq('usuario_id', user.id)
          .gte('data_hora', startOfDay.toISOString())
          .lt('data_hora', endOfDay.toISOString())
          .order('data_hora', { ascending: true })

        if (!apptsError && appts) {
          setAppointments(appts)
        } else {
          setAppointments([])
        }

        const currentMonth = new Date().getMonth() + 1
        const { data: pats, error: patsError } = await supabase
          .from('pacientes')
          .select('id, nome, data_nascimento')
          .eq('usuario_id', user.id)

        if (!patsError && pats) {
          const bdays = pats.filter((p) => {
            if (!p.data_nascimento) return false
            const [, month] = p.data_nascimento.split('-')
            return parseInt(month) === currentMonth
          })
          setBirthdays(bdays)
        } else {
          setBirthdays([])
        }

        const { data: fin, error: finError } = await supabase
          .from('financeiro')
          .select('valor_recebido')
          .eq('usuario_id', user.id)
          .eq('mes', currentMonth)
          .eq('ano', new Date().getFullYear())

        if (!finError && fin) {
          setRevenue(fin.reduce((s, f) => s + Number(f.valor_recebido), 0) || 0)
        } else {
          setRevenue(0)
        }
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(true)
      setAppointments([])
      setBirthdays([])
      setRevenue(0)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchDashboardData()
    if (!user) return
    const subscription = supabase
      .channel('dash_agendamentos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos', filter: `usuario_id=eq.${user.id}` },
        () => fetchDashboardData(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, fetchDashboardData])

  const updateStatus = async (id: string, status: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    try {
      const { error } = await supabase.from('agendamentos').update({ status }).eq('id', id)
      if (!error) {
        toast({ title: `Status atualizado: ${status.toUpperCase()}` })
      } else {
        throw error
      }
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar status', description: err.message, variant: 'destructive' })
      fetchDashboardData()
    }
  }

  const savePrefs = async (newPref: any) => {
    const updated = { ...prefs, ...newPref }
    setPrefs(updated)
    try {
      await supabase.from('usuarios').update({ preferencias_dashboard: updated }).eq('id', user?.id)
    } catch (err) {
      console.error('Error saving preferences:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compareceu':
        return 'bg-emerald-100 text-emerald-700'
      case 'faltou':
        return 'bg-red-100 text-red-700'
      case 'desmarcou':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo(a)!</h1>
          <p className="text-slate-500 capitalize">{todayStr}</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Dashboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Label>Mostrar Agenda Hoje</Label>
                  <Switch
                    checked={prefs.show_agenda}
                    onCheckedChange={(v) => savePrefs({ show_agenda: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Mostrar Aniversariantes</Label>
                  <Switch
                    checked={prefs.show_birthdays}
                    onCheckedChange={(v) => savePrefs({ show_birthdays: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Mostrar Receita Mês</Label>
                  <Switch
                    checked={prefs.show_revenue}
                    onCheckedChange={(v) => savePrefs({ show_revenue: v })}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="text-slate-600 gap-2" onClick={() => signOut()}>
            <LogOut className="w-4 h-4" /> Sair da Conta
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-center justify-between">
          <p className="text-red-600 text-sm font-medium">
            Alguns dados não puderam ser carregados.
          </p>
          <Button variant="outline" size="sm" onClick={fetchDashboardData} className="bg-white">
            Tentar novamente
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {prefs.show_agenda && (
          <Card className="lg:col-span-2 shadow-sm border-slate-200 h-fit">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Sessões de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Nenhuma sessão para hoje.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {appointments.map((apt) => {
                    const pInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                    const time = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    return (
                      <div
                        key={apt.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-14 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-primary font-bold shadow-sm">
                            {time}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {pInfo?.nome || 'Paciente Excluído'}
                            </p>
                            <span
                              className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider mt-1 inline-block',
                                getStatusColor(apt.status),
                              )}
                            >
                              {apt.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-none text-emerald-600 hover:bg-emerald-50"
                            onClick={() => updateStatus(apt.id, 'compareceu')}
                          >
                            <Check className="w-4 h-4 mr-1" /> Compareceu
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-none text-red-600 hover:bg-red-50"
                            onClick={() => updateStatus(apt.id, 'faltou')}
                          >
                            <X className="w-4 h-4 mr-1" /> Faltou
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-none text-amber-600 hover:bg-amber-50"
                            onClick={() => updateStatus(apt.id, 'desmarcou')}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" /> Desmarcou
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <ServiceGoalTracker />

          {prefs.show_revenue && (
            <Card className="shadow-sm border-slate-200 h-fit">
              <CardHeader className="border-b border-slate-100 bg-emerald-50/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                  <Coins className="w-5 h-5" /> Receita do Mês
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <h2 className="text-3xl font-bold text-emerald-900">
                  {revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </h2>
              </CardContent>
            </Card>
          )}

          {prefs.show_birthdays && (
            <Card className="shadow-sm border-slate-200 h-fit">
              <CardHeader className="border-b border-slate-100 bg-rose-50/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-rose-600">
                  <Cake className="w-5 h-5" /> Aniversariantes do Mês
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500"></div>
                  </div>
                ) : birthdays.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Nenhum aniversário este mês.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {birthdays.map((b) => {
                      const [, month, day] = b.data_nascimento.split('-')
                      return (
                        <div key={b.id} className="p-4 flex items-center justify-between">
                          <p className="font-medium text-slate-800">{b.nome}</p>
                          <span className="text-sm font-bold text-rose-500 bg-rose-100 px-2 py-1 rounded-md">
                            {day}/{month}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
