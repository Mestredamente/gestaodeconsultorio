import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Users,
  PieChart,
  Settings,
  LogOut,
  Menu,
  Activity,
  User,
  PackageSearch,
  FileText,
  Bell,
  Megaphone,
  BookOpenCheck,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'

export default function Layout() {
  const { pathname } = useLocation()
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [clinicName, setClinicName] = useState('Consultório')
  const [logoUrl, setLogoUrl] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [userRole, setUserRole] = useState('admin')
  const [permissions, setPermissions] = useState({
    agenda: true,
    pacientes: true,
    prontuarios: true,
    financeiro: true,
    relatorios: true,
  })

  useEffect(() => {
    if (user) {
      supabase
        .from('usuarios')
        .select('nome_consultorio, logo_url, role, parent_id')
        .eq('id', user.id)
        .single()
        .then(async ({ data }) => {
          if (data) {
            setClinicName(data.nome_consultorio || 'Consultório')
            setLogoUrl(data.logo_url || '')
            setUserRole(data.role || 'admin')

            let parentId = user.id
            if (data.parent_id) parentId = data.parent_id

            if (data.role !== 'admin') {
              const { data: parentData } = await supabase
                .from('usuarios')
                .select('preferencias_dashboard')
                .eq('id', parentId)
                .single()
              const rolePerms = parentData?.preferencias_dashboard?.role_permissions
              if (rolePerms && rolePerms[data.role]) {
                setPermissions(rolePerms[data.role])
              } else if (data.role === 'recepcao') {
                setPermissions({
                  agenda: true,
                  pacientes: true,
                  prontuarios: false,
                  financeiro: false,
                  relatorios: false,
                })
              }
            }
          }
        })

      supabase
        .from('notificacoes')
        .select('id', { count: 'exact' })
        .eq('usuario_id', user.id)
        .eq('lida', false)
        .limit(0)
        .then(({ count, error }) => {
          if (error) {
            console.error('Erro ao buscar total de notificações:', error)
          } else if (count !== null) {
            setUnreadCount(count)
          }
        })
        .catch((err) => console.error('Erro inesperado ao buscar notificações:', err))

      const sub = supabase
        .channel('notificacoes_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificacoes',
            filter: `usuario_id=eq.${user.id}`,
          },
          () => {
            setUnreadCount((prev) => prev + 1)
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(sub)
      }
    }
  }, [user])

  const menuItems = [
    { icon: Activity, label: 'Dashboard', path: '/' },
    ...(permissions.agenda ? [{ icon: Calendar, label: 'Agenda', path: '/agenda' }] : []),
    ...(permissions.pacientes ? [{ icon: Users, label: 'Pacientes', path: '/pacientes' }] : []),
    ...(permissions.financeiro ? [{ icon: PieChart, label: 'Financeiro', path: '/carteira' }] : []),
    ...(permissions.relatorios
      ? [{ icon: FileText, label: 'Relatórios', path: '/relatorios' }]
      : []),
    { icon: Megaphone, label: 'Marketing', path: '/marketing' },
    ...(permissions.prontuarios
      ? [{ icon: BookOpenCheck, label: 'Supervisão', path: '/supervisao' }]
      : []),
    { icon: PackageSearch, label: 'Estoque', path: '/estoque' },
  ]

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false
    return pathname.startsWith(path)
  }

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-100 p-4 min-h-[70px] flex justify-center">
            <div className="flex items-center gap-3 overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-8 h-8 rounded-md object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0 font-bold">
                  {clinicName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-slate-800 truncate text-sm">{clinicName}</span>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarMenu className="gap-1.5">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.path)}
                      tooltip={item.label}
                      className="rounded-md"
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-100 p-3 space-y-2">
            <SidebarMenu>
              {userRole === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/configuracoes')}
                    tooltip="Configurações"
                  >
                    <Link to="/configuracoes">
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-slate-500 md:hidden" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-slate-800">App Gestão Clínica</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/notificacoes')}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                title="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-semibold text-slate-700">{user?.email}</span>
                <span className="text-xs text-slate-500 capitalize">{userRole}</span>
              </div>
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 w-full">
            <div className="max-w-7xl mx-auto h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
