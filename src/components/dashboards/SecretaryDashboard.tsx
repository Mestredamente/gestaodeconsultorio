import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export function SecretaryDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [appts, setAppts] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from('agendamentos')
      .select('*, pacientes(nome), usuarios!agendamentos_profissional_id_fkey(nome)')
      .gte('data_hora', today.toISOString())
      .order('data_hora', { ascending: true })
      .limit(10)

    if (data) setAppts(data)
  }

  const handlePresenca = async (id: string) => {
    await supabase.from('agendamentos').update({ status: 'compareceu' }).eq('id', id)
    toast({ title: 'Presença registrada com sucesso!' })
    fetchData()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Recepção / Secretaria</h1>
          <p className="text-slate-500">Visão geral da agenda da clínica hoje e próximos dias.</p>
        </div>
        <Button
          onClick={() => navigate('/agenda')}
          className="rounded-xl h-11 px-6 font-bold w-full sm:w-auto"
        >
          <Calendar className="w-4 h-4 mr-2" /> Abrir Agenda Completa
        </Button>
      </div>

      <div className="grid gap-4 mt-8">
        {appts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Nenhum agendamento futuro encontrado na clínica.
          </div>
        ) : (
          appts.map((apt) => (
            <Card
              key={apt.id}
              className="rounded-2xl border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-bold">
                    {new Date(apt.data_hora).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    Profissional: {apt.usuarios?.nome || 'Clínica'}
                  </span>
                </div>
                <p className="font-bold text-slate-800 text-lg mt-1">{apt.pacientes?.nome}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">
                  Status: {apt.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="rounded-xl h-10 w-full sm:w-auto"
                  onClick={() => navigate(`/pacientes/${apt.paciente_id}`)}
                >
                  Ver Cadastro
                </Button>
                {(apt.status === 'agendado' || apt.status === 'confirmado') && (
                  <Button
                    className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 h-10 w-full sm:w-auto"
                    onClick={() => handlePresenca(apt.id)}
                  >
                    <CheckCircle className="w-4 h-4" /> Marcar Comparecimento
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
