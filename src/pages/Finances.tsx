import { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Plus,
  RefreshCw,
  CheckCircle,
  FileText,
  Printer,
  AlertCircle,
  Download,
  Landmark,
} from 'lucide-react'
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
import { measurePerformance } from '@/lib/performance'
import { cn } from '@/lib/utils'
import { AccountingTab } from '@/components/AccountingTab'

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
  const [error, setError] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const [patients, setPatients] = useState<any[]>([])
  const [finances, setFinances] = useState<any[]>([])
  const [despesas, setDespesas] = useState<any[]>([])
  const [reembolsos, setReembolsos] = useState<any[]>([])
  const [overdueAlerts, setOverdueAlerts] = useState<any[]>([])

  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false)
  const [newDespesa, setNewDespesa] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
  })

  const fetchYearData = useCallback(async () => {
    if (!user) return
    setError(false)
    setLoading(true)

    const cacheKey = `finances_${user.id}_${year}`
    const cachedData = localStorage.getItem(cacheKey)

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData)
        if (parsed.patients && parsed.finances && parsed.despesas) {
          setPatients(parsed.patients)
          setFinances(parsed.finances)
          setDespesas(parsed.despesas)
          setReembolsos(parsed.reembolsos || [])
          setOverdueAlerts(parsed.overdueAlerts || [])
          setLoading(false)
        }
      } catch (e) {
        console.error('Failed to parse cache', e)
      }
    }

    try {
      await measurePerformance(`fetchFinances_${year}`, async () => {
        const yearNum = parseInt(year)

        const [patientsRes, financeRes, despesasRes, reembolsosRes, overdueRes] = await Promise.all(
          [
            supabase
              .from('pacientes')
              .select('id, nome, valor_sessao, frequencia_pagamento, dia_pagamento')
              .eq('usuario_id', user.id),
            supabase
              .from('financeiro')
              .select('*, pacientes(nome, cpf)')
              .eq('usuario_id', user.id)
              .eq('ano', yearNum),
            supabase
              .from('despesas')
              .select('*')
              .eq('usuario_id', user.id)
              .gte('data', `${yearNum}-01-01`)
              .lt('data', `${yearNum + 1}-01-01`),
            supabase
              .from('agendamentos')
              .select(
                'id, data_hora, valor_total, status_reembolso, codigo_autorizacao, convenio_id, pacientes(nome), convenios(nome)',
              )
              .eq('usuario_id', user.id)
              .eq('tipo_pagamento', 'convenio')
              .gte('data_hora', `${yearNum}-01-01`)
              .lt('data_hora', `${yearNum + 1}-01-01`),
            supabase
              .from('financeiro')
              .select('id, mes, ano, valor_a_receber, paciente_id, pacientes(nome, telefone)')
              .eq('usuario_id', user.id)
              .gt('valor_a_receber', 0),
          ],
        )

        if (patientsRes.error || financeRes.error || despesasRes.error) {
          throw new Error('Falha ao carregar dados do supabase')
        }

        let alerts: any[] = []
        if (overdueRes.data) {
          const today = new Date()
          alerts = overdueRes.data
            .map((fin: any) => {
              const dueDate = new Date(fin.ano, fin.mes, 1) // 1st of the next month basically
              const daysOpen = Math.floor(
                (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
              )
              return { ...fin, daysOpen }
            })
            .filter((fin: any) => fin.daysOpen > 30)
            .sort((a: any, b: any) => b.daysOpen - a.daysOpen)
        }

        if (patientsRes.data) setPatients(patientsRes.data)
        if (financeRes.data) setFinances(financeRes.data)
        if (despesasRes.data) setDespesas(despesasRes.data)
        if (reembolsosRes.data) setReembolsos(reembolsosRes.data)
        setOverdueAlerts(alerts)

        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            patients: patientsRes.data || [],
            finances: financeRes.data || [],
            despesas: despesasRes.data || [],
            reembolsos: reembolsosRes.data || [],
            overdueAlerts: alerts,
          }),
        )
      })
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [user, year])

  useEffect(() => {
    fetchYearData()
  }, [fetchYearData])

  const { currentRecebido, currentDespesas, chartData, patientsSummary, pendenciasReembolso } =
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

      const pendingReembolsos = reembolsos.filter((r) => r.status_reembolso !== 'recebido')
      const groupedReembolsos = pendingReembolsos.reduce((acc, curr) => {
        const convName = Array.isArray(curr.convenios)
          ? curr.convenios[0]?.nome
          : curr.convenios?.nome || 'Convênio Desconhecido'
        if (!acc[convName]) acc[convName] = { operadora: convName, total: 0, items: [] }
        acc[convName].total += Number(curr.valor_total)
        acc[convName].items.push(curr)
        return acc
      }, {} as any)

      return {
        currentRecebido: monthFin.reduce((sum, f) => sum + Number(f.valor_recebido), 0),
        currentDespesas: monthDesp.reduce((sum, d) => sum + Number(d.valor), 0),
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
        pendenciasReembolso: Object.values(groupedReembolsos),
      }
    }, [month, finances, despesas, patients, reembolsos])

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
      const newDespesas = [...despesas, data]
      setDespesas(newDespesas)
      setIsDespesaModalOpen(false)
      setNewDespesa({
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        categoria: '',
      })
      toast({ title: 'Despesa adicionada!' })
      fetchYearData()
    }
  }

  const handleUpdateReembolso = async (id: string, novoStatus: string) => {
    const { error } = await supabase
      .from('agendamentos')
      .update({ status_reembolso: novoStatus })
      .eq('id', id)
    if (!error) {
      toast({ title: `Status de reembolso atualizado para ${novoStatus}` })
      fetchYearData()
    }
  }

  const handleExportOverdueCSV = () => {
    const headers = ['Paciente', 'Dias em Atraso', 'Referencia', 'Valor Pendente']
    const csvData = overdueAlerts.map((alert) => {
      const pInfo = Array.isArray(alert.pacientes) ? alert.pacientes[0] : alert.pacientes
      return [
        `"${pInfo?.nome || 'Desconhecido'}"`,
        alert.daysOpen,
        `${String(alert.mes).padStart(2, '0')}/${alert.ano}`,
        alert.valor_a_receber,
      ].join(';')
    })
    const blob = new Blob(['\uFEFF' + [headers.join(';'), ...csvData].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inadimplencia_${month}_${year}.csv`
    a.click()
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestão Financeira</h1>
        <Card className="shadow-sm border-slate-200 bg-slate-50">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <p className="text-slate-500 mb-4 font-medium">
              Não foi possível carregar estes dados de forma confiável.
            </p>
            <Button onClick={fetchYearData} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isPrinting) {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto text-black" style={{ minHeight: '100vh' }}>
        <div className="text-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-widest">
            Relatório de Inadimplência
          </h1>
          <p className="text-gray-500 mt-2">
            Gerado em {new Date().toLocaleDateString('pt-BR')} (Referência: {month}/{year})
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Pacientes com Pagamentos Pendentes</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-2">Paciente</th>
                <th className="py-2 text-center">Dias em Atraso</th>
                <th className="py-2 text-right">Valor Pendente</th>
              </tr>
            </thead>
            <tbody>
              {overdueAlerts.map((alert) => {
                const pInfo = Array.isArray(alert.pacientes) ? alert.pacientes[0] : alert.pacientes
                return (
                  <tr key={alert.id} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{pInfo?.nome}</td>
                    <td className="py-3 text-center text-gray-600">{alert.daysOpen} dias</td>
                    <td className="py-3 text-right font-bold text-red-600">
                      {formatBRL(alert.valor_a_receber)}
                    </td>
                  </tr>
                )
              })}
              {overdueAlerts.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">
                    Nenhuma pendência acima de 30 dias.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Pendências de Convênio (A Receber)</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-2">Convênio</th>
                <th className="py-2 text-right">Valor Pendente</th>
              </tr>
            </thead>
            <tbody>
              {pendenciasReembolso.map((g: any, i: number) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-3 font-medium">{g.operadora}</td>
                  <td className="py-3 text-right font-bold text-amber-600">{formatBRL(g.total)}</td>
                </tr>
              ))}
              {pendenciasReembolso.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-gray-500">
                    Nenhuma pendência de convênio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
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

      {overdueAlerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 shadow-sm mb-6 print:hidden">
          <CardHeader className="pb-3 border-b border-amber-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Alertas de Inadimplência (Acima de 30 dias)
            </CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-white flex-1 sm:flex-none"
                onClick={() => {
                  setIsPrinting(true)
                  setTimeout(() => {
                    window.print()
                    setIsPrinting(false)
                  }, 300)
                }}
              >
                <Printer className="w-4 h-4" /> Exportar PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-white flex-1 sm:flex-none"
                onClick={handleExportOverdueCSV}
              >
                <Download className="w-4 h-4" /> Exportar Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {overdueAlerts.map((alert) => {
              const isCritical = alert.daysOpen > 60
              const pInfo = Array.isArray(alert.pacientes) ? alert.pacientes[0] : alert.pacientes
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 rounded-lg border flex flex-col sm:flex-row justify-between sm:items-center gap-3',
                    isCritical ? 'bg-red-50 border-red-200' : 'bg-white border-amber-100',
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        'font-semibold text-sm',
                        isCritical ? 'text-red-900' : 'text-slate-800',
                      )}
                    >
                      {pInfo?.nome}
                    </p>
                    <p
                      className={cn(
                        'text-xs font-medium',
                        isCritical ? 'text-red-700' : 'text-slate-500',
                      )}
                    >
                      {alert.daysOpen} dias em atraso (Ref: {String(alert.mes).padStart(2, '0')}/
                      {alert.ano})
                    </p>
                  </div>
                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span
                      className={cn('font-bold', isCritical ? 'text-red-700' : 'text-amber-700')}
                    >
                      {formatBRL(alert.valor_a_receber)}
                    </span>
                    <Button
                      size="sm"
                      variant={isCritical ? 'destructive' : 'outline'}
                      className={cn(
                        'gap-2',
                        !isCritical && 'text-amber-700 border-amber-300 hover:bg-amber-50',
                      )}
                      onClick={() => {
                        if (!pInfo?.telefone) {
                          toast({ title: 'Paciente sem telefone', variant: 'destructive' })
                          return
                        }
                        const msg = `Olá ${pInfo.nome}, notamos um saldo pendente de ${formatBRL(alert.valor_a_receber)} referente ao período de ${String(alert.mes).padStart(2, '0')}/${alert.ano}. Como podemos facilitar o acerto?`
                        window.open(
                          `https://wa.me/${pInfo.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`,
                          '_blank',
                        )
                      }}
                    >
                      Cobrar Agora
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="fluxo" className="w-full">
        <TabsList className="mb-4 flex w-full justify-start overflow-x-auto h-auto bg-slate-100/50 p-1 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsTrigger value="fluxo" className="px-4 py-2 whitespace-nowrap">
            Fluxo Anual
          </TabsTrigger>
          <TabsTrigger value="receitas" className="px-4 py-2 whitespace-nowrap">
            Faturamento
          </TabsTrigger>
          <TabsTrigger value="despesas" className="px-4 py-2 whitespace-nowrap">
            Despesas
          </TabsTrigger>
          <TabsTrigger value="reembolsos" className="px-4 py-2 whitespace-nowrap">
            Pendências de Convênio
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="px-4 py-2 gap-2 whitespace-nowrap">
            <Landmark className="w-4 h-4" /> Fiscal e Contábil
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fluxo">
          <Card className="shadow-sm">
            <CardContent className="p-6 h-[400px]">
              {loading && finances.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ChartContainer
                  config={{
                    recebido: { label: 'Entradas', color: '#10b981' },
                    saida: { label: 'Saídas', color: '#f43f5e' },
                  }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer>
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receitas">
          <Card className="shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Ciclo de Cobrança</TableHead>
                    <TableHead className="text-right">Recebido</TableHead>
                    <TableHead className="text-right">A Receber</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientsSummary.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        Nenhum registro.
                      </TableCell>
                    </TableRow>
                  ) : (
                    patientsSummary.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {p.nome}
                          {p.valor_a_receber > 0 && (
                            <Badge variant="destructive" className="ml-2 text-[10px]">
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500 capitalize text-sm whitespace-nowrap">
                          {p.frequencia_pagamento}{' '}
                          {p.dia_pagamento ? `(Dia ${p.dia_pagamento})` : ''}
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium whitespace-nowrap">
                          {formatBRL(p.valor_recebido)}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-medium whitespace-nowrap">
                          {formatBRL(p.valor_a_receber)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="despesas">
          <Card className="shadow-sm mb-4">
            <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">
                Despesas do Mês ({month}/{year})
              </h3>
              <Dialog open={isDespesaModalOpen} onOpenChange={setIsDespesaModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto">
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
            <div className="overflow-x-auto">
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
                          <TableCell className="whitespace-nowrap">
                            {new Date(d.data).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-medium min-w-[200px]">{d.descricao}</TableCell>
                          <TableCell>{d.categoria}</TableCell>
                          <TableCell className="text-right text-rose-600 font-bold whitespace-nowrap">
                            {formatBRL(Number(d.valor))}
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reembolsos" className="space-y-4">
          {pendenciasReembolso.length === 0 ? (
            <Card className="p-10 text-center border-dashed text-slate-500 shadow-none">
              Nenhuma pendência de convênio para o ano selecionado.
            </Card>
          ) : (
            pendenciasReembolso.map((grupo: any, i: number) => (
              <Card key={i} className="shadow-sm overflow-hidden border-slate-200">
                <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> {grupo.operadora}
                  </h3>
                  <div className="sm:text-right">
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">
                      A Receber
                    </p>
                    <p className="text-lg font-bold text-amber-600">{formatBRL(grupo.total)}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Data da Sessão</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Cód. Autorização</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Status e Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grupo.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(item.data_hora).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            {
                              (Array.isArray(item.pacientes) ? item.pacientes[0] : item.pacientes)
                                ?.nome
                            }
                          </TableCell>
                          <TableCell className="text-slate-500 font-mono text-xs whitespace-nowrap">
                            {item.codigo_autorizacao || '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium whitespace-nowrap">
                            {formatBRL(Number(item.valor_total))}
                          </TableCell>
                          <TableCell className="text-right space-x-2 whitespace-nowrap">
                            {item.status_reembolso === 'pendente' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateReembolso(item.id, 'solicitado')}
                              >
                                Marcar Solicitado
                              </Button>
                            )}
                            {item.status_reembolso === 'solicitado' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="bg-amber-100 text-amber-700 hover:bg-amber-200"
                                onClick={() => handleUpdateReembolso(item.id, 'recebido')}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> Recebido
                              </Button>
                            )}
                            <Badge
                              variant={
                                item.status_reembolso === 'pendente' ? 'destructive' : 'outline'
                              }
                              className="capitalize ml-2"
                            >
                              {item.status_reembolso}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="fiscal">
          <AccountingTab finances={finances} despesas={despesas} year={year} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
