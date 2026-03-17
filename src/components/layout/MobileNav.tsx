import { Link, useLocation } from 'react-router-dom'
import { navItems } from '@/lib/nav'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const location = useLocation()
  // Only show first 4 items on mobile to prevent crowding
  const mobileItems = navItems.slice(0, 4)

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t flex items-center justify-around p-2 pb-safe md:hidden z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {mobileItems.map((item) => {
        const isActive =
          location.pathname === item.href ||
          (item.href !== '/' && location.pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex flex-col items-center p-2 rounded-xl min-w-[64px] transition-colors',
              isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
            )}
          >
            <item.icon className={cn('w-6 h-6 mb-1', isActive && 'fill-primary/10')} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
