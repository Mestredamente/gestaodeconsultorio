import {
  LayoutDashboard,
  Calendar,
  Users,
  Wallet,
  Settings,
  PieChart,
  Box,
  MessageSquare,
  Video,
  ShieldAlert,
} from 'lucide-react'

export const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Agenda', path: '/agenda', icon: Calendar },
  { name: 'Pacientes', path: '/pacientes', icon: Users },
  { name: 'Sessão Online', path: '/atendimento/nova', icon: Video },
  { name: 'Financeiro', path: '/carteira', icon: Wallet },
  { name: 'Estoque', path: '/estoque', icon: Box },
  { name: 'Marketing', path: '/marketing', icon: MessageSquare },
  { name: 'Relatórios', path: '/relatorios', icon: PieChart },
  { name: 'Logs', path: '/logs', icon: ShieldAlert },
  { name: 'Configurações', path: '/configuracoes', icon: Settings },
]
