import {
  LayoutDashboard,
  Calendar,
  Users,
  Wallet,
  Settings,
  FileBarChart,
  Package,
  ShieldAlert,
} from 'lucide-react'

export const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Carteira', href: '/carteira', icon: Wallet },
  { name: 'Relatórios', href: '/relatorios', icon: FileBarChart },
  { name: 'Estoque', href: '/estoque', icon: Package },
  { name: 'Logs', href: '/logs', icon: ShieldAlert },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]
