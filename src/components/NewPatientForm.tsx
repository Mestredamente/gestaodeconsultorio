import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { maskCPF, maskPhone, maskCEP, fetchAddressByCEP, cn } from '@/lib/utils'
import { Crown, Loader2, MapPin, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription as DialogDesc,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useIsMobile } from '@/hooks/use-mobile'

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  data_nascimento: z.string().optional(),
  cpf: z
    .string()
    .refine((v) => !v || v.replace(/\D/g, '').length === 11, 'CPF deve ter 11 dígitos')
    .optional(),
  telefone: z.string().optional(),
  email: z
    .string()
    .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'E-mail inválido')
    .optional(),
  cep: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  contato_emergencia_nome: z.string().min(1, 'Nome do contato é obrigatório'),
  contato_emergencia_telefone: z.string().min(1, 'Telefone de emergência é obrigatório'),
  valor_sessao: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v.replace(',', '.')) : null)),
  frequencia_pagamento: z.string().default('sessão'),
  dia_pagamento: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null)),
  convenio_id: z.string().optional(),
  numero_carteira: z.string().optional(),
  consentimento_lgpd: z.boolean().default(false),
})

const STEPS = [
  { id: 'pessoal', label: 'Dados Pessoais' },
  { id: 'endereco', label: 'Endereço' },
  { id: 'emergencia', label: 'Emergência' },
  { id: 'pagamento', label: 'Financeiro' },
]

export default function NewPatientForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(false)
  const [fetchingCep, setFetchingCep] = useState(false)
  const [convenios, setConvenios] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  const topRef = useRef<HTMLDivElement>(null)

  const [planLimits, setPlanLimits] = useState({ plan: 'gratuito', count: 0 })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (user) {
      supabase
        .from('convenios' as any)
        .select('*')
        .eq('usuario_id', user.id)
        .then(({ data }) => {
          if (data) setConvenios(data)
        })

      Promise.all([
        supabase.from('usuarios').select('plano').eq('id', user.id).single(),
        supabase.from('pacientes').select('id', { count: 'exact' }).eq('usuario_id', user.id),
      ]).then(([userRes, patRes]) => {
        setPlanLimits({
          plan: userRes.data?.plano || 'gratuito',
          count: patRes.count || 0,
        })
      })
    }
  }, [user])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      data_nascimento: '',
      cpf: '',
      telefone: '',
      email: '',
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      contato_emergencia_nome: '',
      contato_emergencia_telefone: '',
      valor_sessao: '' as any,
      frequencia_pagamento: 'sessão',
      dia_pagamento: '' as any,
      convenio_id: 'none',
      numero_carteira: '',
      consentimento_lgpd: false,
    },
    mode: 'onTouched',
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return

    const { plan, count } = planLimits
    if ((plan === 'gratuito' && count >= 5) || (plan === 'basico' && count >= 15)) {
      setShowUpgradeModal(true)
      return
    }

    setLoading(true)
    try {
      const payload = {
        usuario_id: user.id,
        nome: values.nome,
        data_nascimento: values.data_nascimento || null,
        cpf: values.cpf || null,
        telefone: values.telefone || null,
        email: values.email || null,
        cep: values.cep || null,
        rua: values.rua || null,
        numero: values.numero || null,
        complemento: values.complemento || null,
        bairro: values.bairro || null,
        cidade: values.cidade || null,
        estado: values.estado || null,
        endereco: values.rua
          ? `${values.rua}, ${values.numero || 'S/N'} - ${values.bairro}, ${values.cidade}/${values.estado}`
          : null,
        contato_emergencia_nome: values.contato_emergencia_nome || null,
        contato_emergencia_telefone: values.contato_emergencia_telefone || null,
        valor_sessao: values.valor_sessao,
        frequencia_pagamento: values.frequencia_pagamento,
        dia_pagamento: values.dia_pagamento,
        convenio_id: values.convenio_id === 'none' ? null : values.convenio_id,
        numero_carteira: values.numero_carteira || null,
        consentimento_lgpd: values.consentimento_lgpd,
        data_consentimento_lgpd: values.consentimento_lgpd ? new Date().toISOString() : null,
      }
      const { error } = await supabase.from('pacientes').insert(payload as any)
      if (error) throw error

      toast({ title: 'Paciente cadastrado com sucesso!' })
      form.reset()
      setPlanLimits((prev) => ({ ...prev, count: prev.count + 1 }))
      navigate('/pacientes')
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const masked = maskCEP(e.target.value)
    field.onChange(masked)

    if (masked.length === 9) {
      setFetchingCep(true)
      try {
        const address = await fetchAddressByCEP(masked)
        if (address) {
          form.setValue('rua', address.rua)
          form.setValue('bairro', address.bairro)
          form.setValue('cidade', address.cidade)
          form.setValue('estado', address.estado)
          toast({ title: 'Endereço encontrado!' })
        } else {
          toast({ title: 'CEP não encontrado', variant: 'destructive' })
        }
      } catch (err) {
        toast({ title: 'Erro ao buscar CEP', variant: 'destructive' })
      } finally {
        setFetchingCep(false)
      }
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: any[] = []
    if (currentStep === 0) fieldsToValidate = ['nome', 'email', 'telefone']
    if (currentStep === 2)
      fieldsToValidate = ['contato_emergencia_nome', 'contato_emergencia_telefone']

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
      if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
    if (topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isMobile) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }

  return (
    <div ref={topRef}>
      {isMobile && (
        <div className="mb-6 flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors z-10',
                  index <= currentStep ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500',
                  index === currentStep && 'ring-4 ring-primary/20',
                )}
              >
                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <div
                className={cn(
                  'text-[10px] mt-1.5 font-semibold text-center whitespace-nowrap',
                  index <= currentStep ? 'text-slate-800' : 'text-slate-400',
                )}
              >
                {step.label}
              </div>
            </div>
          ))}
          {/* Connecting lines */}
          <div className="absolute top-4 left-6 right-6 h-[2px] bg-slate-200 -z-10 hidden sm:block">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      <Card className="shadow-sm rounded-[2rem] border-slate-100 overflow-hidden">
        <CardContent className="p-4 sm:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              {/* Step 1: Pessoal */}
              <div className={cn('space-y-4', isMobile && currentStep !== 0 && 'hidden')}>
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-sm">Nome Completo *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="João da Silva"
                            {...field}
                            onFocus={handleFocus}
                            className="bg-slate-50/50 rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                            autoCapitalize="words"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="data_nascimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-sm">Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            onFocus={handleFocus}
                            className="bg-slate-50/50 rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-sm">CPF</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            inputMode="numeric"
                            {...field}
                            onChange={(e) => field.onChange(maskCPF(e.target.value))}
                            onFocus={handleFocus}
                            className="bg-slate-50/50 rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-sm">Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            inputMode="tel"
                            {...field}
                            onChange={(e) => field.onChange(maskPhone(e.target.value))}
                            onFocus={handleFocus}
                            className="bg-slate-50/50 rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-base sm:text-sm">E-mail</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="joao@email.com"
                            type="email"
                            inputMode="email"
                            {...field}
                            onFocus={handleFocus}
                            className="bg-slate-50/50 rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                            autoCapitalize="none"
                            autoCorrect="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Step 2: Endereço */}
              <div className={cn('space-y-4', isMobile && currentStep !== 1 && 'hidden')}>
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Endereço Completo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 sm:p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-sm">CEP</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              placeholder="00000-000"
                              inputMode="numeric"
                              {...field}
                              onChange={(e) => handleCepChange(e, field)}
                              onFocus={handleFocus}
                              className="bg-white rounded-xl h-12 sm:h-11 pr-10 text-base sm:text-sm"
                            />
                          </FormControl>
                          {fetchingCep && (
                            <Loader2 className="absolute right-3 top-3 w-5 h-5 text-slate-400 animate-spin" />
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name="rua"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base sm:text-sm">Rua / Logradouro</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onFocus={handleFocus}
                              className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-sm">Número</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onFocus={handleFocus}
                            className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-sm">Complemento</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onFocus={handleFocus}
                            className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base sm:text-sm">Bairro</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onFocus={handleFocus}
                              className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base sm:text-sm">Cidade</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onFocus={handleFocus}
                              className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base sm:text-sm">Estado</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onFocus={handleFocus}
                              className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Emergência */}
              <div className={cn('space-y-4', isMobile && currentStep !== 2 && 'hidden')}>
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2">
                  Contato de Emergência
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 sm:p-5 bg-amber-50/30 rounded-2xl border border-amber-100">
                  <FormField
                    control={form.control}
                    name="contato_emergencia_nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-amber-900 text-base sm:text-sm">
                          Nome do Contato *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Maria da Silva"
                            {...field}
                            onFocus={handleFocus}
                            className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                            autoCapitalize="words"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contato_emergencia_telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-amber-900 text-base sm:text-sm">
                          Telefone do Contato *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            inputMode="tel"
                            {...field}
                            onChange={(e) => field.onChange(maskPhone(e.target.value))}
                            onFocus={handleFocus}
                            className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Step 4: Pagamento */}
              <div className={cn('space-y-4', isMobile && currentStep !== 3 && 'hidden')}>
                <h3 className="text-xl font-bold text-slate-800 border-b pb-2">
                  Pagamento e Convênio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 sm:p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                  <FormField
                    control={form.control}
                    name="valor_sessao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-sm">
                          Valor Base Sessão (R$)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            inputMode="decimal"
                            {...field}
                            value={field.value || ''}
                            onFocus={handleFocus}
                            placeholder="150,00"
                            className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="frequencia_pagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-sm">Frequência</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="sessão">Por Sessão</SelectItem>
                            <SelectItem value="quinzenal">Quinzenal</SelectItem>
                            <SelectItem value="mensal">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dia_pagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base sm:text-sm">Dia de Vencimento</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min="1"
                            max="31"
                            placeholder="Ex: 5"
                            {...field}
                            value={field.value || ''}
                            onFocus={handleFocus}
                            className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {convenios.length > 0 && (
                    <>
                      <FormField
                        control={form.control}
                        name="convenio_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base sm:text-sm">Convênio</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || 'none'}>
                              <FormControl>
                                <SelectTrigger className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm">
                                  <SelectValue placeholder="Opcional" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="none">Nenhum / Particular</SelectItem>
                                {convenios.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="numero_carteira"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base sm:text-sm">
                              Nº da Carteirinha
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Código do paciente"
                                {...field}
                                value={field.value || ''}
                                onFocus={handleFocus}
                                className="bg-white rounded-xl h-12 sm:h-11 text-base sm:text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                <div className="pt-2">
                  <FormField
                    control={form.control}
                    name="consentimento_lgpd"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-2xl border p-5 bg-slate-50 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1 w-6 h-6 sm:w-5 sm:h-5 rounded-md"
                          />
                        </FormControl>
                        <div className="space-y-1.5 leading-none">
                          <FormLabel className="text-slate-800 font-bold text-base">
                            Consentimento LGPD
                          </FormLabel>
                          <FormDescription className="text-slate-500 text-sm leading-relaxed">
                            Confirmo autorização expressa para tratamento de dados sensíveis para
                            fins de saúde e gestão clínica.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center gap-4 pt-6 border-t border-slate-100">
                {isMobile ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className={cn(
                        'flex-1 h-14 rounded-xl text-base',
                        currentStep === 0 && 'invisible',
                      )}
                    >
                      <ChevronLeft className="w-5 h-5 mr-1" /> Anterior
                    </Button>

                    {currentStep < STEPS.length - 1 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 h-14 rounded-xl text-base font-bold bg-slate-900 text-white hover:bg-slate-800"
                      >
                        Próximo <ChevronRight className="w-5 h-5 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 h-14 rounded-xl text-base font-bold gap-2"
                      >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Salvando...' : 'Salvar'}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="w-full flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="px-10 h-12 rounded-xl text-base font-bold gap-2"
                    >
                      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                      {loading ? 'Salvando...' : 'Salvar Paciente'}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        {/* Upgrade Modal Content */}
      </Dialog>
    </div>
  )
}
