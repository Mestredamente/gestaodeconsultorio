import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { maskCPF, maskPhone, maskCEP, fetchAddressByCEP } from '@/lib/utils'
import { Loader2, MapPin } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function PatientEditForm({ patient, onCancel, onSuccess }: any) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchingCep, setFetchingCep] = useState(false)
  const [convenios, setConvenios] = useState<any[]>([])

  const [formData, setFormData] = useState({
    nome: patient?.nome || '',
    email: patient?.email || '',
    telefone: patient?.telefone || '',
    cpf: patient?.cpf || '',
    data_nascimento: patient?.data_nascimento || '',
    cep: patient?.cep || '',
    rua: patient?.rua || '',
    numero: patient?.numero || '',
    complemento: patient?.complemento || '',
    bairro: patient?.bairro || '',
    cidade: patient?.cidade || '',
    estado: patient?.estado || '',
    contato_emergencia_nome: patient?.contato_emergencia_nome || '',
    contato_emergencia_telefone: patient?.contato_emergencia_telefone || '',
    valor_sessao: patient?.valor_sessao || '',
    frequencia_pagamento: patient?.frequencia_pagamento || 'sessão',
    dia_pagamento: patient?.dia_pagamento || '',
    convenio_id: patient?.convenio_id || 'none',
    numero_carteira: patient?.numero_carteira || '',
  })

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

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value)
    setFormData({ ...formData, cep: masked })

    if (masked.length === 9) {
      setFetchingCep(true)
      try {
        const address = await fetchAddressByCEP(masked)
        if (address) {
          setFormData((prev) => ({
            ...prev,
            rua: address.rua,
            bairro: address.bairro,
            cidade: address.cidade,
            estado: address.estado,
          }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (
      !formData.nome ||
      !formData.contato_emergencia_nome ||
      !formData.contato_emergencia_telefone
    ) {
      toast({
        title: 'Atenção',
        description: 'Preencha os campos obrigatórios (*).',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const payload = {
      usuario_id: user.id,
      nome: formData.nome,
      email: formData.email || null,
      telefone: formData.telefone || null,
      cpf: formData.cpf || null,
      data_nascimento: formData.data_nascimento || null,
      cep: formData.cep || null,
      rua: formData.rua || null,
      numero: formData.numero || null,
      complemento: formData.complemento || null,
      bairro: formData.bairro || null,
      cidade: formData.cidade || null,
      estado: formData.estado || null,
      endereco: formData.rua
        ? `${formData.rua}, ${formData.numero} - ${formData.bairro}, ${formData.cidade}/${formData.estado}`
        : null,
      contato_emergencia_nome: formData.contato_emergencia_nome,
      contato_emergencia_telefone: formData.contato_emergencia_telefone,
      valor_sessao: formData.valor_sessao
        ? Number(String(formData.valor_sessao).replace(',', '.'))
        : null,
      frequencia_pagamento: formData.frequencia_pagamento,
      dia_pagamento: formData.dia_pagamento ? Number(formData.dia_pagamento) : null,
      convenio_id: formData.convenio_id === 'none' ? null : formData.convenio_id,
      numero_carteira: formData.numero_carteira || null,
    }

    const { error } = await supabase.from('pacientes').update(payload).eq('id', patient.id)
    setLoading(false)

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Paciente atualizado com sucesso!' })
      onSuccess()
    }
  }

  return (
    <Card className="shadow-sm border-slate-100 rounded-3xl overflow-hidden">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="bg-slate-50/50 rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-50/50 rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: maskPhone(e.target.value) })
                  }
                  className="bg-slate-50/50 rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
                  className="bg-slate-50/50 rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                  className="bg-slate-50/50 rounded-xl h-11"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Endereço Completo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="space-y-2 relative">
                <Label>CEP</Label>
                <Input
                  value={formData.cep}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  className="bg-white rounded-xl h-11 pr-10"
                />
                {fetchingCep && (
                  <Loader2 className="absolute right-3 top-9 w-4 h-4 text-slate-400 animate-spin" />
                )}
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label>Rua / Logradouro</Label>
                <Input
                  value={formData.rua}
                  onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                  className="bg-white rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="bg-white rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Complemento</Label>
                <Input
                  value={formData.complemento}
                  onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  className="bg-white rounded-xl h-11"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Bairro</Label>
                <Input
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  className="bg-white rounded-xl h-11"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Cidade</Label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="bg-white rounded-xl h-11"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Estado</Label>
                <Input
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="bg-white rounded-xl h-11"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">
              Contato de Emergência
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
              <div className="space-y-2">
                <Label className="text-amber-900">Nome do Contato *</Label>
                <Input
                  required
                  value={formData.contato_emergencia_nome}
                  onChange={(e) =>
                    setFormData({ ...formData, contato_emergencia_nome: e.target.value })
                  }
                  className="bg-white rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-amber-900">Telefone do Contato *</Label>
                <Input
                  required
                  value={formData.contato_emergencia_telefone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contato_emergencia_telefone: maskPhone(e.target.value),
                    })
                  }
                  className="bg-white rounded-xl h-11"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Pagamento e Convênio</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
              <div className="space-y-2">
                <Label>Valor Base Sessão (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_sessao}
                  onChange={(e) => setFormData({ ...formData, valor_sessao: e.target.value })}
                  placeholder="150,00"
                  className="bg-white rounded-xl h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select
                  value={formData.frequencia_pagamento}
                  onValueChange={(v) => setFormData({ ...formData, frequencia_pagamento: v })}
                >
                  <SelectTrigger className="bg-white rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="sessão">Por Sessão</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dia de Vencimento</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dia_pagamento}
                  onChange={(e) => setFormData({ ...formData, dia_pagamento: e.target.value })}
                  className="bg-white rounded-xl h-11"
                />
              </div>
              {convenios.length > 0 && (
                <>
                  <div className="space-y-2">
                    <Label>Convênio</Label>
                    <Select
                      value={formData.convenio_id}
                      onValueChange={(v) => setFormData({ ...formData, convenio_id: v })}
                    >
                      <SelectTrigger className="bg-white rounded-xl h-11">
                        <SelectValue placeholder="Opcional" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="none">Nenhum / Particular</SelectItem>
                        {convenios.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nº da Carteirinha</Label>
                    <Input
                      value={formData.numero_carteira}
                      onChange={(e) =>
                        setFormData({ ...formData, numero_carteira: e.target.value })
                      }
                      className="bg-white rounded-xl h-11"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-xl h-12 px-6"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl h-12 px-8 text-base">
              {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
