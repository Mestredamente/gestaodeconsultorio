import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { CreditCard, AlertTriangle } from 'lucide-react'
import { cn, formatBRL } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface BillingSettingsProps {
  user: any
  formData: any
  setFormData: any
}

export function BillingSettings({ user, formData, setFormData }: BillingSettingsProps) {
  const { toast } = useToast()
  const [patientCount, setPatientCount] = useState(0)
  const [faturas, setFaturas] = useState<any[]>([])
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { count } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
      setPatientCount(count || 0)
      const { data } = await supabase
        .from('faturas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data_vencimento', { ascending: false })
        .limit(12)
      setFaturas(data || [])
    }
    fetchData()
  }, [user.id])

  const getPlanLimit = (plano: string) => {
    if (plano === 'pro') return 'Ilimitado'
    if (plano === 'basico') return 15
    return 5
  }
  const planLimit = getPlanLimit(formData.plano || 'gratuito')

  const handleUpgrade = async (planId: string) => {
    setUpgradingTo(planId)
    try {
      const return_url = `${window.location.origin}/configuracoes?upgrade_success=true`
      const { data, error } = await supabase.functions.invoke('criar_checkout_stripe', {
        body: { plan: planId, return_url },
      })
      if (error) throw error
      if (data?.url) window.location.href = data.url
      else {
        toast({ title: 'Redirecionando...' })
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
      setUpgradingTo(null)
    }
  }

  const handleCancelSubscription = async () => {
    setCanceling(true)
    const { error } = await supabase
      .from('usuarios')
      .update({ plano: 'gratuito', data_proxima_cobranca: null, stripe_subscription_id: null })
      .eq('id', user.id)
    setCanceling(false)
    if (!error) {
      toast({ title: 'Assinatura cancelada com sucesso.' })
      setShowCancelModal(false)
      setFormData((prev: any) => ({ ...prev, plano: 'gratuito', data_proxima_cobranca: null }))
    } else {
      toast({ title: 'Erro ao cancelar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-[2rem] shadow-sm border-slate-100 lg:col-span-2">
          <CardHeader className="p-8 pb-4 border-b border-slate-50">
            <CardTitle className="text-xl">Resumo da Assinatura</CardTitle>
            <CardDescription>Acompanhe os detalhes do seu plano atual e limites.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Plano Atual
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-slate-800 capitalize">
                    {formData.plano || 'Gratuito'}
                  </span>
                  {(formData.plano === 'basico' || formData.plano === 'pro') && (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                      Ativo
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-1 md:text-right">
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Próxima Cobrança
                </h4>
                <p className="text-lg font-semibold text-slate-700">
                  {formData.data_proxima_cobranca
                    ? new Date(formData.data_proxima_cobranca).toLocaleDateString('pt-BR')
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-700">Pacientes Cadastrados</span>
                <span className="text-sm font-medium text-slate-500">
                  {patientCount} de {planLimit}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={cn(
                    'h-2.5 rounded-full transition-all duration-500',
                    planLimit === 'Ilimitado'
                      ? 'bg-primary w-full'
                      : patientCount / (planLimit as number) > 0.9
                        ? 'bg-rose-500'
                        : 'bg-primary',
                  )}
                  style={{
                    width:
                      planLimit === 'Ilimitado'
                        ? '100%'
                        : `${Math.min((patientCount / (planLimit as number)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <Button onClick={() => setShowUpgradeModal(true)} className="rounded-xl px-8">
                Fazer Upgrade
              </Button>
              {(formData.plano === 'basico' || formData.plano === 'pro') && (
                <Button
                  variant="outline"
                  className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancelar Assinatura
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] shadow-sm border-slate-100 flex flex-col">
          <CardHeader className="p-8 pb-4 border-b border-slate-50">
            <CardTitle className="text-xl">Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-6 flex-1 flex flex-col justify-center">
            {formData.plano === 'basico' || formData.plano === 'pro' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                    <CreditCard className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">
                      {formData.cartao_bandeira ? formData.cartao_bandeira.toUpperCase() : 'Cartão'}{' '}
                      final {formData.cartao_final || '****'}
                    </p>
                    <p className="text-xs text-slate-500">Forma de pagamento padrão</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => toast({ title: 'Redirecionando para portal seguro...' })}
                >
                  Atualizar Cartão
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-700">Nenhum cartão</p>
                  <p className="text-sm text-slate-500">Você está no plano gratuito.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] shadow-sm border-slate-100">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl">Histórico de Faturas</CardTitle>
          <CardDescription>Suas cobranças dos últimos 12 meses.</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-0">
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-slate-50/80">
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold">Plano</TableHead>
                  <TableHead className="font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faturas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500 h-24">
                      Nenhuma fatura encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  faturas.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium text-slate-700">
                        {new Date(f.data_vencimento).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="capitalize text-slate-600">{f.plano}</TableCell>
                      <TableCell className="text-slate-700">{formatBRL(f.valor)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-semibold border-0',
                            f.status === 'pago'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700',
                          )}
                        >
                          {f.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-3xl rounded-[2rem] p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl">Escolha o plano ideal</DialogTitle>
            <DialogDescription className="text-base">
              Faça upgrade para acessar novas funcionalidades.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-blue-500 bg-blue-50/30 rounded-2xl p-6 relative">
              <div className="absolute -top-3 -right-2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                Mais Popular
              </div>
              <h3 className="text-xl font-bold text-blue-700 mb-2">Básico</h3>
              <p className="text-3xl font-extrabold text-blue-900 mb-4">
                R$ 39,90<span className="text-sm font-medium text-slate-500">/mês</span>
              </p>
              <ul className="space-y-2 mb-6 text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2">✓ Até 15 pacientes</li>
                <li className="flex items-center gap-2">✓ Lembretes WhatsApp</li>
                <li className="flex items-center gap-2">✓ Portal do Paciente</li>
              </ul>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                disabled={upgradingTo === 'basico' || formData.plano === 'basico'}
                onClick={() => handleUpgrade('basico')}
              >
                {upgradingTo === 'basico'
                  ? 'Processando...'
                  : formData.plano === 'basico'
                    ? 'Plano Atual'
                    : 'Selecionar Básico'}
              </Button>
            </div>
            <div className="border-2 border-purple-200 bg-purple-50/30 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-purple-700 mb-2">Pro</h3>
              <p className="text-3xl font-extrabold text-purple-900 mb-4">
                R$ 79,00<span className="text-sm font-medium text-slate-500">/mês</span>
              </p>
              <ul className="space-y-2 mb-6 text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2">✓ Pacientes Ilimitados</li>
                <li className="flex items-center gap-2">✓ Todas as funcionalidades</li>
                <li className="flex items-center gap-2">✓ Telemedicina Integrada</li>
              </ul>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                disabled={upgradingTo === 'pro' || formData.plano === 'pro'}
                onClick={() => handleUpgrade('pro')}
              >
                {upgradingTo === 'pro'
                  ? 'Processando...'
                  : formData.plano === 'pro'
                    ? 'Plano Atual'
                    : 'Selecionar Pro'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-xl text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Cancelar Assinatura
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Tem certeza que deseja cancelar sua assinatura? O seu limite será reduzido para 5
              pacientes e você perderá acesso às funcionalidades premium.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setShowCancelModal(false)}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleCancelSubscription}
              disabled={canceling}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
