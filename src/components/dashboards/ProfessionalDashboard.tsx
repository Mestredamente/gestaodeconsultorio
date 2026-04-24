import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function ProfessionalDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ appointments: 0, patients: 0 })
  const [recentAppointments, setRecentAppointments] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: appts } = await supabase
        .from('agendamentos')
        .select('*, pacientes(nome)')
        .eq('profissional_id', user.id)
        .gte('data_hora', today.toISOString())
        .order('data_hora', { ascending: true })
        .limit(5)

      if (appts) setRecentAppointments(appts)

      const { count: apptsCount } = await supabase
        .from('agendamentos')
        .select('id', { count: 'exact' })
        .eq('profissional_id', user.id)
        .gte('data_hora', today.toISOString())

      const { count: ptsCount } = await supabase
        .from('pacientes')
        .select('id', { count: 'exact' })
        .eq('profissional_id', user.id)

      setStats({
        appointments: apptsCount || 0,
        patients: ptsCount || 0,
      })
    }
    fetchData()
  }, [user])

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-900">Meu Painel de Atendimento</h1>
      <p className="text-slate-500">Resumo das suas atividades e pacientes designados.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">
              Meus Agendamentos (Futuros)
            </CardTitle>
            <Calendar className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.appointments}</div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-slate-200 shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500">
              Meus Pacientes Ativos
            </CardTitle>
            <Users className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.patients}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">Próximas Sessões</h2>
      <div className="grid gap-4">
        {recentAppointments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Nenhuma sessão agendada para os próximos dias.
          </div>
        ) : (
          recentAppointments.map((apt) => (
            <Card
              key={apt.id}
              className="rounded-2xl border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4"
            >
              <div>
                <p className="font-bold text-slate-800 text-lg">{apt.pacientes?.nome}</p>
                <p className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-md inline-block mt-1">
                  {new Date(apt.data_hora).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <Button
                onClick={() => navigate(`/pacientes/${apt.paciente_id}/prontuario`)}
                className="rounded-xl gap-2 h-11"
              >
                <FileText className="w-4 h-4" /> Registrar Nota de Sessão
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
