import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export default function Join() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invite, setInvite] = useState<any>(null)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    const fetchInvite = async () => {
      const { data, error } = await supabase
        .from('invitation_links')
        .select('*, roles(name), usuarios(nome_consultorio)')
        .eq('token', token)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !data) {
        console.error('Error fetching invite:', error)
        toast({
          title: 'Link de convite inválido ou expirado',
          description: 'Por favor solicite um novo convite ao administrador.',
          variant: 'destructive',
        })
        navigate('/auth')
      } else {
        setInvite(data)
        setFormData((f) => ({ ...f, email: data.email }))
      }
      setLoading(false)
    }
    if (token) fetchInvite()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const roleMap: Record<string, string> = {
      secretary: 'secretaria',
      professional: 'profissional',
    }
    const finalRole = roleMap[invite.roles?.name] || 'profissional'

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          nome: formData.nome,
          parent_id: invite.clinic_id,
          role: finalRole,
        },
      },
    })

    if (authError) {
      toast({
        title: 'Erro ao criar conta',
        description: authError.message,
        variant: 'destructive',
      })
      setSubmitting(false)
      return
    }

    if (authData.user) {
      await supabase.rpc('finalize_invitation', {
        p_token: token,
        p_user_id: authData.user.id,
        p_role_id: invite.role_id,
        p_clinic_id: invite.clinic_id,
      })
      toast({ title: 'Conta criada com sucesso! Você já pode acessar o sistema.' })
      navigate('/')
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  if (!invite) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold">Junte-se à Clínica</CardTitle>
          <CardDescription className="text-slate-500 mt-2">
            Você foi convidado para a clínica{' '}
            <b>{invite.usuarios?.nome_consultorio || 'Parceira'}</b>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input disabled value={formData.email} className="h-12 rounded-xl bg-slate-100" />
            </div>
            <div className="space-y-2">
              <Label>Crie uma Senha</Label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                minLength={8}
                className="h-12 rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar Conta e Acessar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
