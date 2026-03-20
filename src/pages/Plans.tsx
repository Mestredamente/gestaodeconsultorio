import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Loader2, Sparkles, Building2 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Plans() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState('gratuito')

  useEffect(() => {
    if (user) {
      supabase
        .from('usuarios')
        .select('plano')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.plano) setCurrentPlan(data.plano)
        })
    }
  }, [user])

  useEffect(() => {
    const checkSuccess = async () => {
      const success = searchParams.get('success')
      const plan = searchParams.get('plan')
      if (success === 'true' && plan) {
        await supabase.rpc('confirm_plan_upgrade', { p_plano: plan })
        setCurrentPlan(plan)
        toast({
          title: 'Assinatura confirmada!',
          description: `Bem-vindo ao plano ${plan.toUpperCase()}!`,
        })
        navigate('/planos', { replace: true })
      }
    }
    checkSuccess()
  }, [searchParams, navigate, toast])

  const handleSubscribe = async (plan: string) => {
    if (plan === 'gratuito') return
    setLoadingPlan(plan)
    try {
      const return_url = `${window.location.origin}/planos`
      const { data, error } = await supabase.functions.invoke('criar_assinatura', {
        body: { plan, return_url },
      })
      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      toast({ title: 'Erro ao processar', description: err.message, variant: 'destructive' })
      setLoadingPlan(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10 pt-4">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Escolha o melhor plano para o seu consultório
        </h1>
        <p className="text-lg text-slate-500">
          Escale seus atendimentos com recursos avançados. Cancele quando quiser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Plano Gratuito */}
        <Card
          className={cn(
            'relative flex flex-col shadow-sm border-slate-200',
            currentPlan === 'gratuito' && 'border-slate-400 ring-1 ring-slate-400',
          )}
        >
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-500" /> Gratuito
            </CardTitle>
            <CardDescription>Para quem está começando</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold">
              R$0
              <span className="ml-1 text-sm font-medium text-slate-500">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Até 5 pacientes
              </li>
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Agendamento Básico
              </li>
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Prontuário Digital
              </li>
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Financeiro Simples
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" disabled>
              {currentPlan === 'gratuito' ? 'Plano Atual' : 'Gratuito'}
            </Button>
          </CardFooter>
        </Card>

        {/* Plano Básico */}
        <Card
          className={cn(
            'relative flex flex-col shadow-lg border-primary/50',
            currentPlan === 'basico' && 'border-primary ring-2 ring-primary',
          )}
        >
          {currentPlan !== 'basico' && (
            <div className="absolute -top-3 inset-x-0 flex justify-center">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Mais Popular
              </span>
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Básico
            </CardTitle>
            <CardDescription>Para consultórios em crescimento</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-primary">
              R$39
              <span className="ml-1 text-sm font-medium text-slate-500">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-primary shrink-0" /> <b>Até 15 pacientes</b>
              </li>
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-primary shrink-0" /> Lembretes via WhatsApp
              </li>
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-primary shrink-0" /> Portal do Paciente
              </li>
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-primary shrink-0" /> Todos os recursos do Gratuito
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={currentPlan === 'basico' ? 'outline' : 'default'}
              disabled={currentPlan === 'basico' || loadingPlan !== null}
              onClick={() => handleSubscribe('basico')}
            >
              {loadingPlan === 'basico' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentPlan === 'basico' ? (
                'Plano Atual'
              ) : (
                'Assinar Básico'
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Plano Pro */}
        <Card
          className={cn(
            'relative flex flex-col shadow-sm border-amber-200 bg-amber-50/10',
            currentPlan === 'pro' && 'border-amber-400 ring-2 ring-amber-400',
          )}
        >
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-amber-700">
              <Crown className="w-5 h-5" /> Pro
            </CardTitle>
            <CardDescription>Para profissionais consolidados</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold text-amber-700">
              R$69
              <span className="ml-1 text-sm font-medium text-slate-500">/mês</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-amber-500 shrink-0" /> <b>Pacientes Ilimitados</b>
              </li>
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-amber-500 shrink-0" /> Telemedicina Integrada
              </li>
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-amber-500 shrink-0" /> Testes Psicológicos Digitais
              </li>
              <li className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-amber-500 shrink-0" /> Todos os recursos do Básico
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              variant={currentPlan === 'pro' ? 'outline' : 'default'}
              disabled={currentPlan === 'pro' || loadingPlan !== null}
              onClick={() => handleSubscribe('pro')}
            >
              {loadingPlan === 'pro' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : currentPlan === 'pro' ? (
                'Plano Atual'
              ) : (
                'Assinar Pro'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
