import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { navItems } from '@/lib/nav'
import { Activity } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const [clinic, setClinic] = useState({ name: 'Clínica.io', logo: '' })

  useEffect(() => {
    if (!user) return

    const fetchClinic = async () => {
      const { data } = await supabase
        .from('usuarios')
        .select('nome_consultorio, logo_url')
        .eq('id', user.id)
        .single()
      if (data)
        setClinic({ name: data.nome_consultorio || 'Clínica.io', logo: data.logo_url || '' })
    }

    fetchClinic()

    const sub = supabase
      .channel('sidebar_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'usuarios', filter: `id=eq.${user.id}` },
        (payload) => {
          setClinic({
            name: payload.new.nome_consultorio || 'Clínica.io',
            logo: payload.new.logo_url || '',
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [user])

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-card/80 backdrop-blur-xl border-r hidden md:flex flex-col z-20 shadow-sm">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        {clinic.logo ? (
          <img
            src={clinic.logo}
            alt="Logo da Clínica"
            className="w-8 h-8 rounded-md object-contain bg-white shadow-sm border border-slate-100"
          />
        ) : (
          <div className="p-2 bg-primary text-primary-foreground rounded-lg shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
        )}
        <span
          className="font-semibold text-lg text-slate-800 tracking-tight truncate"
          title={clinic.name}
        >
          {clinic.name}
        </span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-primary' : 'text-slate-400')} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-2">Suporte</p>
          <a href="#" className="text-sm text-primary hover:underline">
            Central de Ajuda
          </a>
        </div>
      </div>
    </aside>
  )
}
