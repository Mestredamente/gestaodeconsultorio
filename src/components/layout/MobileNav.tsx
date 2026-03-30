import { Link, useLocation } from 'react-router-dom'
import { navItems } from '@/lib/nav'
import { cn } from '@/lib/utils'
import {
  Menu,
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useState, useEffect } from 'react'

export default function MobileNav() {
  const location = useLocation()

  const coreItems = [
    { name: 'Início', path: '/', icon: LayoutDashboard },
    { name: 'Agenda', path: '/agenda', icon: Calendar },
    { name: 'Pacientes', path: '/pacientes', icon: Users },
    { name: 'Carteira', path: '/carteira', icon: Wallet },
    { name: 'Contatos', path: '/contatos', icon: MessageSquare },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex items-center justify-around p-2 pb-safe md:hidden z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.04)] h-16">
      {coreItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path !== '/' && location.pathname.startsWith(item.path))
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full min-w-[60px] rounded-xl transition-all',
              isActive ? 'text-primary scale-105' : 'text-slate-400 hover:text-slate-600',
            )}
          >
            <div className={cn('p-1.5 rounded-xl transition-colors', isActive && 'bg-primary/10')}>
              <item.icon
                className={cn('w-6 h-6', isActive && 'fill-primary/10')}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </div>
            <span
              className={cn(
                'text-[10px] font-semibold mt-0.5',
                isActive ? 'text-primary' : 'text-slate-500',
              )}
            >
              {item.name}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
