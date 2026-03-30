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
  MoreVertical,
  Filter,
} from 'lucide-react'
import WhatsAppBillingDialog from '@/components/WhatsAppBillingDialog'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Finances() {
  const { user, session } = useAuth()
  const { toast } = useToast()
  const isMobile = useIsMobile()
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
  const [search, setSearch] = useState('')

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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isMobile) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'pix':
        return (
          <Badge
            variant="outline"
            className="bg-teal-50 text-teal-700 border-teal-200 text-[10px] h-5 py-0 px-2"
          >
            PIX
          </Badge>
        )
      case 'dinheiro':
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] h-5 py-0 px-2"
          >
            Dinheiro
          </Badge>
        )
      case 'cartao':
        return (
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] h-5 py-0 px-2"
          >
            Cartão
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-600 text-[10px] h-5 py-0 px-2"
          >
            {method || 'Outro'}
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const filteredFinances = finances.filter(
    (f) => !search || f.pacientes?.nome?.toLowerCase().includes(search.toLowerCase()),
  )

  const pendingFinances = filteredFinances.filter((f) => f.valor_a_receber > 0)

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Carteira</h1>
          <p className="text-slate-500 mt-1.5 font-medium text-base">
            Gestão financeira do seu consultório.
          </p>
        </div>

        <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto gap-2 shadow-sm rounded-xl font-bold h-12 md:h-11 text-base md:text-sm">
              <Plus className="w-6 h-6 md:w-5 md:h-5" /> Receber Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] p-0 flex flex-col overflow-hidden border-0 rounded-2xl shadow-2xl">
            <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100 shrink-0 sticky top-0 z-10">
              <DialogTitle className="text-xl font-bold text-slate-900 pr-8">
                Registrar Recebimento
              </DialogTitle>
              <DialogDescription className="mt-1">
                Escolha o método de pagamento e confirme o recebimento.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
              <div className="grid gap-5">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-base md:text-sm">
                    Paciente
                  </Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 text-base">
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-base md:text-sm">
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-base md:text-sm">
                    Valor (R$)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      R$
                    </span>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onFocus={handleFocus}
                      className="pl-10 h-12 rounded-xl border-slate-200 text-lg font-bold bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-semibold text-base md:text-sm">
                  Método de Pagamento
                </Label>
                <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-14 bg-slate-100/80 rounded-xl p-1.5">
                    <TabsTrigger
                      value="pix"
                      className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-sm md:text-xs"
                    >
                      <QrCode className="w-4 h-4 md:mr-1.5" />{' '}
                      <span className="hidden sm:inline">PIX</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="dinheiro"
                      className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm transition-all text-sm md:text-xs"
                    >
                      <Banknote className="w-4 h-4 md:mr-1.5" />{' '}
                      <span className="hidden sm:inline">Dinheiro</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="cartao"
                      className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all text-sm md:text-xs"
                    >
                      <CreditCard className="w-4 h-4 md:mr-1.5" />{' '}
                      <span className="hidden sm:inline">Cartão</span>
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
                          className="w-24 h-24 opacity-80"
                        />
                        <p className="mt-4 text-sm font-medium text-slate-500">
                          Chave PIX da Clínica
                        </p>
                        <p className="font-mono font-bold text-slate-900 bg-white px-4 py-2 rounded-lg border shadow-sm mt-1 w-full text-center truncate text-sm">
                          {pixKey || 'Chave não cadastrada'}
                        </p>
                      </div>
                      <Button
                        className="w-full h-14 md:h-12 rounded-xl font-bold text-base bg-teal-600 hover:bg-teal-700 text-white"
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
                        <Label className="text-emerald-800 font-semibold text-sm">
                          Data e Hora do Recebimento
                        </Label>
                        <Input
                          type="datetime-local"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          onFocus={handleFocus}
                          className="h-12 rounded-xl border-emerald-200 bg-white text-base"
                        />
                      </div>
                      <Button
                        className="w-full h-14 md:h-12 rounded-xl font-bold text-base bg-emerald-600 hover:bg-emerald-700 text-white"
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
                        className="w-full h-14 md:h-12 rounded-xl font-bold text-base bg-indigo-600 hover:bg-indigo-700 text-white"
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border-slate-200/60 shadow-sm">
          <CardContent className="p-4 sm:p-6 flex flex-col justify-center h-full">
            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
              Recebido
            </p>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
              {formatBRL(summary.recebido)}
            </h3>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/60 shadow-sm">
          <CardContent className="p-4 sm:p-6 flex flex-col justify-center h-full">
            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
              A Receber
            </p>
            <h3 className="text-xl sm:text-3xl font-black text-amber-600 tracking-tight truncate">
              {formatBRL(summary.a_receber)}
            </h3>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200/60 shadow-sm hidden md:flex flex-col justify-center">
          <CardContent className="p-6 h-full">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
              Despesas
            </p>
            <h3 className="text-3xl font-black text-red-600 tracking-tight truncate">
              {formatBRL(summary.despesas)}
            </h3>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-800 shadow-sm bg-slate-900 hidden md:flex flex-col justify-center">
          <CardContent className="p-6 h-full">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
              Saldo Atual
            </p>
            <h3 className="text-3xl font-black text-white tracking-tight truncate">
              {formatBRL(summary.recebido - summary.despesas)}
            </h3>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/60 overflow-hidden">
        <Tabs defaultValue="transactions" className="w-full">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
            <TabsList className="bg-slate-200/50 p-1.5 rounded-xl h-auto w-full sm:w-auto grid grid-cols-2">
              <TabsTrigger
                value="transactions"
                className="rounded-lg font-bold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
              >
                Histórico
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-lg font-bold px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm relative"
              >
                Inadimplentes
                {pendingFinances.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                    {pendingFinances.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-72 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar paciente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-11 md:h-10 rounded-xl bg-white border-slate-200 text-base md:text-sm"
                />
              </div>
              {isMobile && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 rounded-xl shrink-0 bg-white"
                >
                  <Filter className="w-5 h-5 text-slate-600" />
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="transactions" className="m-0">
            {filteredFinances.length === 0 ? (
              <div className="text-center py-20 text-slate-500">Nenhuma transação encontrada.</div>
            ) : isMobile ? (
              // Mobile View: Cards
              <div className="divide-y divide-slate-100">
                {filteredFinances.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white flex justify-between items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 truncate">
                          {item.pacientes?.nome || 'N/A'}
                        </span>
                        {item.status === 'recebido' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {String(item.mes).padStart(2, '0')}/{item.ano}
                        </span>
                        {getMethodBadge(item.metodo_pagamento)}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(item.data_atualizacao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          'font-black text-lg tracking-tight',
                          item.status === 'recebido' ? 'text-emerald-600' : 'text-amber-600',
                        )}
                      >
                        {formatBRL(item.valor_recebido || item.valor_a_receber)}
                      </p>
                      {item.status !== 'recebido' && (
                        <p className="text-[10px] text-amber-600 font-bold uppercase mt-1">
                          Pendente
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop View: Table
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-100">
                      <TableHead className="font-bold text-slate-700 py-4 px-6">Data</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4">Paciente</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4">Referência</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4">Método</TableHead>
                      <TableHead className="font-bold text-slate-700 py-4 text-right">
                        Valor
                      </TableHead>
                      <TableHead className="font-bold text-slate-700 py-4 text-center px-6">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFinances.map((item) => (
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
                        <TableCell className="font-black text-right py-4">
                          {item.status === 'recebido' ? (
                            <span className="text-emerald-600">
                              {formatBRL(item.valor_recebido)}
                            </span>
                          ) : (
                            <span className="text-amber-600">
                              {formatBRL(item.valor_a_receber)}
                            </span>
                          )}
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
            {pendingFinances.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Tudo em dia!</h4>
                <p className="text-slate-500 mt-1">Nenhuma fatura em aberto encontrada.</p>
              </div>
            ) : isMobile ? (
              // Mobile View: Cards
              <div className="divide-y divide-slate-100">
                {pendingFinances.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white flex justify-between items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.pacientes?.nome}</p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Ref: {String(item.mes).padStart(2, '0')}/{item.ano}
                      </p>
                      <p className="font-black text-amber-600 mt-1 text-lg">
                        {formatBRL(item.valor_a_receber)}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <WhatsAppBillingDialog
                        pacienteId={item.paciente_id}
                        patientName={item.pacientes?.nome || ''}
                        onSuccess={fetchData}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop View: Table
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
                    {pendingFinances.map((item) => (
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
