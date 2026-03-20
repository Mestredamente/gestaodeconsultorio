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
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const coreItems = navItems.slice(0, 4)

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t flex items-center justify-around p-2 pb-safe lg:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {coreItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path !== '/' && location.pathname.startsWith(item.path))
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center p-2 rounded-xl min-w-[64px] transition-colors',
              isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
            )}
          >
            <item.icon className={cn('w-6 h-6 mb-1', isActive && 'fill-primary/10')} />
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
              isOpen ? 'text-primary' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
            )}
          >
            <Menu className={cn('w-6 h-6 mb-1', isOpen && 'fill-primary/10')} />
            <span className="text-[10px] font-medium truncate max-w-[60px] text-center">Mais</span>
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[85vw] max-w-sm p-0 flex flex-col bg-card z-50 border-l border-border"
        >
          <SheetHeader className="h-16 justify-center px-6 border-b border-border bg-muted/50">
            <SheetTitle className="text-foreground text-left">Menu Principal</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
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
        </SheetContent>
      </Sheet>
    </nav>
  )
}
