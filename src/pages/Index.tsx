import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Wallet,
  AlertCircle,
  Plus,
  Clock,
  ChevronRight,
  TrendingDown,
  ShieldAlert,
  Loader2,
} from 'lucide-react'
import { formatBRL, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import WhatsAppBillingDialog from '@/components/WhatsAppBillingDialog'

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({ sessoesHoje: 0, saldoAReceber: 0 })
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [inadimplentes, setInadimplentes] = useState<any[]>([])
  const [riscoPacientes, setRiscoPacientes] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

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

      setStats({
        sessoesHoje: todayApts.length,
        saldoAReceber: saldoAReceber,
      })

      setUpcoming(upcomingApts)
      setAlerts(alertRes.data || [])

      const nowTime = new Date().getTime()
      const inadimplentesFiltered = (allFinRes.data || [])
        .map((f) => {
          const diffTime = Math.abs(nowTime - new Date(f.data_atualizacao).getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return { ...f, diffDays }
        })
        .filter((f) => f.diffDays > 30)
        .sort((a, b) => b.diffDays - a.diffDays)

      setInadimplentes(inadimplentesFiltered)

      // Simulando pacientes em risco com base na coluna risco_cancelamento ou histórico
      const pacientesComRisco = allApts
        .filter((a) => a.risco_cancelamento === 'alto' || a.status === 'desmarcou')
        .reduce((acc: any[], curr) => {
          const p = Array.isArray(curr.pacientes) ? curr.pacientes[0] : curr.pacientes
          if (p && !acc.find((x) => x.id === p.id)) {
            acc.push({ id: p.id, nome: p.nome, risco: curr.risco_cancelamento || 'alto' })
          }
          return acc
        }, [])
        .slice(0, 5)

      setRiscoPacientes(pacientesComRisco)
      setLoading(false)
    }

    fetchDashboardData()
  }, [user])

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
        <Button
          onClick={() => navigate('/agenda')}
          className="h-12 px-6 rounded-xl font-bold shadow-sm w-full sm:w-auto gap-2"
        >
          <Plus className="w-5 h-5" /> Nova Sessão
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden group hover:border-primary/30 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sessões de Hoje
              </p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                {stats.sessoesHoje}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                Saldo a Receber
              </p>
              <h3 className="text-4xl font-black text-emerald-950 tracking-tight">
                {formatBRL(stats.saldoAReceber)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Próximas Sessões */}
        <Card className="rounded-[2rem] border-slate-200 shadow-sm xl:col-span-1">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Próximas Sessões
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Nenhuma sessão futura agendada.</div>
            ) : (
              upcoming.map((apt) => {
                const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate('/agenda')}
                  >
                    <div>
                      <p className="font-bold text-slate-800">{p?.nome}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(apt.data_hora).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="rounded-[2rem] border-slate-200 shadow-sm xl:col-span-1">
          <CardHeader className="bg-amber-50/50 border-b border-amber-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600" /> Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Cancelamentos Recentes</h4>
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhum cancelamento recente.</p>
              ) : (
                alerts.map((al) => {
                  const p = Array.isArray(al.pacientes) ? al.pacientes[0] : al.pacientes
                  return (
                    <div
                      key={al.id}
                      className="p-2.5 bg-red-50 rounded-lg border border-red-100 mb-2"
                    >
                      <p className="text-sm font-semibold text-red-900">{p?.nome}</p>
                      <p className="text-xs text-red-700 mt-1 line-clamp-1">
                        "{al.motivo_cancelamento || 'Sem motivo'}"
                      </p>
                    </div>
                  )
                })
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2 flex justify-between items-center">
                Inadimplentes
                {inadimplentes.length > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    {inadimplentes.length}
                  </Badge>
                )}
              </h4>
              {inadimplentes.length === 0 ? (
                <p className="text-xs text-slate-500">Nenhuma pendência.</p>
              ) : (
                inadimplentes.slice(0, 3).map((item) => {
                  const p = Array.isArray(item.pacientes) ? item.pacientes[0] : item.pacientes
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 border-b border-slate-100 last:border-0"
                    >
                      <p className="text-sm font-medium text-slate-800 truncate pr-2">{p?.nome}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-amber-600">
                          {formatBRL(item.valor_a_receber)}
                        </span>
                        <WhatsAppBillingDialog
                          pacienteId={item.paciente_id}
                          patientName={p?.nome || ''}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pacientes em Risco */}
        <Card className="rounded-[2rem] border-slate-200 shadow-sm xl:col-span-1">
          <CardHeader className="bg-red-50/50 border-b border-red-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-red-900">
              <ShieldAlert className="w-5 h-5 text-red-600" /> Pacientes em Risco
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {riscoPacientes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Nenhum paciente com alto risco de evasão no momento.
              </div>
            ) : (
              riscoPacientes.map((p, i) => (
                <div
                  key={i}
                  className="p-3 bg-white rounded-xl border border-red-100 shadow-sm flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-slate-800">{p.nome}</p>
                    <Badge
                      variant="destructive"
                      className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                    >
                      Alto Risco
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                    💡 Sugestão: Enviar mensagem personalizada de acolhimento para engajar o
                    paciente.
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
