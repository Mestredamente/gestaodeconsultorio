import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signIn, signUp, signInWithGoogle, session, loading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  if (loading) return null
  if (session) return <Navigate to="/" replace />

  const handleAuth = async (action: 'login' | 'signup', e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (action === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        toast({ title: 'Erro ao fazer login', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Bem-vindo de volta!' })
        navigate('/')
      }
    } else {
      const { error } = await signUp(email, password, clinicName)
      if (error) {
        // Specifically identify the rate limit error
        const isRateLimit =
          error.status === 429 ||
          error.message?.toLowerCase().includes('email rate limit exceeded') ||
          (error as any).code === 'over_email_send_rate_limit'

        if (isRateLimit) {
          toast({
            title: 'Limite excedido',
            description:
              'Email rate limit exceeded. Please wait a few minutes before trying to sign up again.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Erro ao cadastrar',
            description: error.message,
            variant: 'destructive',
          })
        }
      } else {
        toast({ title: 'Conta criada!', description: 'Bem-vindo ao sistema da sua clínica.' })
      }
    }

    setIsSubmitting(false)
  }

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      toast({ title: 'Erro com Google', description: error.message, variant: 'destructive' })
    }
  }

  const GoogleButton = () => (
    <Button
      type="button"
      variant="outline"
      className="w-full h-11 mb-4"
      onClick={handleGoogleSignIn}
    >
      <svg
        className="w-5 h-5 mr-2"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Continuar com Google
    </Button>
  )

  const Separator = () => (
    <div className="relative my-4">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-2 text-slate-500">Ou use e-mail</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200 animate-fade-in-up">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-slate-900">App Gestão Clínica</CardTitle>
          <CardDescription>Acesse ou crie sua conta para gerenciar seus pacientes</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <GoogleButton />
              <Separator />
              <form onSubmit={(e) => handleAuth('login', e)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Senha</Label>
                    <Link
                      to="/recuperar-senha"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                  {isSubmitting ? 'Entrando...' : 'Entrar na Clínica'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <GoogleButton />
              <Separator />
              <form onSubmit={(e) => handleAuth('signup', e)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-clinic">Nome do Consultório</Label>
                  <Input
                    id="signup-clinic"
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando conta...' : 'Criar Minha Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
