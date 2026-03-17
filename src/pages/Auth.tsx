import { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (session && !loading) {
      navigate('/', { replace: true })
    }
  }, [session, loading, navigate])

  if (loading) return null
  if (session) return <Navigate to="/" replace />

  const handleAuth = async (action: 'login' | 'signup', e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (action === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        toast({ title: 'Bem-vindo de volta!' })
        navigate('/', { replace: true })
      } else {
        const { error } = await signUp(email, password, clinicName)
        if (error) throw error
        toast({ title: 'Conta criada!', description: 'Bem-vindo ao sistema da sua clínica.' })
        navigate('/', { replace: true })
      }
    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.toLowerCase().includes('rate limit') ||
        error?.code === 'over_email_send_rate_limit'

      const isInvalidCredentials =
        error?.message?.toLowerCase().includes('invalid login credentials') ||
        error?.code === 'invalid_credentials' ||
        (error?.status === 400 && action === 'login')

      let title = 'Erro na autenticação'
      let description = error?.message || 'Ocorreu um erro inesperado.'

      if (isRateLimit) {
        if (action === 'signup') {
          title = 'Limite de envios atingido'
          description =
            'Por favor, aguarde alguns instantes antes de tentar realizar o cadastro novamente.'
        } else {
          title = 'Limite de tentativas excedido'
          description = 'Muitas requisições. Aguarde alguns minutos antes de tentar novamente.'
        }
      } else if (isInvalidCredentials) {
        title = 'Acesso negado'
        description = 'E-mail ou senha inválidos. Por favor, tente novamente.'
      }

      toast({
        title,
        description,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle()
    if (error)
      toast({ title: 'Erro com Google', description: error.message, variant: 'destructive' })
  }

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
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 mb-4"
                onClick={handleGoogleSignIn}
              >
                Continuar com Google
              </Button>
              <form onSubmit={(e) => handleAuth('login', e)} className="space-y-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Senha</Label>
                    <Link to="/recuperar-senha" className="text-sm text-primary hover:underline">
                      Esqueci minha senha
                    </Link>
                  </div>
                  <Input
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
              <form onSubmit={(e) => handleAuth('signup', e)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Consultório</Label>
                  <Input
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input
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
