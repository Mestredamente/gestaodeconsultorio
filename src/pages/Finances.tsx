import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { formatBRL, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  CreditCard,
  QrCode,
  Banknote,
  Search,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import WhatsAppBillingDialog from '@/components/WhatsAppBillingDialog'

export default function Finances() {
  const { user, session } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [finances, setFinances] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [summary, setSummary] = useState({ recebido: 0, a_receber: 0, despesas: 0 })
  const [pixKey, setPixKey] = useState('')

  // Modal States
  const [isReceiveOpen, setIsReceiveOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 16))
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchData = async () => {
    if (!user) return
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()

    try {
      const [finRes, despRes, patRes, userRes] = await Promise.all([
        supabase
          .from('financeiro')
          .select('*, pacientes(nome)')
          .eq('usuario_id', user.id)
          .order('data_atualizacao', { ascending: false }),
        supabase
          .from('despesas')
          .select('*')
          .eq('usuario_id', user.id)
          .gte('data', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`),
        supabase.from('pacientes').select('id, nome').eq('usuario_id', user.id),
        supabase.from('usuarios').select('chave_pix').eq('id', user.id).single(),
      ])

      const allFinances = finRes.data || []
      setFinances(allFinances)
      setPatients(patRes.data || [])
      if (userRes.data?.chave_pix) setPixKey(userRes.data.chave_pix)

      const monthFinances = allFinances.filter(
        (f) => f.mes === currentMonth && f.ano === currentYear,
      )
      const recebido = monthFinances.reduce(
        (acc, curr) => acc + Number(curr.valor_recebido || 0),
        0,
      )
      const aReceber = monthFinances.reduce(
        (acc, curr) => acc + Number(curr.valor_a_receber || 0),
        0,
      )
      const despesas = (despRes.data || []).reduce((acc, curr) => acc + Number(curr.valor || 0), 0)

      setSummary({ recebido, a_receber: aReceber, despesas })
    } catch (error) {
      console.error('Error fetching finances:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleReceivePayment = async () => {
    if (!selectedPatient || !amount || Number(amount) <= 0) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos corretamente.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      const dateObj = new Date(paymentDate)
      const { error } = await supabase.from('financeiro').insert({
        usuario_id: user!.id,
        paciente_id: selectedPatient,
        valor_recebido: Number(amount),
        valor_a_receber: 0,
        mes: dateObj.getMonth() + 1,
        ano: dateObj.getFullYear(),
        status: 'recebido',
        metodo_pagamento: paymentMethod,
        data_atualizacao: dateObj.toISOString(),
      })

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Pagamento registrado com sucesso!' })
      setIsReceiveOpen(false)
      setAmount('')
      setSelectedPatient('')
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro ao registrar', description: error.message, variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStripeCheckout = async () => {
    if (!selectedPatient || !amount) {
      toast({
        title: 'Erro',
        description: 'Selecione o paciente e o valor.',
        variant: 'destructive',
      })
      return
    }
    setIsProcessing(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/processar_pagamento`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paciente_id: selectedPatient,
            valor: Number(amount),
            gateway: 'stripe',
          }),
        },
      )
      const data = await res.json()
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank')
        toast({ title: 'Link Gerado', description: 'Redirecionando para o Stripe...' })
      } else {
        throw new Error(data.error || 'Erro desconhecido ao gerar link')
      }
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'pix':
        return (
          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
            PIX
          </Badge>
        )
      case 'dinheiro':
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Dinheiro
          </Badge>
        )
      case 'cartao':
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Cartão
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-600">
            {method || 'Outro'}
          </Badge>
        )
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Carteira</h1>
          <p className="text-slate-500 mt-1.5 font-medium">Gestão financeira do seu consultório.</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto gap-2 shadow-sm rounded-xl font-bold bg-primary text-white hover:bg-primary/90">
                <Plus className="w-5 h-5" /> Receber Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl">
              <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Registrar Recebimento
                </DialogTitle>
                <DialogDescription>
                  Escolha o método de pagamento e confirme o recebimento.
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-6 bg-white">
                <div className="grid gap-5">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Paciente</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50">
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Valor (R$)</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                        R$
                      </span>
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-slate-200 text-lg font-bold bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-700 font-semibold">Método de Pagamento</Label>
                  <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-14 bg-slate-100/80 rounded-xl p-1.5">
                      <TabsTrigger
                        value="pix"
                        className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                      >
                        <QrCode className="w-4 h-4 mr-2" /> PIX
                      </TabsTrigger>
                      <TabsTrigger
                        value="dinheiro"
                        className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all"
                      >
                        <Banknote className="w-4 h-4 mr-2" /> Dinheiro
                      </TabsTrigger>
                      <TabsTrigger
                        value="cartao"
                        className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                      >
                        <CreditCard className="w-4 h-4 mr-2" /> Cartão
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                      <TabsContent
                        value="pix"
                        className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                          <img
                            src="https://img.usecurling.com/i?q=qr-code&shape=lineal-color"
                            alt="QR Code"
                            className="w-32 h-32 opacity-80"
                          />
                          <p className="mt-4 text-sm font-medium text-slate-500">
                            Chave PIX da Clínica
                          </p>
                          <p className="font-mono font-bold text-slate-900 bg-white px-4 py-2 rounded-lg border shadow-sm mt-1 w-full text-center truncate">
                            {pixKey || 'Chave não cadastrada'}
                          </p>
                        </div>
                        <Button
                          className="w-full h-12 rounded-xl font-bold text-base bg-teal-600 hover:bg-teal-700 text-white"
                          onClick={handleReceivePayment}
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processando...' : 'Confirmar Recebimento PIX'}
                        </Button>
                      </TabsContent>

                      <TabsContent
                        value="dinheiro"
                        className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div className="space-y-2 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                          <Label className="text-emerald-800 font-semibold">
                            Data e Hora do Recebimento
                          </Label>
                          <Input
                            type="datetime-local"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="h-12 rounded-xl border-emerald-200 bg-white"
                          />
                        </div>
                        <Button
                          className="w-full h-12 rounded-xl font-bold text-base bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={handleReceivePayment}
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processando...' : 'Confirmar Pagamento Físico'}
                        </Button>
                      </TabsContent>

                      <TabsContent
                        value="cartao"
                        className="space-y-4 animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-center">
                          <CreditCard className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
                          <p className="text-indigo-900 font-medium text-sm">
                            Gere um link de pagamento seguro via Stripe e envie para o paciente.
                          </p>
                        </div>
                        <Button
                          className="w-full h-12 rounded-xl font-bold text-base bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={handleStripeCheckout}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            'Gerando Link...'
                          ) : (
                            <>
                              <ExternalLink className="w-5 h-5 mr-2" /> Gerar Checkout Stripe
                            </>
                          )}
                        </Button>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-[1.5rem] border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Recebido no Mês
                </p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatBRL(summary.recebido)}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[1.5rem] border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                  A Receber
                </p>
                <h3 className="text-3xl font-black text-amber-600 tracking-tight">
                  {formatBRL(summary.a_receber)}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[1.5rem] border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Despesas do Mês
                </p>
                <h3 className="text-3xl font-black text-red-600 tracking-tight">
                  {formatBRL(summary.despesas)}
                </h3>
              </div>
              <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[1.5rem] border-slate-200/60 shadow-sm hover:shadow-md transition-shadow bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Saldo Atual
                </p>
                <h3 className="text-3xl font-black text-white tracking-tight">
                  {formatBRL(summary.recebido - summary.despesas)}
                </h3>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl text-white">
                <Banknote className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        <Tabs defaultValue="transactions" className="w-full">
          <div className="px-6 pt-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-slate-100/80 p-1 rounded-xl h-12">
              <TabsTrigger
                value="transactions"
                className="rounded-lg font-bold px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Histórico
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-lg font-bold px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Inadimplentes
              </TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar transação..."
                className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          <TabsContent value="transactions" className="m-0">
            {finances.length === 0 ? (
              <div className="text-center py-20 text-slate-500">Nenhuma transação registrada.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-100">
                      <TableHead className="font-bold text-slate-700 py-4 px-6">Data</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4">Paciente</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4">Referência</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4">Método</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4 text-right">
                        Valor Recebido
                      </TableHead>
                      <TableHead className="font-bold text-slate-700 py-4 text-center px-6">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finances.map((item) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-slate-50/80 border-slate-100 transition-colors"
                      >
                        <TableCell className="font-medium text-slate-500 px-6 py-4">
                          {new Date(item.data_atualizacao).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 py-4">
                          {item.pacientes?.nome || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-600 font-medium py-4">
                          {String(item.mes).padStart(2, '0')}/{item.ano}
                        </TableCell>
                        <TableCell className="py-4">
                          {getMethodBadge(item.metodo_pagamento)}
                        </TableCell>
                        <TableCell className="font-black text-emerald-600 text-right py-4">
                          {formatBRL(item.valor_recebido)}
                        </TableCell>
                        <TableCell className="text-center px-6 py-4">
                          {item.status === 'recebido' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 font-bold gap-1 shadow-none">
                              <CheckCircle2 className="w-3 h-3" /> Pago
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200 font-bold"
                            >
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="m-0">
            {finances.filter((f) => f.valor_a_receber > 0).length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Tudo em dia!</h4>
                <p className="text-slate-500 mt-1">Nenhuma fatura em aberto.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-100">
                      <TableHead className="font-bold text-slate-700 py-4 px-6">Paciente</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4">Referência</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4">
                        Valor em Aberto
                      </TableHead>
                      <TableHead className="font-bold text-slate-700 py-4 text-right px-6">
                        Ação
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finances
                      .filter((f) => f.valor_a_receber > 0)
                      .map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/80 border-slate-100">
                          <TableCell className="font-bold text-slate-900 px-6 py-4">
                            {item.pacientes?.nome}
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium py-4">
                            {String(item.mes).padStart(2, '0')}/{item.ano}
                          </TableCell>
                          <TableCell className="font-black text-amber-600 py-4">
                            {formatBRL(item.valor_a_receber)}
                          </TableCell>
                          <TableCell className="text-right px-6 py-4">
                            <WhatsAppBillingDialog
                              pacienteId={item.paciente_id}
                              patientName={item.pacientes?.nome || ''}
                              onSuccess={fetchData}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
