import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Video, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function PatientDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [appts, setAppts] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: pt } = await supabase
      .from('pacientes')
      .select('id')
      .eq('email', user.email)
      .single()

    if (pt) {
      const { data } = await supabase
        .from('agendamentos')
        .select('*, usuarios!agendamentos_profissional_id_fkey(nome)')
        .eq('paciente_id', pt.id)
        .gte('data_hora', today.toISOString())
        .order('data_hora', { ascending: true })
        .limit(5)

      if (data) setAppts(data)
    }
  }

  const handleConfirm = async (id: string) => {
    await supabase.from('agendamentos').update({ status: 'confirmado' }).eq('id', id)
    toast({ title: 'Consulta confirmada!' })
    fetchData()
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar sua consulta? Esta ação notificará a clínica.'))
      return
    await supabase
      .from('agendamentos')
      .update({ status: 'desmarcou', motivo_cancelamento: 'Cancelado pelo paciente no portal' })
      .eq('id', id)
    toast({ title: 'Consulta cancelada.' })
    fetchData()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-900">Meu Portal do Paciente</h1>
      <p className="text-slate-500">Bem-vindo(a)! Acompanhe seus agendamentos e materiais aqui.</p>

      <div className="grid gap-4 mt-8">
        {appts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Você não possui agendamentos futuros no momento.
          </div>
        ) : (
          appts.map((apt) => (
            <Card key={apt.id} className="rounded-2xl border-slate-200 shadow-sm p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-xl text-slate-800">
                      {new Date(apt.data_hora).toLocaleString('pt-BR', {
                        dateStyle: 'long',
                        timeStyle: 'short',
                      })}
                    </h3>
                  </div>
                  <p className="text-slate-600 font-medium">
                    Profissional: Dr(a). {apt.usuarios?.nome || 'Clínica'}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-slate-100 uppercase tracking-wider text-slate-600">
                    Status: {apt.status}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {apt.status === 'agendado' && (
                    <>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 h-11 rounded-xl w-full sm:w-auto"
                        onClick={() => handleConfirm(apt.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Confirmar Presença
                      </Button>
                      <Button
                        variant="outline"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 h-11 rounded-xl w-full sm:w-auto"
                        onClick={() => handleCancel(apt.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Cancelar
                      </Button>
                    </>
                  )}
                  {apt.is_online &&
                    apt.link_sala_virtual &&
                    (apt.status === 'confirmado' || apt.status === 'agendado') && (
                      <Button
                        className="w-full sm:w-auto h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => window.open(apt.link_sala_virtual, '_blank')}
                      >
                        <Video className="w-4 h-4 mr-2" /> Entrar na Sessão Online
                      </Button>
                    )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
