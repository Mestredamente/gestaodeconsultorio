import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    if (!user) return
    const { data } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', user.id)
      .order('data_criacao', { ascending: false })
      .limit(50)
    if (data) setNotifications(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const markAsRead = async (id: string) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
  }

  const markAllAsRead = async () => {
    if (!user) return
    await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('usuario_id', user.id)
      .eq('lida', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })))
  }

  const deleteNotification = async (id: string) => {
    await supabase.from('notificacoes').delete().eq('id', id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10 px-4 sm:px-0 mt-6 sm:mt-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Central de Notificações
            </h1>
            <p className="text-slate-500">Acompanhe todos os alertas e avisos do seu sistema.</p>
          </div>
        </div>
        <Button variant="outline" onClick={markAllAsRead} className="gap-2">
          <CheckCircle2 className="w-4 h-4" /> Marcar todas como lidas
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              Nenhuma notificação encontrada.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'p-5 flex gap-4 transition-colors hover:bg-slate-50',
                    !n.lida && 'bg-indigo-50/30',
                  )}
                >
                  <div className="mt-1">
                    <div
                      className={cn(
                        'w-2.5 h-2.5 rounded-full',
                        !n.lida ? 'bg-primary' : 'bg-transparent',
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={cn(
                        'text-base',
                        !n.lida ? 'font-bold text-slate-900' : 'font-medium text-slate-700',
                      )}
                    >
                      {n.titulo}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">{n.mensagem}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(n.data_criacao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!n.lida && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(n.id)}
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 justify-start"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar Lida
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(n.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 justify-start"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
