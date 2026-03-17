import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Check, X, LogOut, Settings2, AlertTriangle, Video } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
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
import { PerformanceDashboard } from '@/components/PerformanceDashboard'
import { measurePerformance } from '@/lib/performance'

export default function Index() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<any[]>([])
  const [lowStockCount, setLowStockCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [prefs, setPrefs] = useState({
    show_agenda: true,
    show_dashboard: true,
    show_stock_alert: true,
  })

  const todayStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      const visits = parseInt(localStorage.getItem('visits') || '0')
      if (visits > 0 && !localStorage.getItem('pwa_prompt_dismissed')) {
        toast({
          title: 'Instale nosso App',
          description: 'Adicione a Gestão de Clínica à sua tela inicial.',
          action: (
            <Button
              variant="outline"
              onClick={() => {
                e.prompt()
                localStorage.setItem('pwa_prompt_dismissed', '1')
              }}
            >
              Instalar
            </Button>
          ),
        })
      }
      localStorage.setItem('visits', (visits + 1).toString())
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [toast])

  const fetchIndexData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(false)

    try {
      await measurePerformance('index_data', async () => {
        const { data: u, error: uError } = await supabase
          .from('usuarios')
          .select('preferencias_dashboard')
          .eq('id', user.id)
          .maybeSingle()
        if (!uError && u?.preferencias_dashboard) setPrefs(u.preferencias_dashboard)

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(startOfDay)
        endOfDay.setDate(endOfDay.getDate() + 1)

        const [apptsRes, stockRes] = await Promise.all([
          supabase
            .from('agendamentos')
            .select(
              'id, data_hora, status, is_online, paciente_id, pacientes(id, nome, valor_sessao)',
            )
            .eq('usuario_id', user.id)
            .gte('data_hora', startOfDay.toISOString())
            .lt('data_hora', endOfDay.toISOString())
            .order('data_hora', { ascending: true }),
          supabase
            .from('estoque')
            .select('quantidade, quantidade_minima')
            .eq('usuario_id', user.id),
        ])

        if (apptsRes.data) setAppointments(apptsRes.data)
        if (stockRes.data)
          setLowStockCount(
            stockRes.data.filter((s) => s.quantidade <= (s.quantidade_minima || 0)).length,
          )
      })
    } catch (err) {
      console.error('Error fetching index data:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchIndexData()
  }, [fetchIndexData])

  const updateStatus = async (id: string, status: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    try {
      const { error } = await supabase.from('agendamentos').update({ status }).eq('id', id)
      if (!error) toast({ title: `Status atualizado: ${status.toUpperCase()}` })
      else throw error
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
      fetchIndexData()
    }
  }

  const savePrefs = async (newPref: any) => {
    const updated = { ...prefs, ...newPref }
    setPrefs(updated)
    await supabase.from('usuarios').update({ preferencias_dashboard: updated }).eq('id', user?.id)
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
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
                  <Label>Mostrar Dashboard de Performance</Label>
                  <Switch
                    checked={prefs.show_dashboard !== false}
                    onCheckedChange={(v) => savePrefs({ show_dashboard: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Mostrar Agenda de Hoje</Label>
                  <Switch
                    checked={prefs.show_agenda !== false}
                    onCheckedChange={(v) => savePrefs({ show_agenda: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Mostrar Alertas de Estoque</Label>
                  <Switch
                    checked={prefs.show_stock_alert !== false}
                    onCheckedChange={(v) => savePrefs({ show_stock_alert: v })}
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
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex justify-between">
          <p className="text-red-600 text-sm">Alguns dados não puderam ser carregados.</p>
          <Button variant="outline" size="sm" onClick={fetchIndexData}>
            Tentar novamente
          </Button>
        </div>
      )}

      {prefs.show_dashboard !== false && <PerformanceDashboard />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <ServiceGoalTracker />

          {prefs.show_stock_alert !== false && lowStockCount > 0 && (
            <Card className="shadow-sm border-amber-200 h-fit bg-amber-50/50">
              <CardHeader className="border-b border-amber-100/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-5 h-5" /> Alertas de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <h2 className="text-4xl font-bold text-amber-600">{lowStockCount}</h2>
                <p className="text-amber-800 font-medium text-sm mt-1">Itens em nível crítico</p>
              </CardContent>
            </Card>
          )}
        </div>

        {prefs.show_agenda !== false && (
          <Card className="lg:col-span-2 shadow-sm border-slate-200 h-fit">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
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
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
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
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">
                                {pInfo?.nome || 'Paciente Excluído'}
                              </p>
                              {apt.is_online && <Video className="w-4 h-4 text-indigo-500" />}
                            </div>
                            <span
                              className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider mt-1 inline-block',
                                apt.status === 'compareceu'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : apt.status === 'faltou'
                                    ? 'bg-red-100 text-red-700'
                                    : apt.status === 'desmarcou'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-slate-100 text-slate-700',
                              )}
                            >
                              {apt.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          {apt.is_online && apt.status === 'agendado' && (
                            <Button
                              size="sm"
                              className="bg-indigo-600 hover:bg-indigo-700"
                              onClick={() => navigate(`/consulta-online/${apt.id}`)}
                            >
                              <Video className="w-4 h-4 mr-1" /> Sala
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 hover:bg-emerald-50"
                            onClick={() => updateStatus(apt.id, 'compareceu')}
                          >
                            <Check className="w-4 h-4 mr-1" /> Comp.
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => updateStatus(apt.id, 'faltou')}
                          >
                            <X className="w-4 h-4 mr-1" /> Faltou
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
      </div>
    </div>
  )
}
