import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { maskCPF, maskPhone } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function PatientEditForm({ patient, onCancel, onSuccess }: any) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: patient?.nome || '',
    email: patient?.email || '',
    telefone: patient?.telefone || '',
    cpf: patient?.cpf || '',
    data_nascimento: patient?.data_nascimento || '',
    contato_emergencia_nome: patient?.contato_emergencia_nome || '',
    contato_emergencia_telefone: patient?.contato_emergencia_telefone || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.contato_emergencia_nome || !formData.contato_emergencia_telefone) {
      toast({
        title: 'Atenção',
        description: 'O contato de emergência é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    const payload = {
      usuario_id: user.id,
      ...formData,
    }

    let error
    if (patient?.id) {
      const { error: updateError } = await supabase
        .from('pacientes')
        .update(payload)
        .eq('id', patient.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from('pacientes').insert(payload)
      error = insertError
    }

    setLoading(false)

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Paciente salvo com sucesso!' })
      onSuccess()
    }
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: maskPhone(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Contato de Emergência (Obrigatório)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50 p-4 rounded-md border border-amber-100">
              <div className="space-y-2">
                <Label className="text-amber-900">Nome do Contato *</Label>
                <Input
                  className="bg-white"
                  required
                  value={formData.contato_emergencia_nome}
                  onChange={(e) =>
                    setFormData({ ...formData, contato_emergencia_nome: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-amber-900">Telefone do Contato *</Label>
                <Input
                  className="bg-white"
                  required
                  value={formData.contato_emergencia_telefone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contato_emergencia_telefone: maskPhone(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar Paciente
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
