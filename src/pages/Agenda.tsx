import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

export default function Agenda() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return

      // Obter o intervalo do dia atual para filtrar agendamentos de hoje
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(startOfDay)
      endOfDay.setDate(endOfDay.getDate() + 1)

      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora,
          status,
          pacientes (
            nome,
            valor_sessao
          )
        `)
        .eq('usuario_id', user.id)
        .gte('data_hora', startOfDay.toISOString())
        .lt('data_hora', endOfDay.toISOString())
        .order('data_hora', { ascending: true })

      if (!error && data) {
        setAppointments(data)
      }
      setLoading(false)
    }

    fetchAppointments()
  }, [user])

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('agendamentos').update({ status }).eq('id', id)

    if (!error) {
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
      toast({ title: 'Status atualizado com sucesso!' })
    } else {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const todayStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const statusColors: Record<string, string> = {
    agendado: 'border-l-slate-200',
    compareceu: 'border-l-emerald-500',
    faltou: 'border-l-red-500',
    desmarcou: 'border-l-amber-500',
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <header className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight capitalize">{todayStr}</h1>
        <p className="text-slate-500 mt-2 font-medium">Sua agenda de hoje</p>
      </header>

      <div className="flex flex-col gap-4">
        {appointments.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500">
            Nenhuma sessão agendada para hoje.
          </div>
        ) : (
          appointments.map((apt) => {
            const timeStr = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })

            // Garantir extração segura caso seja array (embora deva ser um objeto com foreign key correta)
            const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
            const patientName = pacienteInfo?.nome || 'Paciente Desconhecido'
            const sessionValue = pacienteInfo?.valor_sessao || 0

            const valueStr = Number(sessionValue).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })

            return (
              <Card
                key={apt.id}
                className={cn(
                  'bg-white shadow-sm transition-all border-l-4 border-t-0 border-r-0 border-b-0',
                  statusColors[apt.status] || statusColors.agendado,
                )}
              >
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className="bg-slate-50 min-w-[70px] py-2 rounded-lg text-center border border-slate-100 shrink-0">
                      <span className="font-bold text-slate-700">{timeStr}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">{patientName}</h3>
                      <p className="text-sm text-slate-500 font-medium">{valueStr}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Button
                      size="icon"
                      variant="outline"
                      className={cn(
                        'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors',
                        apt.status === 'compareceu' &&
                          'bg-emerald-50 text-emerald-600 border-emerald-200',
                      )}
                      onClick={() => updateStatus(apt.id, 'compareceu')}
                      title="Compareceu"
                    >
                      <Check className="w-5 h-5 text-emerald-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className={cn(
                        'hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors',
                        apt.status === 'faltou' && 'bg-red-50 text-red-600 border-red-200',
                      )}
                      onClick={() => updateStatus(apt.id, 'faltou')}
                      title="Faltou"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className={cn(
                        'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors font-bold text-lg text-amber-500',
                        apt.status === 'desmarcou' && 'bg-amber-50 text-amber-600 border-amber-200',
                      )}
                      onClick={() => updateStatus(apt.id, 'desmarcou')}
                      title="Desmarcou"
                    >
                      D
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
