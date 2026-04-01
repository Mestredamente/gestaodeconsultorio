import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays, Wallet } from 'lucide-react'
import { formatBRL } from '@/lib/utils'

interface StatsProps {
  sessoesHoje: number
  saldoAReceber: number
}

export function DashboardStats({ stats }: { stats: StatsProps }) {
  return (
    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
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
  )
}
