import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function SaasBetaTesters() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [planId, setPlanId] = useState('')
  const [expDate, setExpDate] = useState('')
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('subscription_plans')
      .select('*')
      .then(({ data }) => {
        if (data) setPlans(data)
      })
  }, [])

  const handleGrant = async () => {
    if (!email || !planId || !expDate) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' })
      return
    }

    const { data: targetUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single()
    if (!targetUser) {
      toast({ title: 'Usuário não encontrado com este e-mail', variant: 'destructive' })
      return
    }

    await supabase.from('admin_free_access').insert({
      user_id: targetUser.id,
      plan_id: planId,
      granted_by: user?.id,
      expiration_date: new Date(expDate).toISOString(),
    })

    const { error } = await supabase.from('subscriptions').upsert(
      {
        user_id: targetUser.id,
        plan_id: planId,
        status: 'active',
        start_date: new Date().toISOString(),
        renewal_date: new Date(expDate).toISOString(),
      },
      { onConflict: 'user_id' },
    )

    if (!error) {
      toast({ title: 'Acesso Beta concedido com sucesso!' })
      setIsOpen(false)
      setEmail('')
      setPlanId('')
      setExpDate('')
    } else {
      toast({
        title: 'Erro ao conceder acesso',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <CardTitle>Beta Testers</CardTitle>
          <CardDescription>Conceda acesso gratuito a usuários selecionados.</CardDescription>
        </div>
        <Button onClick={() => setIsOpen(true)}>Novo Acesso</Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          Gerencie os acessos temporários de beta testers no seu painel administrativo.
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conceder Acesso Beta</DialogTitle>
              <DialogDescription>
                Libere um plano gratuitamente por um período determinado.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>E-mail do Usuário</Label>
                <Input
                  placeholder="usuario@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Plano a Liberar</Label>
                <Select onValueChange={setPlanId} value={planId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Expiração</Label>
                <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} />
              </div>
              <Button onClick={handleGrant} className="w-full mt-4">
                Confirmar Liberação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
