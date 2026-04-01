import { Link, useLocation } from 'react-router-dom'
import {
  CalendarDays,
  Users,
  Wallet,
  Settings as SettingsIcon,
  BarChart3,
  Video,
  Database,
  Megaphone,
  BriefcaseMedical,
  Users2,
  Stethoscope,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { ScrollArea } from '@/components/ui/scroll-area'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: BarChart3 },
  { path: '/agenda', label: 'Agenda', icon: CalendarDays },
  { path: '/sala-virtual', label: 'Sala Virtual', icon: Video, badge: 'Novo' },
  { path: '/pacientes', label: 'Pacientes', icon: Users },
  { path: '/carteira', label: 'Carteira', icon: Wallet },
]

const TOOLS_ITEMS = [
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { path: '/marketing', label: 'Marketing', icon: Megaphone },
  { path: '/rh', label: 'Recursos Humanos', icon: Users2 },
  { path: '/estoque', label: 'Estoque', icon: Database },
  { path: '/supervisao', label: 'Supervisão', icon: BriefcaseMedical },
]

const SYSTEM_ITEMS = [
  { path: '/configuracoes', label: 'Ajustes', icon: SettingsIcon },
  { path: '/logs', label: 'Auditoria', icon: Database },
]

export default function Sidebar() {
  const location = useLocation()
  const { signOut } = useAuth()

  return (
    <aside className="w-[60px] md:w-[80px] lg:w-[260px] bg-white border-r border-slate-200 flex flex-col transition-all duration-300 h-screen sticky top-0 shrink-0 z-50">
      <div className="h-16 px-4 flex items-center border-b border-slate-100 justify-center lg:justify-start shrink-0">
        <Link
          to="/"
          className="flex items-center justify-center lg:justify-start gap-3 w-full hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm shrink-0">
            <Stethoscope className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800 hidden lg:block truncate">
            PsicoGestor
          </span>
        </Link>
      </div>

      <ScrollArea className="flex-1 py-6">
        <div className="px-3 lg:px-4 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 lg:px-3 hidden lg:block">
              Gestão Clínica
            </h3>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-center lg:justify-start h-12 lg:h-11 rounded-xl transition-all group relative',
                        isActive
                          ? 'bg-primary/10 text-primary font-bold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium',
                      )}
                      title={item.label}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 lg:mr-3 shrink-0',
                          isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600',
                        )}
                      />
                      <span className="hidden lg:block truncate">{item.label}</span>
                      {item.badge && (
                        <span className="hidden lg:flex absolute right-3 items-center justify-center px-1.5 h-5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 lg:px-3 hidden lg:block">
              Ferramentas Extras
            </h3>
            <nav className="space-y-1">
              {TOOLS_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-center lg:justify-start h-12 lg:h-11 rounded-xl transition-all group',
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-bold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium',
                      )}
                      title={item.label}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 lg:mr-3 shrink-0',
                          isActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600',
                        )}
                      />
                      <span className="hidden lg:block truncate">{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2 lg:px-3 hidden lg:block">
              Sistema
            </h3>
            <nav className="space-y-1">
              {SYSTEM_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-center lg:justify-start h-12 lg:h-11 rounded-xl transition-all group',
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-bold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium',
                      )}
                      title={item.label}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 lg:mr-3 shrink-0',
                          isActive ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600',
                        )}
                      />
                      <span className="hidden lg:block truncate">{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </ScrollArea>

      <div className="p-3 lg:p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
        <Link to="/planos">
          <Button
            variant="ghost"
            className="w-full justify-center lg:justify-between h-12 lg:h-11 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold mb-2 group"
            title="Meu Plano"
          >
            <span className="hidden lg:flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Plano Pro
            </span>
            <span className="lg:hidden text-indigo-500">
              <ChevronRight className="w-5 h-5" />
            </span>
            <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 hidden lg:block shrink-0" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-center lg:justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl h-12 lg:h-11 font-semibold group"
          onClick={() => signOut()}
          title="Sair"
        >
          <LogOut className="w-5 h-5 lg:mr-2 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="hidden lg:block">Sair</span>
        </Button>
      </div>
    </aside>
  )
}
