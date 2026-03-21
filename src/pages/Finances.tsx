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
  CreditCard,
  QrCode,
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
  DialogDescription,
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
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)

  const [newDespesa, setNewDespesa] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
  })

  const [receiveData, setReceiveData] = useState({
    paciente_id: '',
    valor: '',
    gateway: 'mercado_pago',
  })
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

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
              const dueDate = new Date(fin.ano, fin.mes, 1)
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
      toast({ title: 'Despesa adicionada com sucesso!' })
      fetchYearData()
    }
  }

  const handleReceivePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!receiveData.paciente_id || !receiveData.valor) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    setIsProcessingPayment(true)
    try {
      const { data, error } = await supabase.functions.invoke('processar_pagamento', {
        body: {
          paciente_id: receiveData.paciente_id,
          valor: Number(receiveData.valor),
          gateway: receiveData.gateway,
          mes: parseInt(month),
          ano: parseInt(year),
        },
      })

      if (error) throw error

      toast({
        title: 'Pagamento processado!',
        description: `Link gerado com sucesso via ${receiveData.gateway}`,
      })
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank')
      }

      setIsReceiveModalOpen(false)
      setReceiveData({ paciente_id: '', valor: '', gateway: 'mercado_pago' })
      fetchYearData()
    } catch (err: any) {
      toast({ title: 'Erro ao processar', description: err.message, variant: 'destructive' })
    } finally {
      setIsProcessingPayment(false)
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão Financeira</h1>
        <Card className="shadow-sm border-slate-200 bg-slate-50 rounded-2xl">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <p className="text-slate-500 mb-4 font-medium text-lg">
              Não foi possível carregar estes dados.
            </p>
            <Button onClick={fetchYearData} className="gap-2 rounded-xl">
              <RefreshCw className="w-4 h-4" /> Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestão Financeira</h1>
          <p className="text-slate-500 mt-1 text-base">
            Controle de receitas, despesas e emissão de cobranças
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-[130px] bg-transparent border-0 focus:ring-0 shadow-none h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="rounded-lg">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-slate-200 self-center mx-1"></div>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[100px] bg-transparent border-0 focus:ring-0 shadow-none h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {[2024, 2025, 2026, 2027].map((y) => (
                  <SelectItem key={y} value={String(y)} className="rounded-lg">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isReceiveModalOpen} onOpenChange={setIsReceiveModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                <QrCode className="w-4 h-4" /> Receber Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">Receber Pagamento</DialogTitle>
                <DialogDescription>
                  Gere um link de cobrança através das integrações configuradas.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleReceivePayment} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Select
                    value={receiveData.paciente_id}
                    onValueChange={(v) => {
                      const p = patients.find((x) => x.id === v)
                      setReceiveData({
                        ...receiveData,
                        paciente_id: v,
                        valor: p?.valor_a_receber?.toString() || p?.valor_sessao?.toString() || '',
                      })
                    }}
                    required
                  >
                    <SelectTrigger className="bg-slate-50 h-11 rounded-xl">
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="rounded-lg">
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor a Cobrar (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={receiveData.valor}
                    onChange={(e) => setReceiveData({ ...receiveData, valor: e.target.value })}
                    required
                    className="bg-slate-50 h-11 rounded-xl text-lg font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gateway de Pagamento</Label>
                  <Select
                    value={receiveData.gateway}
                    onValueChange={(v) => setReceiveData({ ...receiveData, gateway: v })}
                  >
                    <SelectTrigger className="bg-slate-50 h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="mercado_pago" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-blue-500" /> Mercado Pago (PIX/Cartão)
                        </div>
                      </SelectItem>
                      <SelectItem value="stripe" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-500" /> Stripe (Cartão de
                          Crédito)
                        </div>
                      </SelectItem>
                      <SelectItem value="pagseguro" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-500" /> PagSeguro (Boleto/Cartão)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />{' '}
                      Processando...
                    </>
                  ) : (
                    'Gerar Cobrança'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50 border-emerald-100 rounded-3xl shadow-sm">
          <CardContent className="p-8 flex justify-between items-start">
            <div>
              <p className="text-emerald-700 font-bold text-sm uppercase tracking-wider mb-2">
                Entradas (Mês)
              </p>
              <h3 className="text-4xl font-extrabold text-emerald-900">
                {formatBRL(currentRecebido)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-100 rounded-3xl shadow-sm">
          <CardContent className="p-8 flex justify-between items-start">
            <div>
              <p className="text-rose-700 font-bold text-sm uppercase tracking-wider mb-2">
                Saídas (Mês)
              </p>
              <h3 className="text-4xl font-extrabold text-rose-900">
                {formatBRL(currentDespesas)}
              </h3>
            </div>
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shadow-sm">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-100 rounded-3xl shadow-sm">
          <CardContent className="p-8 flex justify-between items-start">
            <div>
              <p className="text-indigo-700 font-bold text-sm uppercase tracking-wider mb-2">
                Saldo Líquido
              </p>
              <h3 className="text-4xl font-extrabold text-indigo-900">
                {formatBRL(currentRecebido - currentDespesas)}
              </h3>
            </div>
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl shadow-sm">
              <Wallet className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {overdueAlerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 rounded-2xl shadow-sm mb-6 print:hidden">
          <CardHeader className="pb-4 border-b border-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="text-base font-bold text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Alertas de Inadimplência (Acima de 30 dias)
            </CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 bg-white rounded-lg flex-1 md:flex-none h-9"
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
                className="gap-2 bg-white rounded-lg flex-1 md:flex-none h-9"
                onClick={handleExportOverdueCSV}
              >
                <Download className="w-4 h-4" /> Exportar Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            {overdueAlerts.map((alert) => {
              const isCritical = alert.daysOpen > 60
              const pInfo = Array.isArray(alert.pacientes) ? alert.pacientes[0] : alert.pacientes
              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-sm',
                    isCritical ? 'bg-red-50/50 border-red-200' : 'bg-white border-amber-100',
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        'font-bold text-base',
                        isCritical ? 'text-red-900' : 'text-slate-800',
                      )}
                    >
                      {pInfo?.nome}
                    </p>
                    <p
                      className={cn(
                        'text-sm font-medium mt-1',
                        isCritical ? 'text-red-700' : 'text-slate-500',
                      )}
                    >
                      <span className="bg-white/50 px-2 py-0.5 rounded-md border">
                        {alert.daysOpen} dias em atraso
                      </span>{' '}
                      (Ref: {String(alert.mes).padStart(2, '0')}/{alert.ano})
                    </p>
                  </div>
                  <div className="flex items-center gap-4 justify-between md:justify-end">
                    <span
                      className={cn(
                        'font-extrabold text-lg',
                        isCritical ? 'text-red-700' : 'text-amber-700',
                      )}
                    >
                      {formatBRL(alert.valor_a_receber)}
                    </span>
                    <Button
                      size="sm"
                      variant={isCritical ? 'destructive' : 'outline'}
                      className={cn(
                        'gap-2 rounded-lg h-9',
                        !isCritical && 'text-amber-700 border-amber-300 hover:bg-amber-50',
                      )}
                      onClick={() => {
                        if (!pInfo?.telefone) {
                          toast({ title: 'Paciente sem telefone', variant: 'destructive' })
                          return
                        }
                        const msg = `Olá ${pInfo.nome}, notamos um saldo pendente de ${formatBRL(alert.valor_a_receber)} referente a ${String(alert.mes).padStart(2, '0')}/${alert.ano}. Podemos ajudar com algo?`
                        window.open(
                          `https://wa.me/${pInfo.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`,
                          '_blank',
                        )
                      }}
                    >
                      Cobrar no WhatsApp
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="receitas" className="w-full">
        <TabsList className="mb-6 flex w-full justify-start overflow-x-auto h-auto bg-slate-100/50 p-1.5 rounded-2xl [&::-webkit-scrollbar]:hidden">
          <TabsTrigger
            value="receitas"
            className="px-5 py-2.5 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-semibold"
          >
            Faturamento Mensal
          </TabsTrigger>
          <TabsTrigger
            value="despesas"
            className="px-5 py-2.5 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-semibold"
          >
            Despesas
          </TabsTrigger>
          <TabsTrigger
            value="fluxo"
            className="px-5 py-2.5 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-semibold"
          >
            Gráfico de Fluxo
          </TabsTrigger>
          <TabsTrigger
            value="reembolsos"
            className="px-5 py-2.5 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-semibold"
          >
            Pendências de Convênio
          </TabsTrigger>
          <TabsTrigger
            value="fiscal"
            className="px-5 py-2.5 gap-2 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-semibold"
          >
            <Landmark className="w-4 h-4" /> Contabilidade / Impostos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receitas">
          <Card className="rounded-2xl shadow-sm border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-slate-100">
                    <TableHead className="font-bold text-slate-700 h-12">Paciente</TableHead>
                    <TableHead className="font-bold text-slate-700 h-12">
                      Ciclo de Cobrança
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-700 h-12">
                      Valor Recebido
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-700 h-12">
                      A Receber
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientsSummary.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-10 text-slate-500 font-medium"
                      >
                        Nenhum registro para este mês.
                      </TableCell>
                    </TableRow>
                  ) : (
                    patientsSummary.map((p) => (
                      <TableRow key={p.id} className="border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="font-semibold text-slate-800 whitespace-nowrap py-4">
                          {p.nome}
                          {p.valor_a_receber > 0 && (
                            <Badge
                              variant="destructive"
                              className="ml-3 text-[10px] uppercase font-bold tracking-wider"
                            >
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500 capitalize text-sm whitespace-nowrap py-4">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                            {p.frequencia_pagamento}{' '}
                            {p.dia_pagamento ? `(Dia ${p.dia_pagamento})` : ''}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 font-bold whitespace-nowrap py-4 text-base">
                          {formatBRL(p.valor_recebido)}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-bold whitespace-nowrap py-4 text-base">
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
          <Card className="rounded-2xl shadow-sm border-slate-100 mb-6">
            <CardContent className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white rounded-2xl">
              <h3 className="font-bold text-lg text-slate-800">
                Despesas Operacionais ({month}/{year})
              </h3>
              <Dialog open={isDespesaModalOpen} onOpenChange={setIsDespesaModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto rounded-xl h-11 px-6 shadow-sm">
                    <Plus className="w-4 h-4" /> Adicionar Despesa
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Nova Despesa</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddDespesa} className="space-y-5 pt-4">
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={newDespesa.descricao}
                        onChange={(e) =>
                          setNewDespesa({ ...newDespesa, descricao: e.target.value })
                        }
                        required
                        className="bg-slate-50 h-11 rounded-xl"
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
                        className="bg-slate-50 h-11 rounded-xl"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={newDespesa.data}
                          onChange={(e) => setNewDespesa({ ...newDespesa, data: e.target.value })}
                          required
                          className="bg-slate-50 h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Input
                          value={newDespesa.categoria}
                          onChange={(e) =>
                            setNewDespesa({ ...newDespesa, categoria: e.target.value })
                          }
                          placeholder="Ex: Impostos, Aluguel"
                          className="bg-slate-50 h-11 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl text-base mt-2">
                      Salvar Despesa
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-slate-100">
                    <TableHead className="font-bold text-slate-700 h-12">Data</TableHead>
                    <TableHead className="font-bold text-slate-700 h-12">Descrição</TableHead>
                    <TableHead className="font-bold text-slate-700 h-12">Categoria</TableHead>
                    <TableHead className="text-right font-bold text-slate-700 h-12">
                      Valor
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {despesas.filter((d) => new Date(d.data).getMonth() + 1 === parseInt(month))
                    .length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-10 text-slate-500 font-medium"
                      >
                        Nenhuma despesa registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    despesas
                      .filter((d) => new Date(d.data).getMonth() + 1 === parseInt(month))
                      .map((d) => (
                        <TableRow key={d.id} className="border-slate-50 hover:bg-slate-50/50">
                          <TableCell className="whitespace-nowrap py-4 text-slate-600 font-medium">
                            {new Date(d.data).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-bold text-slate-800 min-w-[200px] py-4">
                            {d.descricao}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-sm">
                              {d.categoria || 'Geral'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-rose-600 font-bold whitespace-nowrap py-4 text-base">
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

        <TabsContent value="fluxo">
          <Card className="rounded-2xl shadow-sm border-slate-100">
            <CardContent className="p-8 h-[450px]">
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
                      margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        dy={15}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={50}
                        iconType="circle"
                        wrapperStyle={{ fontWeight: 600, fontSize: 13, color: '#475569' }}
                      />
                      <Bar
                        dataKey="recebido"
                        name="Entradas"
                        fill="var(--color-recebido)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={45}
                      />
                      <Bar
                        dataKey="saida"
                        name="Saídas"
                        fill="var(--color-saida)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={45}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reembolsos" className="space-y-6">
          {pendenciasReembolso.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed rounded-2xl text-slate-500 shadow-none font-medium">
              Nenhuma pendência de convênio para o ano selecionado.
            </Card>
          ) : (
            pendenciasReembolso.map((grupo: any, i: number) => (
              <Card key={i} className="shadow-sm overflow-hidden border-slate-100 rounded-2xl">
                <div className="bg-slate-50 p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" /> {grupo.operadora}
                  </h3>
                  <div className="sm:text-right bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                      A Receber Total
                    </p>
                    <p className="text-xl font-black text-amber-600 leading-none mt-1">
                      {formatBRL(grupo.total)}
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100">
                        <TableHead className="whitespace-nowrap font-bold h-12">Data</TableHead>
                        <TableHead className="font-bold h-12">Paciente</TableHead>
                        <TableHead className="font-bold h-12">Autorização</TableHead>
                        <TableHead className="text-right font-bold h-12">Valor</TableHead>
                        <TableHead className="text-right font-bold h-12">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grupo.items.map((item: any) => (
                        <TableRow key={item.id} className="border-slate-50">
                          <TableCell className="whitespace-nowrap py-4 text-slate-600 font-medium">
                            {new Date(item.data_hora).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-bold text-slate-800 whitespace-nowrap py-4">
                            {
                              (Array.isArray(item.pacientes) ? item.pacientes[0] : item.pacientes)
                                ?.nome
                            }
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono text-xs border border-slate-200">
                              {item.codigo_autorizacao || 'S/N'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-900 whitespace-nowrap py-4 text-base">
                            {formatBRL(Number(item.valor_total))}
                          </TableCell>
                          <TableCell className="text-right space-x-2 whitespace-nowrap py-4">
                            {item.status_reembolso === 'pendente' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-lg h-8"
                                onClick={() => handleUpdateReembolso(item.id, 'solicitado')}
                              >
                                Solicitar
                              </Button>
                            )}
                            {item.status_reembolso === 'solicitado' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg h-8 font-bold"
                                onClick={() => handleUpdateReembolso(item.id, 'recebido')}
                              >
                                <CheckCircle className="w-3 h-3 mr-1.5" /> Baixar
                              </Button>
                            )}
                            <Badge
                              variant={
                                item.status_reembolso === 'pendente' ? 'destructive' : 'outline'
                              }
                              className="capitalize ml-2 rounded-md font-bold"
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
