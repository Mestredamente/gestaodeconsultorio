import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function DashboardUpcoming({ upcoming }: { upcoming: any[] }) {
  const navigate = useNavigate()
  return (
    <Card className="col-span-full xl:col-span-1 rounded-[2rem] border-slate-200 shadow-sm h-full flex flex-col hover:border-primary/30 transition-colors">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Próximas Sessões
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3 flex-1 overflow-y-auto">
        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Nenhuma sessão futura agendada.
          </div>
        ) : (
          upcoming.map((apt) => {
            const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
            return (
              <div
                key={apt.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigate('/agenda')}
              >
                <div>
                  <p className="font-bold text-slate-800 text-sm">{p?.nome}</p>
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
  )
}
