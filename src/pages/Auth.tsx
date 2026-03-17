import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
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

  const { signIn, signUp, session, loading } = useAuth()
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
        toast({
          title: 'Erro ao fazer login',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Bem-vindo de volta!' })
        navigate('/')
      }
    } else {
      const { error } = await signUp(email, password, clinicName)
      if (error) {
        toast({
          title: 'Erro ao cadastrar',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Conta criada!',
          description: 'Bem-vindo ao sistema da sua clínica.',
        })
      }
    }

    setIsSubmitting(false)
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
              <form onSubmit={(e) => handleAuth('login', e)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    required
                    className="bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Entrando...' : 'Entrar na Clínica'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => handleAuth('signup', e)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-clinic">Nome do Consultório</Label>
                  <Input
                    id="signup-clinic"
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Ex: Espaço Mente Saudável"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu melhor e-mail"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Crie uma senha forte"
                    required
                    minLength={6}
                    className="bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium mt-2"
                  disabled={isSubmitting}
                >
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
