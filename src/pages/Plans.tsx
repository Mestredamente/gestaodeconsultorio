import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2, Star } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

const PLANS_DATA = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    price: '0,00',
    patients: 'Até 5 pacientes',
    badge: null,
    style: 'border-emerald-200 bg-emerald-50/30',
    titleColor: 'text-emerald-700',
    priceColor: 'text-emerald-900',
    buttonClass: 'bg-emerald-600 text-white hover:bg-emerald-700',
    features: [
      { name: 'Agendamento Básico', inc: true },
      { name: 'Prontuário Digital', inc: true },
      { name: 'Financeiro Simples', inc: true },
      { name: 'Lembretes WhatsApp', inc: false },
      { name: 'Portal do Paciente', inc: false },
      { name: 'Sessão Online Integrada', inc: false },
    ],
  },
  {
    id: 'basico',
    name: 'Básico',
    price: '39,90',
    patients: 'Até 15 pacientes',
    badge: 'Mais Popular',
    style: 'border-blue-500 ring-2 ring-blue-500 shadow-xl relative scale-105 z-10 bg-white',
    titleColor: 'text-blue-600',
    priceColor: 'text-blue-600',
    buttonClass: 'bg-blue-600 text-white hover:bg-blue-700',
    features: [
      { name: 'Agendamento Básico', inc: true },
      { name: 'Prontuário Digital', inc: true },
      { name: 'Financeiro Completo', inc: true },
      { name: 'Lembretes WhatsApp', inc: true },
      { name: 'Portal do Paciente', inc: true },
      { name: 'Sessão Online Integrada', inc: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '79,00',
    patients: 'Pacientes Ilimitados',
    badge: 'Premium',
    style: 'border-violet-200 bg-violet-50/30',
    titleColor: 'text-violet-700',
    priceColor: 'text-violet-700',
    buttonClass: 'bg-violet-600 text-white hover:bg-violet-700',
    features: [
      { name: 'Agendamento Básico', inc: true },
      { name: 'Prontuário Digital', inc: true },
      { name: 'Financeiro Completo', inc: true },
      { name: 'Lembretes WhatsApp', inc: true },
      { name: 'Portal do Paciente', inc: true },
      { name: 'Sessão Online Integrada', inc: true },
    ],
  },
]

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
        await supabase.from('usuarios').update({ plano: plan }).eq('id', user?.id)
        setCurrentPlan(plan)
        toast({
          title: 'Assinatura confirmada!',
          description: `Bem-vindo ao plano ${plan.toUpperCase()}!`,
        })
        navigate('/', { replace: true })
      }
    }
    checkSuccess()
  }, [searchParams, navigate, toast, user?.id])

  const handleSelect = async (planId: string) => {
    localStorage.setItem('selected_plan', planId)

    if (planId === 'gratuito') {
      setLoadingPlan(planId)
      if (user) {
        const { error } = await supabase
          .from('subscriptions')
          .upsert(
            { user_id: user.id, plan_id: planId, status: 'active' },
            { onConflict: 'user_id' },
          )

        await supabase.from('usuarios').update({ plano: planId }).eq('id', user.id)

        toast({ title: 'Plano Gratuito confirmado!', description: 'Seu acesso foi configurado.' })
        navigate('/')
      }
      setLoadingPlan(null)
      return
    }

    setLoadingPlan(planId)
    try {
      const return_url = `${window.location.origin}/planos?success=true&plan=${planId}`
      const { data, error } = await supabase.functions.invoke('processar_pagamento', {
        body: { plano_id: planId, metodo_pagamento: 'cartao', gateway: 'stripe', return_url },
      })
      if (error) throw error
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast({ title: 'Redirecionando para pagamento...' })
        setTimeout(() => {
          navigate(`/planos?success=true&plan=${planId}`, { replace: true })
        }, 1500)
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao processar pagamento',
        description: err.message,
        variant: 'destructive',
      })
      setLoadingPlan(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12 pt-8 px-4">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Seleção de Plano</h1>
        <p className="text-lg text-slate-500">
          Escolha o pacote ideal para escalar o seu consultório. Cancele quando quiser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center mt-12">
        {PLANS_DATA.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'flex flex-col h-full rounded-[2rem] transition-all duration-300',
              plan.style,
              currentPlan === plan.id && 'ring-4 ring-offset-2 ring-primary border-primary',
            )}
          >
            {plan.badge && (
              <div className="absolute -top-4 inset-x-0 flex justify-center">
                <span
                  className={cn(
                    'text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md',
                    plan.id === 'pro' ? 'bg-violet-600' : 'bg-blue-600',
                  )}
                >
                  <Star className="w-3.5 h-3.5 fill-current" /> {plan.badge}
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-2 pt-8">
              <CardTitle className={cn('text-2xl font-bold', plan.titleColor)}>
                {plan.name}
              </CardTitle>
              <div className="mt-4 flex items-baseline justify-center">
                <span className="text-sm font-medium text-slate-500 mr-1">R$</span>
                <span className={cn('text-5xl font-extrabold tracking-tight', plan.priceColor)}>
                  {plan.price}
                </span>
                <span className="ml-1 text-sm font-medium text-slate-500">/mês</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 mt-6 px-6 sm:px-8">
              <div className="font-bold text-slate-800 mb-6 text-center border-b border-slate-200/50 pb-4">
                {plan.patients}
              </div>
              <ul className="space-y-4 text-sm font-medium">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className={cn(
                      'flex gap-3 items-center',
                      f.inc ? 'text-slate-700' : 'text-slate-400',
                    )}
                  >
                    {f.inc ? (
                      <div className="bg-emerald-100 rounded-full p-1 shrink-0">
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="bg-slate-100 rounded-full p-1 shrink-0">
                        <X className="w-3.5 h-3.5 text-slate-400 stroke-[3]" />
                      </div>
                    )}
                    {f.name}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="p-6 sm:p-8 pt-0">
              <Button
                className={cn(
                  'w-full h-12 text-base font-bold rounded-xl shadow-sm transition-all',
                  plan.buttonClass,
                )}
                onClick={() => handleSelect(plan.id)}
                disabled={loadingPlan !== null || currentPlan === plan.id}
              >
                {loadingPlan === plan.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : currentPlan === plan.id ? (
                  'Plano Atual'
                ) : (
                  'Selecionar'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
