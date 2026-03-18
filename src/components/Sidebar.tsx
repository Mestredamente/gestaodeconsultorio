import { Link, useLocation } from 'react-router-dom'
import {
  Calendar,
  Users,
  Wallet,
  Settings,
  PieChart,
  LayoutDashboard,
  Box,
  Brain,
  Video,
  FileText,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Agenda', icon: Calendar, path: '/agenda' },
  { name: 'Pacientes', icon: Users, path: '/pacientes' },
  { name: 'Sessão Online', icon: Video, path: '/atendimento/nova' },
  { name: 'Financeiro', icon: Wallet, path: '/carteira' },
  { name: 'Estoque', icon: Box, path: '/estoque' },
  { name: 'Marketing & Testes', icon: MessageSquare, path: '/marketing' },
  { name: 'Relatórios', icon: PieChart, path: '/relatorios' },
  { name: 'Configurações', icon: Settings, path: '/configuracoes' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 sticky top-0 hidden lg:flex">
      <div className="h-16 flex items-center px-6 bg-slate-950 font-bold text-white text-lg gap-2 tracking-tight">
        <Brain className="w-6 h-6 text-indigo-400" />
        Gestão<span className="text-indigo-400">Clínica</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium',
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'hover:bg-slate-800 hover:text-white',
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400',
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-700 transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            GC
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Clínica Principal</p>
            <p className="text-xs text-slate-400 truncate">Plano Pro</p>
          </div>
        </div>
      </div>
    </div>
  )
}
