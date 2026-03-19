import { useEffect, useState } from 'react'
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
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

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
  const { user, signOut } = useAuth()
  const [clinic, setClinic] = useState({ name: '', logo: '' })

  useEffect(() => {
    if (!user) return

    const fetchClinic = async () => {
      const { data } = await supabase
        .from('usuarios')
        .select('nome_consultorio, logo_url')
        .eq('id', user.id)
        .single()
      if (data) {
        setClinic({ name: data.nome_consultorio || '', logo: data.logo_url || '' })
      }
    }
    fetchClinic()

    const channel = supabase
      .channel('sidebar_clinic')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'usuarios', filter: `id=eq.${user.id}` },
        (payload) => {
          setClinic({ name: payload.new.nome_consultorio || '', logo: payload.new.logo_url || '' })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 sticky top-0 hidden lg:flex">
      <div className="h-16 flex items-center px-6 bg-slate-950 font-bold text-white text-lg gap-3 tracking-tight">
        {clinic.logo ? (
          <img
            src={clinic.logo}
            alt="Logo da Clínica"
            className="w-8 h-8 rounded object-cover bg-white shadow-sm"
          />
        ) : (
          <Brain className="w-6 h-6 text-primary shrink-0" />
        )}
        <span className="truncate flex-1">
          {clinic.name || (
            <>
              Gestão<span className="text-primary">Consultório</span>
            </>
          )}
        </span>
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
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-slate-800 hover:text-white',
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-primary-foreground' : 'text-slate-400 group-hover:text-primary',
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-700 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            {clinic.name ? clinic.name.substring(0, 2).toUpperCase() : 'GC'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-white truncate">
              {clinic.name || 'Minha Clínica'}
            </p>
            <p
              className="text-xs text-slate-400 truncate hover:text-slate-300 transition-colors"
              onClick={signOut}
            >
              Sair da Conta
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
