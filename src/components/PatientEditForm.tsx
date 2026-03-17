import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  data_nascimento: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')).nullable(),
  endereco: z.string().optional().nullable(),
  contato_emergencia_nome: z.string().optional().nullable(),
  contato_emergencia_telefone: z.string().optional().nullable(),
  valor_sessao: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? Number(v) : null)),
})

export default function PatientEditForm({ patient, onSuccess, onCancel }: any) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
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
      contato_emergencia_nome: patient?.contato_emergencia_nome || '',
      contato_emergencia_telefone: patient?.contato_emergencia_telefone || '',
      valor_sessao: patient?.valor_sessao ? String(patient.valor_sessao) : '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    const { error } = await supabase
      .from('pacientes')
      .update(values as any)
      .eq('id', patient.id)
    setLoading(false)

    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Paciente atualizado com sucesso!' })
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
        <Field id="valor_sessao" label="Valor da Sessão (R$)" type="number" step="0.01" />
        <div className="md:col-span-2">
          <Field id="endereco" label="Endereço Completo" />
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 uppercase tracking-wider">
          Contato de Emergência
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field id="contato_emergencia_nome" label="Nome do Contato" />
          <Field id="contato_emergencia_telefone" label="Telefone do Contato" />
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
