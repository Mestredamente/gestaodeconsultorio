import { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ArrowDownRight, ArrowUpRight, Wallet, AlertCircle, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
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
  const [despesas, setDespesas] = useState<any[]>([])
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false)
  const [newDespesa, setNewDespesa] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
  })

  const fetchYearData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const yearNum = parseInt(year)

    const [patientsRes, financeRes, despesasRes] = await Promise.all([
      supabase.from('pacientes').select('id, nome, valor_sessao').eq('usuario_id', user.id),
      supabase.from('financeiro').select('*').eq('usuario_id', user.id).eq('ano', yearNum),
      supabase
        .from('despesas')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('data', `${yearNum}-01-01`)
        .lt('data', `${yearNum + 1}-01-01`),
    ])

    if (patientsRes.data) setPatients(patientsRes.data)
    if (financeRes.data) setFinances(financeRes.data)
    if (despesasRes.data) setDespesas(despesasRes.data)
    setLoading(false)
  }, [user, year])

  useEffect(() => {
    fetchYearData()
  }, [fetchYearData])

  const { currentRecebido, currentDespesas, currentAReceber, chartData, patientsSummary } =
    useMemo(() => {
      const monthNum = parseInt(month)
      const monthFin = finances.filter((f) => f.mes === monthNum)
      const monthDesp = despesas.filter((d) => new Date(d.data).getMonth() + 1 === monthNum)

      const pSummary = patients
        .map((p) => {
          const f = monthFin.find((fin) => fin.paciente_id === p.id)
          return {
            ...p,
            valor_recebido: f ? Number(f.valor_recebido) : 0,
            valor_a_receber: f ? Number(f.valor_a_receber) : 0,
          }
        })
        .filter((p) => p.valor_recebido > 0 || p.valor_a_receber > 0)
        .sort((a, b) => b.valor_a_receber - a.valor_a_receber)

      return {
        currentRecebido: monthFin.reduce((sum, f) => sum + Number(f.valor_recebido), 0),
        currentDespesas: monthDesp.reduce((sum, d) => sum + Number(d.valor), 0),
        currentAReceber: monthFin.reduce((sum, f) => sum + Number(f.valor_a_receber), 0),
        chartData: Array.from({ length: 12 }, (_, i) => {
          const finM = finances.filter((f) => f.mes === i + 1)
          const despM = despesas.filter((d) => new Date(d.data).getMonth() + 1 === i + 1)
          return {
            month: monthNames[i],
            recebido: finM.reduce((s, f) => s + Number(f.valor_recebido), 0),
            saida: despM.reduce((s, d) => s + Number(d.valor), 0),
          }
        }),
        patientsSummary: pSummary,
      }
    }, [month, finances, despesas, patients])

  const handleAddDespesa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const { data, error } = await supabase
      .from('despesas')
      .insert({
        usuario_id: user.id,
        descricao: newDespesa.descricao,
        valor: Number(newDespesa.valor.replace(',', '.')),
        data: newDespesa.data,
        categoria: newDespesa.categoria,
      })
      .select()
      .single()
    if (!error && data) {
      setDespesas([...despesas, data])
      setIsDespesaModalOpen(false)
      setNewDespesa({
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        categoria: '',
      })
      toast({ title: 'Despesa adicionada!' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestão Financeira</h1>
          <p className="text-slate-500 mt-1 text-sm">Controle de receitas e despesas</p>
        </div>
        <div className="flex gap-2">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[120px] bg-white">
              <SelectValue />
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
            <SelectTrigger className="w-[100px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardContent className="p-6 flex justify-between items-start">
            <div>
              <p className="text-emerald-700 font-medium text-sm">Entradas (Mês)</p>
              <h3 className="text-3xl font-bold mt-1 text-emerald-900">
                {formatBRL(currentRecebido)}
              </h3>
            </div>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-rose-50/50 border-rose-100">
          <CardContent className="p-6 flex justify-between items-start">
            <div>
              <p className="text-rose-700 font-medium text-sm">Saídas (Mês)</p>
              <h3 className="text-3xl font-bold mt-1 text-rose-900">
                {formatBRL(currentDespesas)}
              </h3>
            </div>
            <div className="p-2 bg-rose-100 text-rose-600 rounded-full">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="p-6 flex justify-between items-start">
            <div>
              <p className="text-blue-700 font-medium text-sm">Saldo Líquido</p>
              <h3 className="text-3xl font-bold mt-1 text-blue-900">
                {formatBRL(currentRecebido - currentDespesas)}
              </h3>
            </div>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
              <Wallet className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fluxo" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="fluxo">Fluxo Anual</TabsTrigger>
          <TabsTrigger value="receitas">Receitas (A Receber)</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>
        <TabsContent value="fluxo">
          <Card className="shadow-sm">
            <CardContent className="p-6 h-[400px]">
              <ChartContainer
                config={{
                  recebido: { label: 'Entradas', color: '#10b981' },
                  saida: { label: 'Saídas', color: '#f43f5e' },
                }}
                className="w-full h-full"
              >
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b' }}
                      dy={10}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                      dataKey="recebido"
                      name="Entradas"
                      fill="var(--color-recebido)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="saida"
                      name="Saídas"
                      fill="var(--color-saida)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="receitas">
          <Card className="shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="text-right">Recebido</TableHead>
                  <TableHead className="text-right">A Receber</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientsSummary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      Nenhum registro.
                    </TableCell>
                  </TableRow>
                ) : (
                  patientsSummary.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.nome}{' '}
                        {p.valor_a_receber > 0 && (
                          <Badge variant="destructive" className="ml-2 text-[10px]">
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">
                        {formatBRL(p.valor_recebido)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {formatBRL(p.valor_a_receber)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="despesas">
          <Card className="shadow-sm mb-4">
            <CardContent className="p-4 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">
                Despesas do Mês ({month}/{year})
              </h3>
              <Dialog open={isDespesaModalOpen} onOpenChange={setIsDespesaModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" /> Nova Despesa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Despesa</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddDespesa} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={newDespesa.descricao}
                        onChange={(e) =>
                          setNewDespesa({ ...newDespesa, descricao: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newDespesa.valor}
                        onChange={(e) => setNewDespesa({ ...newDespesa, valor: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={newDespesa.data}
                        onChange={(e) => setNewDespesa({ ...newDespesa, data: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Input
                        value={newDespesa.categoria}
                        onChange={(e) =>
                          setNewDespesa({ ...newDespesa, categoria: e.target.value })
                        }
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Salvar Despesa
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          <Card className="shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesas.filter((d) => new Date(d.data).getMonth() + 1 === parseInt(month))
                  .length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      Nenhuma despesa registrada no mês.
                    </TableCell>
                  </TableRow>
                ) : (
                  despesas
                    .filter((d) => new Date(d.data).getMonth() + 1 === parseInt(month))
                    .map((d) => (
                      <TableRow key={d.id}>
                        <TableCell>{new Date(d.data).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-medium">{d.descricao}</TableCell>
                        <TableCell>{d.categoria}</TableCell>
                        <TableCell className="text-right text-rose-600 font-bold">
                          {formatBRL(Number(d.valor))}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
