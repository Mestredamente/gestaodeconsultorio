import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('StrongPassword123!')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn, session, loading } = useAuth()
  const { toast } = useToast()

  if (loading) return null
  if (session) return <Navigate to="/" replace />

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast({ title: 'Erro ao fazer login', description: error.message, variant: 'destructive' })
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold text-slate-900">Bem-vindo de volta</CardTitle>
          <CardDescription>Faça login para acessar sua clínica</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
                className="bg-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
