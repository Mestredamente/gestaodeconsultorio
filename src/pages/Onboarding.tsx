import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Building2, Phone, MapPin } from 'lucide-react'

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome_consultorio: '',
    telefone_consultorio: '',
    cep: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      supabase
        .from('usuarios')
        .select('nome_consultorio')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFormData((f) => ({ ...f, nome_consultorio: data.nome_consultorio || '' }))
          }
        })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    const { error } = await supabase
      .from('usuarios')
      .update({
        nome_consultorio: formData.nome_consultorio,
        telefone_consultorio: formData.telefone_consultorio,
        cep: formData.cep,
        onboarding_concluido: true,
      })
      .eq('id', user.id)

    setLoading(false)
    if (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } else {
      navigate('/planos', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200 animate-fade-in-up">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-slate-900">Complete seu Perfil</CardTitle>
          <CardDescription>
            Precisamos de mais alguns dados do seu consultório antes de continuarmos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Consultório / Profissional</Label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  className="pl-9 bg-slate-50"
                  required
                  value={formData.nome_consultorio}
                  onChange={(e) => setFormData({ ...formData, nome_consultorio: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Telefone de Contato</Label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  className="pl-9 bg-slate-50"
                  required
                  placeholder="(00) 00000-0000"
                  value={formData.telefone_consultorio}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone_consultorio: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>CEP do Consultório (Opcional)</Label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  className="pl-9 bg-slate-50"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-6 h-11 text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Continuar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
