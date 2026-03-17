import { useEffect, useState, useCallback, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

const monthNames = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

const formatBRL = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

export default function Finances() {
  const { user } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchFinanceiro = useCallback(async () => {
    if (!user) return
    const { data: pData, error } = await supabase
      .from('pacientes')
      .select(`
        id, nome, valor_sessao,
        financeiro (
          id, mes, ano, valor_recebido, valor_a_receber
        )
      `)
      .eq('usuario_id', user.id)

    if (pData && !error) {
      setData(pData)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchFinanceiro()

    if (!user) return

    const subscriptionFin = supabase
      .channel('financeiro_realtime_wallet')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'financeiro', filter: `usuario_id=eq.${user.id}` },
        () => fetchFinanceiro(),
      )
      .subscribe()

    const subscriptionPac = supabase
      .channel('pacientes_realtime_wallet')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pacientes', filter: `usuario_id=eq.${user.id}` },
        () => fetchFinanceiro(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscriptionFin)
      supabase.removeChannel(subscriptionPac)
    }
  }, [user, fetchFinanceiro])

  const {
    currentMonthRecebido,
    currentMonthAReceber,
    chartData,
    patientsSummary,
    totalGrandAReceber,
  } = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    let currentMonthRecebido = 0
    let currentMonthAReceber = 0

    const monthsToChart: { mes: number; ano: number; label: string }[] = []
    for (let i = 2; i >= 0; i--) {
      let m = currentMonth - i
      let y = currentYear
      if (m <= 0) {
        m += 12
        y -= 1
      }
      monthsToChart.push({ mes: m, ano: y, label: monthNames[m - 1] })
    }

    const chartData = monthsToChart.map((m) => ({
      month: m.label,
      recebido: 0,
      aReceber: 0,
      mes: m.mes,
      ano: m.ano,
    }))

    const patientsSummary = data.map((patient) => {
      let total_recebido = 0
      let total_a_receber = 0

      const finRecords = Array.isArray(patient.financeiro) ? patient.financeiro : []

      finRecords.forEach((fin: any) => {
        const valRec = Number(fin.valor_recebido) || 0
        const valARec = Number(fin.valor_a_receber) || 0

        if (fin.mes === currentMonth && fin.ano === currentYear) {
          currentMonthRecebido += valRec
          currentMonthAReceber += valARec
        }

        const chartItem = chartData.find((c) => c.mes === fin.mes && c.ano === fin.ano)
        if (chartItem) {
          chartItem.recebido += valRec
          chartItem.aReceber += valARec
        }

        total_recebido += valRec
        total_a_receber += valARec
      })

      return {
        id: patient.id,
        nome: patient.nome,
        valor_sessao: patient.valor_sessao || 0,
        total_recebido,
        total_a_receber,
      }
    })

    const totalGrandAReceber = patientsSummary.reduce((acc, curr) => acc + curr.total_a_receber, 0)

    patientsSummary.sort((a, b) => b.total_a_receber - a.total_a_receber)

    return {
      currentMonthRecebido,
      currentMonthAReceber,
      chartData,
      patientsSummary,
      totalGrandAReceber,
    }
  }, [data])

  const openModal = (patient: any) => {
    setSelectedPatient(patient)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Carteira</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm border-emerald-100 bg-emerald-50/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-700 font-medium text-sm">Recebido no Mês</p>
                <h3 className="text-3xl font-bold mt-1 text-emerald-900 tracking-tight">
                  {loading ? '...' : formatBRL(currentMonthRecebido)}
                </h3>
              </div>
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shadow-sm">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-100 bg-amber-50/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-amber-700 font-medium text-sm">A Receber no Mês</p>
                <h3 className="text-3xl font-bold mt-1 text-amber-900 tracking-tight">
                  {loading ? '...' : formatBRL(currentMonthAReceber)}
                </h3>
              </div>
              <div className="p-2 bg-amber-100 text-amber-600 rounded-full shadow-sm">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-semibold text-lg text-slate-800">Desempenho (Últimos 3 Meses)</h2>
        </div>
        <CardContent className="p-6 h-[300px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ChartContainer
              config={{
                recebido: { label: 'Recebido', color: '#10b981' },
                aReceber: { label: 'A Receber', color: '#f59e0b' },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    dataKey="recebido"
                    fill="var(--color-recebido)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey="aReceber"
                    fill="var(--color-aReceber)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm overflow-hidden border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-semibold text-lg text-slate-800">Saldos dos Pacientes</h2>
        </div>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Paciente</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">
                Saldo a Receber
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : patientsSummary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-slate-500 py-8">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              patientsSummary.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => openModal(p)}
                >
                  <TableCell className="font-medium text-slate-900">{p.nome}</TableCell>
                  <TableCell className="text-right text-slate-600 font-medium">
                    {formatBRL(p.total_a_receber)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableCell className="font-bold text-slate-900 text-base">Total Pendente</TableCell>
              <TableCell className="text-right font-bold text-amber-600 text-base">
                {formatBRL(totalGrandAReceber)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalhes Financeiros</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4 pt-4">
              <div className="text-center pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">{selectedPatient.nome}</h3>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Saldo a receber</span>
                <span className="font-bold text-lg text-amber-600">
                  {formatBRL(selectedPatient.total_a_receber)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Valor já pago</span>
                <span className="font-bold text-lg text-emerald-600">
                  {formatBRL(selectedPatient.total_recebido)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Status de inadimplência</span>
                <Badge
                  variant={selectedPatient.total_a_receber > 0 ? 'destructive' : 'default'}
                  className={
                    selectedPatient.total_a_receber === 0
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : ''
                  }
                >
                  {selectedPatient.total_a_receber > 0 ? 'Inadimplente' : 'Em dia'}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Valor por sessão</span>
                <span className="font-medium text-slate-900">
                  {formatBRL(selectedPatient.valor_sessao)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
