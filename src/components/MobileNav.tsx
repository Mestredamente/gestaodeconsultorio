import { Link, useLocation } from 'react-router-dom'
import {
  Menu,
  Brain,
  LayoutDashboard,
  Calendar,
  Users,
  Wallet,
  Settings,
  PieChart,
  Box,
  MessageSquare,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Agenda', icon: Calendar, path: '/agenda' },
  { name: 'Pacientes', icon: Users, path: '/pacientes' },
  { name: 'Financeiro', icon: Wallet, path: '/carteira' },
  { name: 'Estoque', icon: Box, path: '/estoque' },
  { name: 'Marketing', icon: MessageSquare, path: '/marketing' },
  { name: 'Relatórios', icon: PieChart, path: '/relatorios' },
  { name: 'Configurações', icon: Settings, path: '/configuracoes' },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const coreItems = navItems.slice(0, 3)

  return (
    <div className="lg:hidden">
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          Gestão<span className="text-indigo-600">Consultório</span>
        </div>
      </div>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex items-center justify-around p-2 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {coreItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'flex flex-col items-center p-2 rounded-xl min-w-[64px] transition-colors',
                isActive
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
              )}
            >
              <item.icon className={cn('w-6 h-6 mb-1', isActive && 'fill-indigo-600/10')} />
              <span className="text-[10px] font-medium truncate max-w-[60px] text-center">
                {item.name}
              </span>
            </Link>
          )
        })}

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                'flex flex-col items-center p-2 rounded-xl min-w-[64px] transition-colors outline-none',
                isOpen
                  ? 'text-indigo-600'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
              )}
            >
              <Menu className={cn('w-6 h-6 mb-1', isOpen && 'fill-indigo-600/10')} />
              <span className="text-[10px] font-medium truncate max-w-[60px] text-center">
                Mais
              </span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[85vw] max-w-sm p-0 flex flex-col z-50 border-l border-slate-200"
          >
            <SheetHeader className="h-16 justify-center px-6 border-b border-slate-100 bg-slate-50/50">
              <SheetTitle className="text-slate-800 text-left">Menu Principal</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <item.icon
                      className={cn('w-5 h-5', isActive ? 'text-indigo-600' : 'text-slate-400')}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}
