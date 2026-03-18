import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Brain } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Users,
  Wallet,
  Settings,
  PieChart,
  LayoutDashboard,
  Box,
  MessageSquare,
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Agenda', icon: Calendar, path: '/agenda' },
  { name: 'Pacientes', icon: Users, path: '/pacientes' },
  { name: 'Financeiro', icon: Wallet, path: '/carteira' },
  { name: 'Marketing & Testes', icon: MessageSquare, path: '/marketing' },
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

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <div className="lg:hidden">
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Brain className="w-5 h-5 text-white" />
          </div>
          Gestão<span className="text-indigo-600">Clínica</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 -mr-2 text-slate-600 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 rounded-md"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <nav className="relative bg-white w-4/5 max-w-sm h-full flex flex-col animate-slide-right shadow-2xl">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50">
              <span className="font-bold text-slate-800">Menu Principal</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
          </nav>
        </div>
      )}
    </div>
  )
}
