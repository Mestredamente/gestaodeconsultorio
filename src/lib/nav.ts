import { LayoutDashboard, Calendar, Users, DollarSign, Settings } from 'lucide-react'

export const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]
