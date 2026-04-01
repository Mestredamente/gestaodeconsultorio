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
import { ScrollArea } from '@/components/ui/scroll-area'

export default function MobileNav() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const coreItems = [
    { name: 'Início', path: '/', icon: LayoutDashboard },
    { name: 'Agenda', path: '/agenda', icon: Calendar },
    { name: 'Sala Virtual', path: '/sala-virtual', icon: Video },
    { name: 'Pacientes', path: '/pacientes', icon: Users },
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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className={cn(
              'flex flex-col items-center justify-center w-full h-full min-w-[60px] rounded-xl transition-all text-slate-400 hover:text-slate-600',
            )}
          >
            <div className="p-1.5 rounded-xl transition-colors">
              <Menu className="w-6 h-6" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-semibold mt-0.5 text-slate-500">Menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] p-0 flex flex-col">
          <SheetHeader className="p-6 border-b border-slate-100 text-left">
            <SheetTitle className="text-xl font-bold">Menu Completo</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <item.icon
                      className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-slate-400')}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
