import { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, LineChart, Line, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ArrowDownRight, Wallet, AlertCircle, FileText } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import ReceiptDialog from '@/components/ReceiptDialog'

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

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

export default function Finances() {
  const { user } = useAuth()
  const { toast } = useToast()
  const currentDate = new Date()
  const [month, setMonth] = useState<string>(String(currentDate.getMonth() + 1))
  const [year, setYear] = useState<string>(String(currentDate.getFullYear()))

  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [finances, setFinances] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [receiptData, setReceiptData] = useState<any>(null)

  const years = useMemo(
    () => Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i),
    [],
  )

  const fetchYearData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const yearNum = parseInt(year)

    const [patientsRes, financeRes, apptsRes] = await Promise.all([
      supabase.from('pacientes').select('id, nome, valor_sessao').eq('usuario_id', user.id),
      supabase
        .from('financeiro')
        .select('id, paciente_id, mes, ano, valor_recebido, valor_a_receber')
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
  }, [user, year])

  useEffect(() => {
    fetchYearData()
  }, [fetchYearData])

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

    const patientsSummary = patients
      .map((p) => {
        const f = monthFin.find((fin) => fin.paciente_id === p.id)
        return {
          ...p,
          fin_id: f?.id,
          valor_recebido: f ? Number(f.valor_recebido) : 0,
          valor_a_receber: f ? Number(f.valor_a_receber) : 0,
        }
      })
      .filter((p) => p.valor_recebido > 0 || p.valor_a_receber > 0)
      .sort((a, b) => b.valor_a_receber - a.valor_a_receber)

    return {
      currentMonthRecebido: monthFin.reduce((sum, f) => sum + Number(f.valor_recebido), 0),
      currentMonthAReceber: monthFin.reduce((sum, f) => sum + Number(f.valor_a_receber), 0),
      faturamentoTotal: monthFin.reduce(
        (sum, f) => sum + Number(f.valor_recebido) + Number(f.valor_a_receber),
        0,
      ),
      chartData: Array.from({ length: 12 }, (_, i) => {
        const m = i + 1
        const finM = finances.filter((f) => f.mes === m)
        const apptsM = appointments.filter((a) => new Date(a.data_hora).getMonth() + 1 === m)
        const comp = apptsM.filter((a) => a.status === 'compareceu').length
        const faltas = apptsM.filter((a) => a.status === 'faltou').length
        return {
          month: monthNames[i],
          recebido: finM.reduce((s, f) => s + Number(f.valor_recebido), 0),
          taxaComparecimento: Number(
            (comp + faltas > 0 ? (comp / (comp + faltas)) * 100 : 0).toFixed(1),
          ),
        }
      }),
      patientsSummary,
      totalGrandAReceber: patientsSummary.reduce((acc, curr) => acc + curr.valor_a_receber, 0),
    }
  }, [month, finances, appointments, patients])

  const handlePay = async () => {
    if (!selectedPatient?.fin_id) return
    const val = Number(paymentAmount.replace(',', '.'))
    if (!val || val <= 0) return

    setLoading(true)
    await supabase
      .from('financeiro')
      .update({
        valor_recebido: Number(selectedPatient.valor_recebido) + val,
        valor_a_receber: Math.max(0, Number(selectedPatient.valor_a_receber) - val),
      })
      .eq('id', selectedPatient.fin_id)

    toast({ title: 'Pagamento registrado com sucesso!' })
    setPaymentAmount('')
    setIsModalOpen(false)
    fetchYearData()
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
        {[
          {
            title: 'Total Recebido',
            val: currentMonthRecebido,
            icon: ArrowDownRight,
            color: 'emerald',
          },
          { title: 'Total a Receber', val: currentMonthAReceber, icon: AlertCircle, color: 'red' },
          { title: 'Faturamento Total', val: faturamentoTotal, icon: Wallet, color: 'blue' },
        ].map((card, i) => (
          <Card key={i} className={`shadow-sm border-${card.color}-100 bg-${card.color}-50/50`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-${card.color}-700 font-medium text-sm`}>{card.title}</p>
                  <h3 className={`text-3xl font-bold mt-1 text-${card.color}-900`}>
                    {loading ? '...' : formatBRL(card.val)}
                  </h3>
                </div>
                <div className={`p-2 bg-${card.color}-100 text-${card.color}-600 rounded-full`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-lg">Evolução de Receita ({year})</h2>
          </div>
          <CardContent className="p-6 h-[300px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ChartContainer
                config={{ recebido: { label: 'Recebido', color: '#10b981' } }}
                className="w-full h-full"
              >
                <ResponsiveContainer>
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
            <h2 className="font-semibold text-lg">Taxa de Comparecimento (%)</h2>
          </div>
          <CardContent className="p-6 h-[300px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ChartContainer
                config={{ taxaComparecimento: { label: 'Comparecimento (%)', color: '#3b82f6' } }}
                className="w-full h-full"
              >
                <ResponsiveContainer>
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
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead className="text-right">Recebido</TableHead>
              <TableHead className="text-right">A Receber</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : patientsSummary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                  Nenhum registro para este mês.
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
                  onClick={() => {
                    setSelectedPatient(p)
                    setIsModalOpen(true)
                  }}
                >
                  <TableCell className="font-medium text-slate-900">
                    {p.nome}{' '}
                    {p.valor_a_receber > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 text-[10px]">
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
            <TableRow className="bg-slate-50">
              <TableCell className="font-bold text-base">Total Pendente</TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right font-bold text-red-600 text-base">
                {formatBRL(totalGrandAReceber)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) setPaymentAmount('')
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalhes Financeiros</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4 pt-4">
              <div className="text-center pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">{selectedPatient.nome}</h3>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Valor por sessão</span>
                <span className="font-medium">{formatBRL(selectedPatient.valor_sessao)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Já recebido</span>
                <span className="font-bold text-emerald-600">
                  {formatBRL(selectedPatient.valor_recebido)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Saldo a receber</span>
                <span
                  className={cn(
                    'font-bold',
                    selectedPatient.valor_a_receber > 0 ? 'text-red-600' : 'text-slate-600',
                  )}
                >
                  {formatBRL(selectedPatient.valor_a_receber)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pt-4 border-t border-slate-100">
                {selectedPatient.valor_a_receber > 0 ? (
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Registrar Pagamento
                    </span>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 150.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                      <Button onClick={handlePay}>Confirmar</Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-3">
                    <Badge className="bg-emerald-500 justify-center text-sm py-1">
                      Fatura Paga
                    </Badge>
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-primary/20 text-primary"
                      onClick={() => {
                        setReceiptData({
                          open: true,
                          patientName: selectedPatient.nome,
                          amount: selectedPatient.valor_recebido,
                          dateStr: new Date().toLocaleDateString('pt-BR'),
                          referencia: `${String(month).padStart(2, '0')}/${year}`,
                        })
                      }}
                    >
                      <FileText className="w-4 h-4" /> Baixar Recibo
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ReceiptDialog
        {...receiptData}
        onOpenChange={(val: boolean) => setReceiptData(val ? receiptData : null)}
      />
    </div>
  )
}
