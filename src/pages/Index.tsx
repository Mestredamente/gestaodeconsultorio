import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, Calendar, DollarSign, Activity } from 'lucide-react'
import { mockAppointments, mockChartData } from '@/lib/mock-data'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/use-toast'

const MetricCard = ({ title, value, sub, icon: Icon, colorClass }: any) => (
  <Card className="hover:shadow-md transition-shadow duration-300">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium mb-0.5">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
        <p className="text-xs text-emerald-600 font-medium mt-0.5">{sub}</p>
      </div>
    </CardContent>
  </Card>
)

export default function Index() {
  const { toast } = useToast()
  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  const handleCheckIn = () => {
    toast({ title: 'Check-in realizado!', description: 'Paciente notificado.', variant: 'default' })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Olá, Dr. Marcos!</h1>
          <p className="text-slate-500 capitalize">
            {today} • Você tem {mockAppointments.length} sessões hoje.
          </p>
        </div>
        <Button className="hidden md:flex gap-2 rounded-full px-6">
          <Plus className="w-4 h-4" /> Novo Agendamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Sessões Hoje"
          value="5"
          sub="2 concluídas"
          icon={Calendar}
          colorClass="bg-sky-100 text-sky-600"
        />
        <MetricCard
          title="Novos Pacientes"
          value="12"
          sub="+3 este mês"
          icon={Users}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <MetricCard
          title="Faturamento Mensal"
          value="R$ 8.450"
          sub="+15% vs mês ant."
          icon={DollarSign}
          colorClass="bg-amber-100 text-amber-600"
        />
        <MetricCard
          title="Taxa de Presença"
          value="92%"
          sub="Ótima"
          icon={Activity}
          colorClass="bg-indigo-100 text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Sessões por Mês</h2>
          </div>
          <CardContent className="p-6 h-[300px]">
            <ChartContainer
              config={{ sessoes: { label: 'Sessões', color: 'hsl(var(--primary))' } }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="sessoes"
                    fill="var(--color-sessoes)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold">Próximas Sessões</h2>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {mockAppointments.map((apt, i) => (
                <div
                  key={apt.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-primary font-semibold">
                      <span className="text-sm">{apt.time.split(':')[0]}</span>
                      <span className="text-[10px] text-slate-500">{apt.time.split(':')[1]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{apt.patientName}</p>
                      <p className="text-xs text-slate-500">{apt.type}</p>
                    </div>
                  </div>
                  {i === 0 ? (
                    <Button size="sm" onClick={handleCheckIn} className="rounded-full relative">
                      <div className="absolute inset-0 rounded-full animate-pulse-ring"></div>
                      Check-in
                    </Button>
                  ) : (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${apt.status === 'Confirmado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                    >
                      {apt.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 text-center border-t border-slate-100">
              <Button variant="link" className="text-primary h-auto p-0">
                Ver agenda completa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg md:hidden z-40 bg-primary hover:bg-primary/90">
        <Plus className="w-6 h-6 text-white" />
      </Button>
    </div>
  )
}
