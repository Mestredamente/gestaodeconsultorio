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
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-100 sticky top-0 z-50">
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

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          <div className="p-6 flex items-center gap-3 text-primary font-black text-2xl tracking-tight hidden lg:flex">
            {clinic.logo ? (
              <img
                src={clinic.logo}
                alt="Logo"
                className="w-8 h-8 object-contain rounded-md shrink-0"
              />
            ) : (
              <Brain className="w-8 h-8 shrink-0" />
            )}
            <span className="truncate">{clinic.name}</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3.5 w-full rounded-2xl font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              Sair da conta
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-full overflow-x-hidden min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
