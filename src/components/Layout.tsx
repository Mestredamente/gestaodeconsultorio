import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Wallet,
  Activity,
  PackageSearch,
  BookOpenCheck,
  Brain,
  Briefcase,
  Megaphone,
  Video,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

const removeThemes = () => {
  document.documentElement.classList.remove(
    'theme-indigo',
    'theme-blue',
    'theme-emerald',
    'theme-rose',
    'theme-slate',
    'theme-pink',
    'theme-diamond',
    'theme-ruby',
  )
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [clinic, setClinic] = useState({ name: 'PsicManager', logo: '' })

  useEffect(() => {
    if (user) {
      supabase
        .from('usuarios')
        .select('nome_consultorio, logo_url, preferencias_dashboard')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setClinic({ name: data.nome_consultorio || 'PsicManager', logo: data.logo_url || '' })
            if (data.preferencias_dashboard?.theme) {
              removeThemes()
              document.documentElement.classList.add(data.preferencias_dashboard.theme)
            }
          }
        })

      const channel = supabase
        .channel('layout_changes')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'usuarios', filter: `id=eq.${user.id}` },
          (payload) => {
            const newName = payload.new.nome_consultorio || 'PsicManager'
            const newLogo = payload.new.logo_url || ''
            setClinic({ name: newName, logo: newLogo })
            if (payload.new.preferencias_dashboard?.theme) {
              removeThemes()
              document.documentElement.classList.add(payload.new.preferencias_dashboard.theme)
            }
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const menuItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/agenda', icon: CalendarIcon, label: 'Agenda' },
    { path: '/sala-virtual', icon: Video, label: 'Sala Virtual' },
    { path: '/pacientes', icon: Users, label: 'Pacientes' },
    { path: '/carteira', icon: Wallet, label: 'Financeiro' },
    { path: '/rh', icon: Briefcase, label: 'RH & Equipe' },
    { path: '/marketing', icon: Megaphone, label: 'Marketing' },
    { path: '/relatorios', icon: Activity, label: 'Relatórios' },
    { path: '/estoque', icon: PackageSearch, label: 'Estoque' },
    { path: '/supervisao', icon: BookOpenCheck, label: 'Supervisão' },
    { path: '/configuracoes', icon: SettingsIcon, label: 'Configurações' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary font-bold text-xl truncate max-w-[200px]">
          {clinic.logo ? (
            <img
              src={clinic.logo}
              alt="Logo"
              className="w-8 h-8 object-contain rounded-md shrink-0"
            />
          ) : (
            <Brain className="w-6 h-6 shrink-0" />
          )}
          <span className="truncate">{clinic.name}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-slate-600 hover:bg-slate-50 rounded-xl shrink-0"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-40 h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ease-in-out',
          isMobileMenuOpen
            ? 'translate-x-0 w-72'
            : '-translate-x-full md:translate-x-0 md:w-20 lg:w-72',
        )}
      >
        <div className="p-4 lg:p-6 flex items-center justify-center lg:justify-start gap-3 text-primary font-black text-2xl tracking-tight hidden md:flex">
          {clinic.logo ? (
            <img
              src={clinic.logo}
              alt="Logo"
              className="w-8 h-8 object-contain rounded-md shrink-0"
            />
          ) : (
            <Brain className="w-8 h-8 shrink-0" />
          )}
          <span className="truncate hidden lg:block">{clinic.name}</span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                title={item.label}
                className={cn(
                  'flex items-center gap-3 px-3 py-3.5 rounded-2xl font-bold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                  !isMobileMenuOpen && 'md:justify-center lg:justify-start',
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={cn('transition-all', !isMobileMenuOpen && 'md:hidden lg:block')}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            title="Sair da conta"
            className={cn(
              'flex items-center gap-3 px-3 py-3.5 w-full rounded-2xl font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors whitespace-nowrap',
              !isMobileMenuOpen && 'md:justify-center lg:justify-start',
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={cn('transition-all', !isMobileMenuOpen && 'md:hidden lg:block')}>
              Sair da conta
            </span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-full overflow-x-hidden min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
