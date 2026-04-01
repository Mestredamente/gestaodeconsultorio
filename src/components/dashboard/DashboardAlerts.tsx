import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatBRL } from '@/lib/utils'
import WhatsAppBillingDialog from '@/components/WhatsAppBillingDialog'

export function DashboardAlerts({
  alerts,
  inadimplentes,
}: {
  alerts: any[]
  inadimplentes: any[]
}) {
  return (
    <Card className="col-span-full xl:col-span-1 rounded-[2rem] border-slate-200 shadow-sm h-full flex flex-col hover:border-amber-500/30 transition-colors">
      <CardHeader className="bg-amber-50/50 border-b border-amber-100 pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600" /> Alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-2">Cancelamentos Recentes</h4>
          {alerts.length === 0 ? (
            <p className="text-xs text-slate-500">Nenhum cancelamento recente.</p>
          ) : (
            alerts.map((al) => {
              const p = Array.isArray(al.pacientes) ? al.pacientes[0] : al.pacientes
              return (
                <div key={al.id} className="p-2.5 bg-red-50 rounded-lg border border-red-100 mb-2">
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
  )
}
