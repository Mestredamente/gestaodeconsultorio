import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export default function Header() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [clinic, setClinic] = useState({ name: '', logo: '' })

  useEffect(() => {
    if (!user) return
    const fetchNotifs = async () => {
      const { count } = await supabase
        .from('notificacoes')
        .select('id', { count: 'exact' })
        .eq('usuario_id', user.id)
        .eq('lida', false)
      setUnreadCount(count || 0)
    }
    fetchNotifs()

    const fetchClinic = async () => {
      const { data } = await supabase
        .from('usuarios')
        .select('nome_consultorio, logo_url')
        .eq('id', user.id)
        .single()
      if (data) setClinic({ name: data.nome_consultorio || '', logo: data.logo_url || '' })
    }
    fetchClinic()

    const sub = supabase
      .channel('header_notifs_layout')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notificacoes', filter: `usuario_id=eq.${user.id}` },
        () => fetchNotifs(),
      )
      .subscribe()

    const clinicSub = supabase
      .channel('header_clinic_layout')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'usuarios', filter: `id=eq.${user.id}` },
        (payload) => {
          setClinic({ name: payload.new.nome_consultorio || '', logo: payload.new.logo_url || '' })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
      supabase.removeChannel(clinicSub)
    }
  }, [user])

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm lg:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        {clinic.logo ? (
          <img
            src={clinic.logo}
            alt="Logo"
            className="w-8 h-8 rounded-md object-contain bg-white shadow-sm border border-slate-100"
          />
        ) : (
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            {clinic.name ? clinic.name.substring(0, 2).toUpperCase() : 'C'}
          </div>
        )}
        <span className="font-bold text-slate-800 text-lg tracking-tight truncate max-w-[150px]">
          {clinic.name || 'Clínica'}
        </span>
      </div>

      <div className="hidden lg:block text-slate-500 text-sm font-medium">
        Bem-vindo ao seu painel de gestão
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Link
          to="/notificacoes"
          className="relative p-2 text-slate-500 hover:text-primary transition-colors hover:bg-slate-100 rounded-full"
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Link>
      </div>
    </header>
  )
}
