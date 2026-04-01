import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function DashboardRisks({ riscoPacientes }: { riscoPacientes: any[] }) {
  return (
    <Card className="col-span-full xl:col-span-1 rounded-[2rem] border-slate-200 shadow-sm h-full flex flex-col hover:border-red-500/30 transition-colors">
      <CardHeader className="bg-red-50/50 border-b border-red-100 pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-red-900">
          <ShieldAlert className="w-5 h-5 text-red-600" /> Pacientes em Risco
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3 flex-1 overflow-y-auto">
        {riscoPacientes.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Nenhum paciente com alto risco no momento.
          </div>
        ) : (
          riscoPacientes.map((p, i) => (
            <div
              key={i}
              className="p-3 bg-white rounded-xl border border-red-100 shadow-sm flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-800 text-sm">{p.nome}</p>
                <Badge
                  variant="destructive"
                  className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                >
                  Alto Risco
                </Badge>
              </div>
              <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg leading-relaxed">
                💡 Sugestão: Enviar mensagem personalizada de acolhimento para engajar o paciente.
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
