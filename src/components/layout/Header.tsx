import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  CalendarX,
  ChevronLeft,
  Menu,
  CheckCircle2,
  Filter,
  LayoutDashboard,
  Calendar,
  Video,
  Users,
  MessageSquare,
  Wallet,
  PieChart,
  Box,
  ShieldAlert,
  Settings as SettingsIcon,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const getMenuGroups = (role: string) =>
  [
    {
      title: 'Principal',
      items: [
        {
          title: 'Início',
          path: '/',
          icon: LayoutDashboard,
          roles: ['admin', 'profissional', 'secretaria', 'superadmin'],
        },
        {
          title: 'Agenda',
          path: '/agenda',
          icon: Calendar,
          roles: ['admin', 'profissional', 'secretaria', 'superadmin'],
        },
        {
          title: 'Sessão Online',
          path: '/sala-virtual',
          icon: Video,
          roles: ['admin', 'profissional', 'superadmin'],
        },
        {
          title: 'Pacientes',
          path: '/pacientes',
          icon: Users,
          roles: ['admin', 'profissional', 'secretaria', 'superadmin'],
        },
        {
          title: 'Contatos (CRM)',
          path: '/contatos',
          icon: MessageSquare,
          roles: ['admin', 'superadmin'],
        },
      ].filter((i) => i.roles.includes(role)),
    },
    {
      title: 'Gestão',
      items: [
        {
          title: 'Financeiro',
          path: '/carteira',
          icon: Wallet,
          roles: ['admin', 'secretaria', 'superadmin'],
        },
        {
          title: 'Relatórios',
          path: '/relatorios',
          icon: PieChart,
          roles: ['admin', 'profissional', 'secretaria', 'superadmin'],
        },
        { title: 'Estoque', path: '/estoque', icon: Box, roles: ['admin', 'superadmin'] },
        { title: 'Marketing', path: '/marketing', icon: Filter, roles: ['admin', 'superadmin'] },
        { title: 'RH', path: '/rh', icon: Users, roles: ['admin', 'superadmin'] },
        {
          title: 'Supervisão',
          path: '/supervisao',
          icon: ShieldAlert,
          roles: ['admin', 'profissional', 'superadmin'],
        },
      ].filter((i) => i.roles.includes(role)),
    },
    {
      title: 'Sistema',
      items: [
        {
          title: 'Configurações',
          path: '/configuracoes',
          icon: SettingsIcon,
          roles: ['admin', 'profissional', 'secretaria', 'superadmin'],
        },
      ].filter((i) => i.roles.includes(role)),
    },
  ].filter((g) => g.items.length > 0)

export default function Header() {
  const { user, userProfile } = useAuth()
  const role = userProfile?.role || 'admin'
  const menuGroups = getMenuGroups(role)
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [clinic, setClinic] = useState({ name: '', logo: '' })
  const [notifications, setNotifications] = useState<any[]>([])

  const [unreadCancelCount, setUnreadCancelCount] = useState(0)
  const [cancellations, setCancellations] = useState<any[]>([])
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchNotifs = async () => {
      try {
        const { data, count } = await supabase
          .from('notificacoes')
          .select('*', { count: 'exact' })
          .eq('usuario_id', user.id)
          .order('data_criacao', { ascending: false })
          .limit(10)

        if (data) setNotifications(data)
        const unread = data?.filter((n) => !n.lida).length || 0
        setUnreadCount(unread)
      } catch (err) {
        console.error('Erro inesperado ao buscar notificações:', err)
      }
    }
    fetchNotifs()

    const fetchClinic = async () => {
      const { data } = await supabase
        .from('usuarios')
        .select('nome_consultorio, logo_url')
        .eq('id', user.id)
        .single()
      if (data) setClinic({ name: data.nome_consultorio || '', logo: data.logo_url || '' })
    }
    fetchClinic()

    const sub = supabase
      .channel('header_notifs_layout')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notificacoes', filter: `usuario_id=eq.${user.id}` },
        () => fetchNotifs(),
      )
      .subscribe()

    const cancelSub = supabase
      .channel('header_cancellations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agendamentos',
          filter: `usuario_id=eq.${user.id}`,
        },
        async (payload: any) => {
          if (payload.new.status === 'desmarcou') {
            if (payload.old && payload.old.status === 'desmarcou') return

            supabase
              .from('pacientes')
              .select('nome')
              .eq('id', payload.new.paciente_id)
              .single()
              .then(({ data }) => {
                const newCancel = {
                  id: payload.new.id,
                  patientName: data?.nome || 'Paciente',
                  date: payload.new.data_hora,
                  reason: payload.new.motivo_cancelamento || 'Motivo não informado',
                }

                setCancellations((curr) => {
                  if (curr.some((c) => c.id === newCancel.id)) return curr
                  setUnreadCancelCount((cnt) => cnt + 1)

                  toast({
                    title: 'Sessão Cancelada',
                    description: `Paciente ${newCancel.patientName} cancelou a sessão de ${new Date(newCancel.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}. Motivo: ${newCancel.reason}`,
                    variant: 'destructive',
                  })

                  // Add to notificacoes table as well
                  supabase
                    .from('notificacoes')
                    .insert({
                      usuario_id: user.id,
                      titulo: 'Sessão Cancelada',
                      mensagem: `Paciente ${newCancel.patientName} cancelou a sessão de ${new Date(newCancel.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}. Motivo: ${newCancel.reason}`,
                      tipo: 'cancelamento',
                    })
                    .then()

                  return [newCancel, ...curr]
                })
              })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
      supabase.removeChannel(cancelSub)
    }
  }, [user])

  const markAllAsRead = async () => {
    if (!user) return
    await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('usuario_id', user.id)
      .eq('lida', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })))
    setUnreadCount(0)
  }

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-slate-50 border-r-0">
              <div className="p-5 border-b border-slate-200 flex items-center gap-3 bg-white">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                  {clinic.name ? clinic.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <p className="font-bold text-slate-800 tracking-tight truncate max-w-[160px]">
                    {clinic.name || 'Clínica'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Menu Principal</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                {menuGroups.map((group, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const isActive =
                          location.pathname === item.path ||
                          (item.path !== '/' && location.pathname.startsWith(item.path))
                        return (
                          <SheetTrigger asChild key={item.path}>
                            <Link
                              to={item.path}
                              className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                                isActive
                                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900',
                              )}
                            >
                              <item.icon
                                className={cn(
                                  'w-5 h-5',
                                  isActive ? 'text-white' : 'text-slate-400',
                                )}
                              />
                              {item.title}
                            </Link>
                          </SheetTrigger>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          {location.pathname !== '/' && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
              title="Voltar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <span className="font-bold text-slate-800 text-lg tracking-tight truncate max-w-[150px]">
            {clinic.name || 'Clínica'}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-slate-500 text-sm font-medium">
          {location.pathname !== '/' && (
            <button
              onClick={() => navigate(-1)}
              className="mr-2 p-1 hover:bg-slate-100 rounded-md transition-colors"
              title="Voltar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <span>Bem-vindo ao seu painel de gestão</span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => {
              setIsCancelModalOpen(true)
              setUnreadCancelCount(0)
            }}
            className="relative p-2.5 text-slate-500 hover:text-red-600 transition-colors hover:bg-red-50 rounded-xl"
            title="Cancelamentos Recentes"
          >
            <CalendarX className="w-5 h-5" />
            {unreadCancelCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                className="relative p-2.5 text-slate-500 hover:text-primary transition-colors hover:bg-slate-100 rounded-xl"
                title="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4 mt-2 rounded-2xl shadow-xl border-slate-200">
              <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
                <span className="font-bold text-slate-800">Notificações</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 text-xs text-primary"
                >
                  Marcar lidas
                </Button>
              </div>
              <Tabs defaultValue="todos">
                <TabsList className="w-full rounded-none border-b border-slate-100 h-auto p-0 bg-transparent">
                  <TabsTrigger
                    value="todos"
                    className="flex-1 rounded-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary shadow-none"
                  >
                    Todos
                  </TabsTrigger>
                  <TabsTrigger
                    value="naolidos"
                    className="flex-1 rounded-none py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary shadow-none"
                  >
                    Não Lidos
                  </TabsTrigger>
                </TabsList>
                <div className="max-h-80 overflow-y-auto">
                  <TabsContent value="todos" className="m-0">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        Nenhuma notificação.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={cn(
                            'p-4 border-b border-slate-50 text-sm hover:bg-slate-50',
                            !n.lida && 'bg-indigo-50/30',
                          )}
                        >
                          <p
                            className={cn(
                              'font-semibold mb-1',
                              n.lida ? 'text-slate-700' : 'text-slate-900',
                            )}
                          >
                            {n.titulo}
                          </p>
                          <p className="text-slate-600 text-xs mb-2">{n.mensagem}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(n.data_criacao).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      ))
                    )}
                  </TabsContent>
                  <TabsContent value="naolidos" className="m-0">
                    {notifications.filter((n) => !n.lida).length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        Tudo lido por aqui.
                      </div>
                    ) : (
                      notifications
                        .filter((n) => !n.lida)
                        .map((n) => (
                          <div
                            key={n.id}
                            className="p-4 border-b border-slate-50 text-sm bg-indigo-50/30 hover:bg-indigo-50/50"
                          >
                            <p className="font-semibold text-slate-900 mb-1">{n.titulo}</p>
                            <p className="text-slate-600 text-xs mb-2">{n.mensagem}</p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(n.data_criacao).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        ))
                    )}
                  </TabsContent>
                </div>
              </Tabs>
              <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl text-center">
                <Link
                  to="/notificacoes"
                  className="text-xs font-bold text-slate-500 hover:text-primary"
                >
                  Ver todas as notificações
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <CalendarX className="w-5 h-5" /> Cancelamentos Recentes
            </DialogTitle>
            <DialogDescription>
              Acompanhe os agendamentos que foram desmarcados recentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {cancellations.length === 0 ? (
              <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-xl border border-dashed">
                Nenhum cancelamento recente.
              </p>
            ) : (
              cancellations.map((c, idx) => (
                <div key={idx} className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-red-900 text-base">Paciente: {c.patientName}</p>
                  <p className="text-xs text-red-800 mt-1 font-medium bg-white/50 inline-block px-2 py-0.5 rounded">
                    Sessão de:{' '}
                    {new Date(c.date).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                  <div className="mt-3 bg-white p-3 rounded-lg border border-red-100">
                    <p className="text-xs text-red-400 uppercase font-bold tracking-wider mb-1">
                      Motivo
                    </p>
                    <p className="text-sm text-slate-700 italic">"{c.reason}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
