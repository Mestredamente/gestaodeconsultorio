import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'

export default function SaasSubscribersTable() {
  const [subs, setSubs] = useState<any[]>([])
  const { toast } = useToast()
  const [plans, setPlans] = useState<any[]>([])
  const [editingSub, setEditingSub] = useState<any>(null)
  const [cancelingSub, setCancelingSub] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [{ data: subscriptions }, { data: pData }] = await Promise.all([
      supabase.from('subscriptions').select('*, usuarios(nome, email), subscription_plans(name)'),
      supabase.from('subscription_plans').select('*'),
    ])
    if (subscriptions) setSubs(subscriptions)
    if (pData) setPlans(pData)
  }

  const handleEditPlan = async (planId: string) => {
    if (!editingSub) return
    await supabase.from('subscriptions').update({ plan_id: planId }).eq('id', editingSub.id)
    toast({ title: 'Plano atualizado com sucesso' })
    setEditingSub(null)
    fetchData()
  }

  const handleBlock = async (subId: string) => {
    await supabase.from('subscriptions').update({ status: 'blocked' }).eq('id', subId)
    toast({ title: 'Assinatura bloqueada' })
    fetchData()
  }

  const handleCancel = async () => {
    if (!cancelingSub) return
    await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('id', cancelingSub.id)
    await supabase.from('subscription_audit_log').insert({
      subscription_id: cancelingSub.id,
      action: 'Cancelamento Manual',
      details: { reason: cancelReason },
    })
    toast({ title: 'Assinatura cancelada', description: 'O registro foi atualizado.' })
    setCancelingSub(null)
    setCancelReason('')
    fetchData()
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Usuário</TableHead>
              <TableHead className="font-semibold">Plano</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Renovação</TableHead>
              <TableHead className="font-semibold text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhuma assinatura encontrada.
                </TableCell>
              </TableRow>
            ) : (
              subs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium text-slate-800">
                      {s.usuarios?.nome || 'Usuário'}
                    </div>
                    <div className="text-xs text-slate-500">{s.usuarios?.email}</div>
                  </TableCell>
                  <TableCell className="capitalize text-slate-700">
                    {s.subscription_plans?.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        s.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : s.status === 'blocked'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {s.renewal_date ? new Date(s.renewal_date).toLocaleDateString('pt-BR') : '-'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingSub(s)}>
                      Editar
                    </Button>
                    {s.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => handleBlock(s.id)}
                      >
                        Bloquear
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => setCancelingSub(s)}>
                      Cancelar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={!!editingSub} onOpenChange={() => setEditingSub(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Plano</DialogTitle>
              <DialogDescription>Selecione o novo plano para o usuário.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Select onValueChange={handleEditPlan} defaultValue={editingSub?.plan_id}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o novo plano" />
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
          </DialogContent>
        </Dialog>

        <Dialog open={!!cancelingSub} onOpenChange={() => setCancelingSub(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancelar Assinatura</DialogTitle>
              <DialogDescription>
                Ação irreversível. Informe o motivo do cancelamento.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Motivo do cancelamento (ex: Solicitação do cliente)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <Button
                variant="destructive"
                onClick={handleCancel}
                className="w-full"
                disabled={!cancelReason}
              >
                Confirmar Cancelamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
