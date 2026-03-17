import { useEffect, useState } from 'react'
import { Bell, Search, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function Header() {
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [avatarUrl, setAvatarUrl] = useState('')

  const handleSignOut = async () => {
    await signOut()
  }

  const fetchNotifications = async () => {
    if (!user) return
    const { data } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', user.id)
      .order('data_criacao', { ascending: false })
      .limit(10)

    if (data && data.length === 0) {
      const mockNotif = {
        usuario_id: user.id,
        titulo: 'Bem-vindo às Notificações!',
        mensagem: 'Aqui você receberá alertas importantes sobre sua clínica.',
        lida: false,
      }
      const { data: newNotif } = await supabase
        .from('notificacoes')
        .insert(mockNotif)
        .select()
        .single()
      if (newNotif) {
        setNotifications([newNotif])
        return
      }
    } else if (data) {
      setNotifications(data)
    }
  }

  const fetchUserProfile = async () => {
    if (!user) return
    const { data } = await supabase.from('usuarios').select('logo_url').eq('id', user.id).single()
    if (data?.logo_url) {
      setAvatarUrl(data.logo_url)
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchUserProfile()

    if (!user) return
    const subscription = supabase
      .channel('header_notificacoes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notificacoes', filter: `usuario_id=eq.${user.id}` },
        () => fetchNotifications(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user])

  const markAsRead = async (id: string) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, lida: true } : n)))
  }

  const unreadCount = notifications.filter((n) => !n.lida).length
  const userEmail = user?.email || 'usuario@clinica.io'
  const userInitial = userEmail.charAt(0).toUpperCase()

  return (
    <header className="h-16 bg-card/80 backdrop-blur-md border-b sticky top-0 z-10 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center md:hidden gap-2">
        <div className="p-1.5 bg-primary text-primary-foreground rounded-md">
          <span className="font-bold text-xs">C.io</span>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar pacientes ou consultas..."
          className="pl-9 bg-slate-50 border-transparent focus-visible:bg-white transition-colors rounded-full"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full text-slate-500 hover:bg-slate-100"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-fade-in"></span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="font-semibold text-slate-800">Notificações</h4>
              {unreadCount > 0 && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} novas
                </span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">Nenhuma notificação.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'p-4 flex gap-3 transition-colors cursor-pointer hover:bg-slate-50',
                        !n.lida ? 'bg-indigo-50/30' : '',
                      )}
                      onClick={() => !n.lida && markAsRead(n.id)}
                    >
                      <div className="mt-0.5">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full mt-1.5',
                            !n.lida ? 'bg-primary' : 'bg-transparent',
                          )}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p
                          className={cn(
                            'text-sm leading-none',
                            !n.lida ? 'font-semibold text-slate-900' : 'font-medium text-slate-700',
                          )}
                        >
                          {n.titulo}
                        </p>
                        <p className="text-xs text-slate-500 leading-snug">{n.mensagem}</p>
                        <p className="text-[10px] text-slate-400 pt-1">
                          {new Date(n.data_criacao).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(n.data_criacao).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {n.lida && <CheckCircle2 className="w-4 h-4 text-slate-300" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarImage src={avatarUrl} alt="Avatar do Usuário" className="object-cover" />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Minha Conta</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/configuracoes">Configurações</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleSignOut}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
