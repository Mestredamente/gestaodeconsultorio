import { LayoutDashboard, Calendar, Users, Wallet, Settings } from 'lucide-react'

export const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Carteira', href: '/carteira', icon: Wallet },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]
