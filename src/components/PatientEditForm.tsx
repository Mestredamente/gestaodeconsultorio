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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  data_nascimento: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')).nullable(),
  endereco: z.string().optional().nullable(),
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
      endereco: patient?.endereco || '',
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
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    let error = null

    if (patient?.id) {
      const { error: updateError } = await supabase
        .from('pacientes')
        .update(values as any)
        .eq('id', patient.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('pacientes')
        .insert([{ ...values, usuario_id: user?.id }] as any)
      error = insertError
    }

    setLoading(false)

    if (error)
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    else {
      toast({
        title: patient?.id
          ? 'Paciente atualizado com sucesso!'
          : 'Paciente cadastrado com sucesso!',
      })
      onSuccess()
    }
  }

  const Field = ({ id, label, type = 'text', ...props }: any) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-slate-600">
        {label}
      </Label>
      <Input id={id} type={type} className="bg-slate-50" {...register(id)} {...props} />
      {errors[id as keyof typeof errors] && (
        <p className="text-xs font-medium text-red-500">
          {(errors[id as keyof typeof errors] as any)?.message}
        </p>
      )}
    </div>
  )

  const freqPagamento = watch('frequencia_pagamento')
  const convId = watch('convenio_id')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field id="nome" label="Nome Completo *" />
        <Field id="data_nascimento" label="Data de Nascimento" type="date" />
        <Field id="cpf" label="CPF" />
        <Field id="telefone" label="Telefone" />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Field id="cep" label="CEP" />
          <div className="md:col-span-3">
            <Field id="rua" label="Rua" />
          </div>
          <Field id="numero" label="Número" />
          <Field id="complemento" label="Complemento" />
          <Field id="bairro" label="Bairro" />
          <Field id="cidade" label="Cidade" />
          <Field id="estado" label="Estado" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
