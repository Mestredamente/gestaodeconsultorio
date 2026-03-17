import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, KeyRound } from 'lucide-react'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { resetPassword } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { error } = await resetPassword(email)
    setIsSubmitting(false)

    if (error) {
      const isRateLimit =
        error.status === 429 ||
        error.message?.toLowerCase().includes('rate limit') ||
        error.code === 'over_email_send_rate_limit'

      if (isRateLimit) {
        toast({
          title: 'Limite atingido',
          description:
            'Limite de envio de e-mail atingido. Por favor, aguarde alguns minutos antes de tentar solicitar uma nova senha novamente.',
          variant: 'destructive',
        })
      } else if (error.code === 'email_provider_disabled') {
        toast({
          title: 'Serviço Indisponível',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Erro ao solicitar redefinição',
          description: error.message,
          variant: 'destructive',
        })
      }
    } else {
      toast({
        title: 'Link de recuperação enviado!',
        description: 'Verifique sua caixa de entrada para redefinir a senha.',
      })
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200 animate-fade-in-up">
        <CardHeader className="text-center pb-6">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Recuperar Senha</CardTitle>
          <CardDescription>
            Informe seu e-mail para receber um link de redefinição de senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail cadastrado"
                required
                className="bg-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link
              to="/auth"
              className="text-sm text-slate-500 hover:text-primary flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
