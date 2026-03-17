import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockFinanceChartData, mockTransactions } from '@/lib/mock-data'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { LineChart, Line, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function Finances() {
  const { toast } = useToast()

  const handleInvoice = () => {
    toast({ title: 'Nota fiscal gerada', description: 'O documento foi enviado ao paciente.' })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm bg-gradient-to-br from-primary to-primary/80 text-white border-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-primary-foreground/80 font-medium text-sm">Faturamento (Mês)</p>
                <h3 className="text-3xl font-bold mt-1">R$ 8.450,00</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-full">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 font-medium text-sm">Despesas (Mês)</p>
                <h3 className="text-3xl font-bold mt-1 text-slate-800">R$ 1.500,00</h3>
              </div>
              <div className="p-2 bg-red-100 text-red-600 rounded-full">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-lg">Evolução Anual</h2>
        </div>
        <CardContent className="p-6 h-[300px]">
          <ChartContainer
            config={{
              faturamento: { label: 'Faturamento', color: 'hsl(var(--primary))' },
              despesas: { label: 'Despesas', color: 'hsl(var(--destructive))' },
            }}
            className="w-full h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={mockFinanceChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="faturamento"
                  stroke="var(--color-faturamento)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="despesas"
                  stroke="var(--color-despesas)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-semibold text-lg">Transações</h2>
          <Tabs defaultValue="todos">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="recebidos">Recebidos</TabsTrigger>
              <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="divide-y">
          {mockTransactions.map((t) => (
            <div
              key={t.id}
              className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-slate-900">{t.description}</p>
                <p className="text-xs text-slate-500">{t.date}</p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-left sm:text-right">
                  <p className="font-bold text-slate-800">R$ {t.amount.toFixed(2)}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium 
                    ${
                      t.status === 'Recebido'
                        ? 'bg-emerald-100 text-emerald-700'
                        : t.status === 'Pendente'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                {t.status === 'Recebido' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleInvoice}
                    title="Gerar Nota Fiscal"
                  >
                    <FileText className="w-4 h-4 text-slate-400 hover:text-primary" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
