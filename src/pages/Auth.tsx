import { useState, useEffect } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface PasswordInputProps {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  show: boolean
  onToggle: () => void
  showForgot?: boolean
}

const PasswordInput = ({
  label,
  value,
  onChange,
  show,
  onToggle,
  showForgot,
}: PasswordInputProps) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <Label>{label}</Label>
      {showForgot && (
        <Link to="/recuperar-senha" className="text-xs font-medium text-primary hover:underline">
          Esqueci minha senha
        </Link>
      )}
    </div>
    <Input
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      required
      minLength={6}
    />
    <button
      type="button"
      onClick={onToggle}
      className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors mt-1 block w-fit"
    >
      {show ? 'Ocultar senha' : 'Mostrar senha'}
    </button>
  </div>
)

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showPws, setShowPws] = useState({ login: false, signup: false, confirm: false })

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

    if (action === 'signup' && password !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' })
      return
    }

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
        toast({
          title: 'Conta criada!',
          description: 'Bem-vindo ao sistema. Complete seu cadastro.',
        })
        navigate('/onboarding', { replace: true })
      }
    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 || error?.message?.toLowerCase().includes('rate limit')
      const isInvalidCreds =
        error?.message?.toLowerCase().includes('invalid') || error?.code === 'invalid_credentials'
      const isEmailDisabled =
        error?.code === 'email_provider_disabled' ||
        (error?.status === 422 && error?.message?.toLowerCase().includes('email')) ||
        error?.message?.toLowerCase().includes('email provider is disabled') ||
        error?.message?.toLowerCase().includes('email logins are disabled') ||
        error?.message?.toLowerCase().includes('signups not allowed')

      let title = 'Erro na autenticação'
      let description = error?.message || 'Ocorreu um erro inesperado.'

      if (isEmailDisabled) {
        title = 'Serviço Indisponível'
        description =
          'O login por e-mail está atualmente desativado na configuração do sistema. Por favor, contate o administrador.'
      } else if (isRateLimit) {
        title = action === 'signup' ? 'Limite atingido' : 'Limite excedido'
        description = 'Aguarde alguns minutos antes de tentar novamente.'
      } else if (isInvalidCreds) {
        title = 'Acesso negado'
        description = 'E-mail ou senha inválidos.'
      }

      toast({ title, description, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleShow = (key: keyof typeof showPws) => setShowPws((p) => ({ ...p, [key]: !p[key] }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200 animate-fade-in-up">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-slate-900">App Gestão Clínica</CardTitle>
          <CardDescription>Acesse ou crie sua conta para gerenciar seus pacientes</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="login"
            className="w-full"
            onValueChange={() => {
              setPassword('')
              setConfirmPassword('')
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 mb-4"
                onClick={signInWithGoogle}
              >
                Continuar com Google
              </Button>
              <form onSubmit={(e) => handleAuth('login', e)} className="space-y-4">
                <div className="space-y-1">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <PasswordInput
                  label="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  show={showPws.login}
                  onToggle={() => toggleShow('login')}
                  showForgot
                />
                <Button type="submit" className="w-full h-11 mt-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Entrando...' : 'Entrar na Clínica'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => handleAuth('signup', e)} className="space-y-3">
                <div className="space-y-1">
                  <Label>Nome do Consultório</Label>
                  <Input
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <PasswordInput
                  label="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  show={showPws.signup}
                  onToggle={() => toggleShow('signup')}
                />
                <PasswordInput
                  label="Confirmar Senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  show={showPws.confirm}
                  onToggle={() => toggleShow('confirm')}
                />
                <Button type="submit" className="w-full h-11 mt-4" disabled={isSubmitting}>
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
