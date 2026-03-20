import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { maskCPF, maskPhone, maskCEP, fetchAddressByCEP } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  data_nascimento: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')).nullable(),
  cep: z.string().optional().nullable(),
  rua: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  contato_emergencia_nome: z.string().optional().nullable(),
  contato_emergencia_telefone: z.string().optional().nullable(),
  valor_sessao: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? Number(v) : null)),
  frequencia_pagamento: z.string().default('sessão'),
  dia_pagamento: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? Number(v) : null)),
  convenio_id: z.string().optional().nullable(),
  numero_carteira: z.string().optional().nullable(),
  consentimento_lgpd: z.boolean().default(false),
})

export default function PatientEditForm({ patient, onSuccess, onCancel }: any) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [convenios, setConvenios] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      supabase
        .from('convenios' as any)
        .select('*')
        .eq('usuario_id', user.id)
        .then(({ data }) => {
          if (data) setConvenios(data)
        })
    }
  }, [user])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: patient?.nome || '',
      data_nascimento: patient?.data_nascimento || '',
      cpf: patient?.cpf || '',
      telefone: patient?.telefone || '',
      email: patient?.email || '',
      cep: patient?.cep || '',
      rua: patient?.rua || '',
      numero: patient?.numero || '',
      complemento: patient?.complemento || '',
      bairro: patient?.bairro || '',
      cidade: patient?.cidade || '',
      estado: patient?.estado || '',
      contato_emergencia_nome: patient?.contato_emergencia_nome || '',
      contato_emergencia_telefone: patient?.contato_emergencia_telefone || '',
      valor_sessao: patient?.valor_sessao ? String(patient.valor_sessao) : '',
      frequencia_pagamento: patient?.frequencia_pagamento || 'sessão',
      dia_pagamento: patient?.dia_pagamento ? String(patient.dia_pagamento) : '',
      convenio_id: patient?.convenio_id || '',
      numero_carteira: patient?.numero_carteira || '',
      consentimento_lgpd: patient?.consentimento_lgpd || false,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const payload: any = {
        ...values,
        endereco: `${values.rua}, ${values.numero} - ${values.bairro}, ${values.cidade}/${values.estado}`,
      }

      if (values.consentimento_lgpd && !patient?.consentimento_lgpd) {
        payload.data_consentimento_lgpd = new Date().toISOString()
      }

      if (patient?.id) {
        const { error: updateError } = await supabase
          .from('pacientes')
          .update(payload)
          .eq('id', patient.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('pacientes')
          .insert([{ ...payload, usuario_id: user?.id }])
        if (insertError) throw insertError
      }

      toast({ title: patient?.id ? 'Paciente atualizado!' : 'Paciente cadastrado com sucesso!' })
      onSuccess()
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ id, label, type = 'text', onChange, ...props }: any) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-slate-600">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        className="bg-slate-50"
        {...register(id)}
        onChange={(e) => {
          register(id).onChange(e)
          if (onChange) onChange(e)
        }}
        {...props}
      />
      {errors[id as keyof typeof errors] && (
        <p className="text-xs font-medium text-red-500">
          {(errors[id as keyof typeof errors] as any)?.message}
        </p>
      )}
    </div>
  )

  const freqPagamento = watch('frequencia_pagamento')
  const convId = watch('convenio_id')
  const lgpdVal = watch('consentimento_lgpd')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field id="nome" label="Nome Completo *" />
        <Field id="data_nascimento" label="Data de Nascimento" type="date" />
        <Field
          id="cpf"
          label="CPF"
          onChange={(e: any) => setValue('cpf', maskCPF(e.target.value))}
          placeholder="000.000.000-00"
        />
        <Field
          id="telefone"
          label="Telefone"
          onChange={(e: any) => setValue('telefone', maskPhone(e.target.value))}
          placeholder="(00) 00000-0000"
        />
        <Field id="email" label="E-mail" type="email" />
      </div>

      <div className="pt-2 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 pb-2 mb-4 uppercase tracking-wider">
          Pagamento e Convênio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field id="valor_sessao" label="Valor Base Sessão (R$)" type="number" step="0.01" />
          <div className="space-y-1.5">
            <Label className="text-slate-600">Frequência</Label>
            <Select
              value={freqPagamento}
              onValueChange={(val) => setValue('frequencia_pagamento', val)}
            >
              <SelectTrigger className="bg-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sessão">Por Sessão</SelectItem>
                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field id="dia_pagamento" label="Dia de Vencimento" type="number" min="1" max="31" />
          {convenios.length > 0 && (
            <>
              <div className="space-y-1.5">
                <Label className="text-slate-600">Convênio</Label>
                <Select value={convId || ''} onValueChange={(val) => setValue('convenio_id', val)}>
                  <SelectTrigger className="bg-slate-50">
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum (Particular)</SelectItem>
                    {convenios.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field id="numero_carteira" label="Nº da Carteirinha" />
            </>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 pb-2 mb-4 uppercase tracking-wider">
          Endereço
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-slate-600">CEP</Label>
            <Input
              className="bg-slate-50"
              placeholder="00000-000"
              {...register('cep')}
              onChange={(e: any) => {
                const masked = maskCEP(e.target.value)
                setValue('cep', masked)
                if (masked.length === 9) {
                  fetchAddressByCEP(masked).then((addr) => {
                    if (addr) {
                      setValue('rua', addr.rua)
                      setValue('bairro', addr.bairro)
                      setValue('cidade', addr.cidade)
                      setValue('estado', addr.estado)
                    }
                  })
                }
              }}
            />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <Label className="text-slate-600">Rua / Logradouro</Label>
            <Input className="bg-slate-50" {...register('rua')} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-600">Número</Label>
            <Input className="bg-slate-50" {...register('numero')} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-600">Complemento</Label>
            <Input className="bg-slate-50" {...register('complemento')} />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-slate-600">Bairro</Label>
            <Input className="bg-slate-50" {...register('bairro')} />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-slate-600">Cidade</Label>
            <Input className="bg-slate-50" {...register('cidade')} />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label className="text-slate-600">Estado</Label>
            <Input className="bg-slate-50" {...register('estado')} />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-md border border-slate-100">
          <Checkbox
            id="lgpd"
            checked={lgpdVal}
            onCheckedChange={(v) => setValue('consentimento_lgpd', !!v)}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="lgpd" className="text-slate-800 font-medium">
              Consentimento LGPD
            </Label>
            <p className="text-xs text-slate-500 pt-1">
              Confirmo que o paciente autorizou o tratamento de seus dados em conformidade com a
              LGPD.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
