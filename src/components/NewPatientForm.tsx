import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { maskCPF, maskPhone, maskCEP, fetchAddressByCEP } from '@/lib/utils'
import { Crown, Loader2, MapPin } from 'lucide-react'
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
    .transform((v) => (v ? Number(v) : null)),
  frequencia_pagamento: z.string().default('sessão'),
  dia_pagamento: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null)),
  convenio_id: z.string().optional(),
  numero_carteira: z.string().optional(),
  consentimento_lgpd: z.boolean().default(false),
})

export default function NewPatientForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchingCep, setFetchingCep] = useState(false)
  const [convenios, setConvenios] = useState<any[]>([])

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

  return (
    <>
      <Card className="shadow-sm rounded-[2rem] border-slate-100 overflow-hidden">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="João da Silva"
                            {...field}
                            className="bg-slate-50/50 rounded-xl h-11"
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
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-slate-50/50 rounded-xl h-11"
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
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            {...field}
                            onChange={(e) => field.onChange(maskCPF(e.target.value))}
                            className="bg-slate-50/50 rounded-xl h-11"
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
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            {...field}
                            onChange={(e) => field.onChange(maskPhone(e.target.value))}
                            className="bg-slate-50/50 rounded-xl h-11"
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
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="joao@email.com"
                            type="email"
                            {...field}
                            className="bg-slate-50/50 rounded-xl h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Endereço Completo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              placeholder="00000-000"
                              {...field}
                              onChange={(e) => handleCepChange(e, field)}
                              className="bg-white rounded-xl h-11 pr-10"
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
                          <FormLabel>Rua / Logradouro</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white rounded-xl h-11" />
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
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white rounded-xl h-11" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-white rounded-xl h-11" />
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
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white rounded-xl h-11" />
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
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white rounded-xl h-11" />
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
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-white rounded-xl h-11" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Contato de Emergência */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
                  Contato de Emergência
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-amber-50/30 rounded-2xl border border-amber-100">
                  <FormField
                    control={form.control}
                    name="contato_emergencia_nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-amber-900">Nome do Contato *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Maria da Silva"
                            {...field}
                            className="bg-white rounded-xl h-11"
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
                        <FormLabel className="text-amber-900">Telefone do Contato *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            {...field}
                            onChange={(e) => field.onChange(maskPhone(e.target.value))}
                            className="bg-white rounded-xl h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Pagamento e Convênio */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
                  Pagamento e Convênio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                  <FormField
                    control={form.control}
                    name="valor_sessao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Base Sessão (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            value={field.value || ''}
                            className="bg-white rounded-xl h-11"
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
                        <FormLabel>Frequência</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white rounded-xl h-11">
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
                        <FormLabel>Dia de Vencimento</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="Ex: 5"
                            {...field}
                            value={field.value || ''}
                            className="bg-white rounded-xl h-11"
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
                            <FormLabel>Convênio</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || 'none'}>
                              <FormControl>
                                <SelectTrigger className="bg-white rounded-xl h-11">
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
                            <FormLabel>Nº da Carteirinha</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Código do paciente"
                                {...field}
                                value={field.value || ''}
                                className="bg-white rounded-xl h-11"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Consentimento */}
              <div className="pt-2">
                <FormField
                  control={form.control}
                  name="consentimento_lgpd"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border p-5 bg-slate-50 shadow-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1 rounded-md"
                        />
                      </FormControl>
                      <div className="space-y-1.5 leading-none">
                        <FormLabel className="text-slate-800 font-semibold text-base">
                          Consentimento de Tratamento de Dados (LGPD)
                        </FormLabel>
                        <FormDescription className="text-slate-500 text-sm leading-relaxed">
                          Confirmo que o paciente autorizou expressamente o tratamento de seus dados
                          pessoais sensíveis em conformidade com a Lei Geral de Proteção de Dados,
                          para fins de saúde e gestão clínica.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-10 rounded-xl gap-2 h-12 text-base"
                >
                  {loading && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {loading ? 'Salvando...' : 'Salvar Paciente'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Limite Atingido</DialogTitle>
            <DialogDesc className="text-base mt-2">
              Limite de {planLimits.plan === 'gratuito' ? 5 : 15} pacientes atingido. Faça upgrade
              para o plano {planLimits.plan === 'gratuito' ? 'Básico' : 'Pro'}.
            </DialogDesc>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center justify-center text-center gap-4 bg-indigo-50 rounded-2xl border border-indigo-100 mt-2">
            <div className="p-4 bg-indigo-100 rounded-full">
              <Crown className="w-10 h-10 text-indigo-500" />
            </div>
            <p className="text-slate-700 font-medium px-4">
              Desbloqueie mais recursos e continue crescendo o seu consultório sem interrupções!
            </p>
          </div>
          <DialogFooter className="mt-4 gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
              className="rounded-xl h-12"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => navigate('/planos')}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-6"
            >
              Fazer Upgrade Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
