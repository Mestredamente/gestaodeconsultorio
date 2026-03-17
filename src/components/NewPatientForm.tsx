import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

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
  endereco: z.string().optional(),
  contato_emergencia_nome: z.string().optional(),
  contato_emergencia_telefone: z.string().optional(),
  valor_sessao: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null)),
})

export default function NewPatientForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      data_nascimento: '',
      cpf: '',
      telefone: '',
      email: '',
      endereco: '',
      contato_emergencia_nome: '',
      contato_emergencia_telefone: '',
      valor_sessao: '' as any,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return
    setLoading(true)

    const payload = {
      usuario_id: user.id,
      nome: values.nome,
      data_nascimento: values.data_nascimento || null,
      cpf: values.cpf || null,
      telefone: values.telefone || null,
      email: values.email || null,
      endereco: values.endereco || null,
      contato_emergencia_nome: values.contato_emergencia_nome || null,
      contato_emergencia_telefone: values.contato_emergencia_telefone || null,
      valor_sessao: values.valor_sessao,
    }

    const { error } = await supabase.from('pacientes').insert(payload as any)
    setLoading(false)

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Paciente cadastrado com sucesso!' })
      form.reset({
        nome: '',
        data_nascimento: '',
        cpf: '',
        telefone: '',
        email: '',
        endereco: '',
        contato_emergencia_nome: '',
        contato_emergencia_telefone: '',
        valor_sessao: '' as any,
      })
    }
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="João da Silva" {...field} value={field.value || ''} />
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
                      <Input type="date" {...field} value={field.value || ''} />
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
                      <Input placeholder="000.000.000-00" {...field} value={field.value || ''} />
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
                      <Input placeholder="(00) 00000-0000" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="joao@email.com"
                        type="email"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valor_sessao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Padrão da Sessão (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço Completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rua Exemplo, 123, Bairro, Cidade - UF"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-medium text-slate-800 border-b border-slate-100 pb-2 mb-4">
                Contato de Emergência
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contato_emergencia_nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="Maria da Silva" {...field} value={field.value || ''} />
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
                      <FormLabel>Telefone do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8">
                {loading ? 'Salvando...' : 'Salvar Paciente'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
