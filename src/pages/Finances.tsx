import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, LineChart, Line, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ArrowDownRight, Wallet, AlertCircle } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

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
const fullMonthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]
const months = fullMonthNames.map((label, i) => ({ value: String(i + 1), label }))

const formatBRL = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

export default function Finances() {
  const { user } = useAuth()
  const currentDate = new Date()
  const [month, setMonth] = useState<string>(String(currentDate.getMonth() + 1))
  const [year, setYear] = useState<string>(String(currentDate.getFullYear()))

  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [finances, setFinances] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const years = useMemo(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => current - 2 + i)
  }, [])

  useEffect(() => {
    const fetchYearData = async () => {
      if (!user) return
      setLoading(true)
      const yearNum = parseInt(year)

      const [patientsRes, financeRes, apptsRes] = await Promise.all([
        supabase.from('pacientes').select('id, nome, valor_sessao').eq('usuario_id', user.id),
        supabase
          .from('financeiro')
          .select('paciente_id, mes, ano, valor_recebido, valor_a_receber')
          .eq('usuario_id', user.id)
          .eq('ano', yearNum),
        supabase
          .from('agendamentos')
          .select('data_hora, status')
          .eq('usuario_id', user.id)
          .gte('data_hora', `${yearNum}-01-01T00:00:00Z`)
          .lt('data_hora', `${yearNum + 1}-01-01T00:00:00Z`),
      ])

      if (patientsRes.data) setPatients(patientsRes.data)
      if (financeRes.data) setFinances(financeRes.data)
      if (apptsRes.data) setAppointments(apptsRes.data)

      setLoading(false)
    }

    fetchYearData()
  }, [user, year])

  const {
    currentMonthRecebido,
    currentMonthAReceber,
    faturamentoTotal,
    chartData,
    patientsSummary,
    totalGrandAReceber,
  } = useMemo(() => {
    const monthNum = parseInt(month)

    const monthFin = finances.filter((f) => f.mes === monthNum)
    const currentMonthRecebido = monthFin.reduce((sum, f) => sum + Number(f.valor_recebido), 0)
    const currentMonthAReceber = monthFin.reduce((sum, f) => sum + Number(f.valor_a_receber), 0)
    const faturamentoTotal = currentMonthRecebido + currentMonthAReceber

    const chartData = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1
      const finM = finances.filter((f) => f.mes === m)
      const recebido = finM.reduce((sum, f) => sum + Number(f.valor_recebido), 0)

      const apptsM = appointments.filter((a) => new Date(a.data_hora).getMonth() + 1 === m)
      const comp = apptsM.filter((a) => a.status === 'compareceu').length
      const faltas = apptsM.filter((a) => a.status === 'faltou').length
      const taxa = comp + faltas > 0 ? (comp / (comp + faltas)) * 100 : 0

      return {
        month: monthNames[i],
        recebido,
        taxaComparecimento: Number(taxa.toFixed(1)),
      }
    })

    const patientsSummary = patients
      .map((p) => {
        const f = monthFin.find((fin) => fin.paciente_id === p.id)
        const valor_recebido = f ? Number(f.valor_recebido) : 0
        const valor_a_receber = f ? Number(f.valor_a_receber) : 0
        return {
          ...p,
          valor_recebido,
          valor_a_receber,
        }
      })
      .filter((p) => p.valor_recebido > 0 || p.valor_a_receber > 0)
      .sort((a, b) => b.valor_a_receber - a.valor_a_receber)

    const totalGrandAReceber = patientsSummary.reduce((acc, curr) => acc + curr.valor_a_receber, 0)

    return {
      currentMonthRecebido,
      currentMonthAReceber,
      faturamentoTotal,
      chartData,
      patientsSummary,
      totalGrandAReceber,
    }
  }, [month, finances, appointments, patients])

  const openModal = (patient: any) => {
    setSelectedPatient(patient)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Resumo Financeiro</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Acompanhe seus recebimentos e saldos devedores
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-full sm:w-[140px] bg-white">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-full sm:w-[100px] bg-white">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-emerald-100 bg-emerald-50/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-700 font-medium text-sm">Total Recebido</p>
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

        <Card className="shadow-sm border-red-100 bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-red-700 font-medium text-sm">Total a Receber</p>
                <h3 className="text-3xl font-bold mt-1 text-red-900 tracking-tight">
                  {loading ? '...' : formatBRL(currentMonthAReceber)}
                </h3>
              </div>
              <div className="p-2 bg-red-100 text-red-600 rounded-full shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-100 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-700 font-medium text-sm">Faturamento Total</p>
                <h3 className="text-3xl font-bold mt-1 text-blue-900 tracking-tight">
                  {loading ? '...' : formatBRL(faturamentoTotal)}
                </h3>
              </div>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full shadow-sm">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-lg text-slate-800">Evolução de Receita ({year})</h2>
          </div>
          <CardContent className="p-6 h-[300px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ChartContainer
                config={{ recebido: { label: 'Recebido', color: '#10b981' } }}
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
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-lg text-slate-800">Taxa de Comparecimento (%)</h2>
          </div>
          <CardContent className="p-6 h-[300px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ChartContainer
                config={{ taxaComparecimento: { label: 'Comparecimento (%)', color: '#3b82f6' } }}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
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
                      dataKey="taxaComparecimento"
                      stroke="var(--color-taxaComparecimento)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'var(--color-taxaComparecimento)' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden border-slate-200">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-semibold text-lg text-slate-800">
            Saldos dos Pacientes ({months.find((m) => m.value === month)?.label})
          </h2>
        </div>
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Paciente</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Recebido</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">A Receber</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : patientsSummary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                  Nenhum registro financeiro para este mês.
                </TableCell>
              </TableRow>
            ) : (
              patientsSummary.map((p) => (
                <TableRow
                  key={p.id}
                  className={cn(
                    'cursor-pointer transition-colors',
                    p.valor_a_receber > 0 ? 'bg-red-50/50 hover:bg-red-50/80' : 'hover:bg-slate-50',
                  )}
                  onClick={() => openModal(p)}
                >
                  <TableCell className="font-medium text-slate-900">
                    {p.nome}
                    {p.valor_a_receber > 0 && (
                      <Badge variant="destructive" className="ml-2 text-[10px] h-5 py-0">
                        Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-slate-600">
                    {formatBRL(p.valor_recebido)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-medium',
                      p.valor_a_receber > 0 ? 'text-red-700' : 'text-slate-600',
                    )}
                  >
                    {formatBRL(p.valor_a_receber)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableCell className="font-bold text-slate-900 text-base">Total Pendente</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right font-bold text-red-600 text-base">
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
                <span className="text-slate-500 font-medium">Valor já pago</span>
                <span className="font-bold text-lg text-emerald-600">
                  {formatBRL(selectedPatient.valor_recebido)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Saldo a receber</span>
                <span
                  className={cn(
                    'font-bold text-lg',
                    selectedPatient.valor_a_receber > 0 ? 'text-red-600' : 'text-slate-600',
                  )}
                >
                  {formatBRL(selectedPatient.valor_a_receber)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Status de Pagamento</span>
                <Badge
                  variant={selectedPatient.valor_a_receber > 0 ? 'destructive' : 'default'}
                  className={
                    selectedPatient.valor_a_receber === 0
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : ''
                  }
                >
                  {selectedPatient.valor_a_receber > 0 ? 'Pendente' : 'Pago'}
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
