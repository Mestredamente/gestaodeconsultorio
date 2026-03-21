import { useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Plus,
  RefreshCw,
  AlertCircle,
  Download,
  CreditCard,
  QrCode,
  FileText,
  Loader2,
} from 'lucide-react'
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
import { cn, formatBRL } from '@/lib/utils'
import { AccountingTab } from '@/components/AccountingTab'

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

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [receiveData, setReceiveData] = useState({
    paciente_id: '',
    valor: '',
    gateway: 'mercado_pago',
  })
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const yearNum = parseInt(year)

    const [patientsRes, financeRes, despesasRes] = await Promise.all([
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
    ])

    if (patientsRes.data) setPatients(patientsRes.data)
    if (financeRes.data) setFinances(financeRes.data)
    if (despesasRes.data) setDespesas(despesasRes.data)
    setLoading(false)
  }, [user, year])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const { currentRecebido, currentDespesas, chartData, patientsSummary } = useMemo(() => {
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
      chartData: Array.from({ length: 12 }, (_, i) => {
        const finM = finances.filter((f) => f.mes === i + 1)
        const despM = despesas.filter((d) => new Date(d.data).getMonth() + 1 === i + 1)
        return {
          month: [
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
          ][i],
          recebido: finM.reduce((s, f) => s + Number(f.valor_recebido), 0),
          saida: despM.reduce((s, d) => s + Number(d.valor), 0),
        }
      }),
      patientsSummary: pSummary,
    }
  }, [month, finances, despesas, patients])

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
        },
      })
      if (error) throw error

      toast({
        title: 'Link de pagamento gerado!',
        description: `Abrindo checkout via ${receiveData.gateway}...`,
      })
      if (data?.checkoutUrl) window.open(data.checkoutUrl, '_blank')

      setIsReceiveModalOpen(false)
      setReceiveData({ paciente_id: '', valor: '', gateway: 'mercado_pago' })
    } catch (err: any) {
      toast({ title: 'Erro ao processar', description: err.message, variant: 'destructive' })
    } finally {
      setIsProcessingPayment(false)
    }
  }

  if (loading)
    return (
      <div className="flex h-64 justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Financeiro</h1>
          <p className="text-slate-500 mt-1 text-base">
            Controle de receitas, despesas e emissão de cobranças
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[140px] bg-white rounded-xl h-11 border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {[
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
              ].map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isReceiveModalOpen} onOpenChange={setIsReceiveModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl h-11 px-6 shadow-sm">
                <QrCode className="w-4 h-4" /> Receber Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2rem] p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Nova Cobrança</DialogTitle>
                <DialogDescription className="text-base">
                  Gere um link de pagamento integrado.
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
                    <SelectTrigger className="bg-slate-50 h-12 rounded-xl">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={receiveData.valor}
                    onChange={(e) => setReceiveData({ ...receiveData, valor: e.target.value })}
                    required
                    className="bg-slate-50 h-12 rounded-xl text-lg font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gateway de Pagamento</Label>
                  <Select
                    value={receiveData.gateway}
                    onValueChange={(v) => setReceiveData({ ...receiveData, gateway: v })}
                  >
                    <SelectTrigger className="bg-slate-50 h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="mercado_pago">Mercado Pago (PIX/Cartão)</SelectItem>
                      <SelectItem value="stripe">Stripe (Cartão de Crédito)</SelectItem>
                      <SelectItem value="pagseguro">PagSeguro (Boleto/Cartão)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base mt-4"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? 'Gerando Link...' : 'Gerar Cobrança'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50/50 border-emerald-100 rounded-[2rem] shadow-sm">
          <CardContent className="p-8 flex justify-between items-start">
            <div>
              <p className="text-emerald-700 font-bold text-sm uppercase tracking-wider mb-2">
                Entradas (Mês)
              </p>
              <h3 className="text-4xl font-extrabold text-emerald-900">
                {formatBRL(currentRecebido)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-rose-50/50 border-rose-100 rounded-[2rem] shadow-sm">
          <CardContent className="p-8 flex justify-between items-start">
            <div>
              <p className="text-rose-700 font-bold text-sm uppercase tracking-wider mb-2">
                Saídas (Mês)
              </p>
              <h3 className="text-4xl font-extrabold text-rose-900">
                {formatBRL(currentDespesas)}
              </h3>
            </div>
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50/50 border-indigo-100 rounded-[2rem] shadow-sm">
          <CardContent className="p-8 flex justify-between items-start">
            <div>
              <p className="text-indigo-700 font-bold text-sm uppercase tracking-wider mb-2">
                Saldo Líquido
              </p>
              <h3 className="text-4xl font-extrabold text-indigo-900">
                {formatBRL(currentRecebido - currentDespesas)}
              </h3>
            </div>
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
              <Wallet className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receitas" className="w-full">
        <TabsList className="mb-6 flex w-full justify-start overflow-x-auto h-auto bg-slate-100/50 p-1.5 rounded-2xl [&::-webkit-scrollbar]:hidden">
          <TabsTrigger
            value="receitas"
            className="px-6 py-3 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-bold"
          >
            Faturamento
          </TabsTrigger>
          <TabsTrigger
            value="fluxo"
            className="px-6 py-3 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-bold"
          >
            Fluxo Anual
          </TabsTrigger>
          <TabsTrigger
            value="fiscal"
            className="px-6 py-3 gap-2 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-bold"
          >
            Contabilidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receitas">
          <Card className="rounded-[2rem] shadow-sm border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="border-slate-100">
                  <TableHead className="font-bold text-slate-700 h-14 pl-6">Paciente</TableHead>
                  <TableHead className="text-right font-bold text-slate-700 h-14 pr-6">
                    Valor Recebido
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientsSummary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-10 text-slate-500 font-medium">
                      Nenhum registro no mês.
                    </TableCell>
                  </TableRow>
                ) : (
                  patientsSummary.map((p) => (
                    <TableRow key={p.id} className="border-slate-50 hover:bg-slate-50/50">
                      <TableCell className="font-semibold text-slate-800 py-4 pl-6">
                        {p.nome}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600 font-bold py-4 pr-6 text-base">
                        {formatBRL(p.valor_recebido)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="fluxo">
          <Card className="rounded-[2rem] shadow-sm border-slate-100">
            <CardContent className="p-8 h-[400px]">
              <ChartContainer
                config={{
                  recebido: { label: 'Entradas', color: '#10b981' },
                  saida: { label: 'Saídas', color: '#f43f5e' },
                }}
                className="w-full h-full"
              >
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      dy={15}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: '#f8fafc' }} />
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscal">
          <AccountingTab finances={finances} despesas={despesas} year={year} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
