import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn, signUp, session, loading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  if (loading) return null
  if (session) return <Navigate to="/agenda" replace />

  const handleAuth = async (action: 'login' | 'signup', e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { error } =
      action === 'login' ? await signIn(email, password) : await signUp(email, password)

    if (error) {
      toast({
        title: action === 'login' ? 'Erro ao fazer login' : 'Erro ao cadastrar',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      if (action === 'signup') {
        toast({ title: 'Conta criada!', description: 'Bem-vindo ao sistema da sua clínica.' })
      } else {
        toast({ title: 'Bem-vindo de volta!' })
      }
      navigate('/agenda')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
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
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu e-mail"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Input
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
                  className="w-full h-11 text-base font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Entrando...' : 'Entrar na Clínica'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => handleAuth('signup', e)} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Seu melhor e-mail"
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Input
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
                  className="w-full h-11 text-base font-medium"
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
