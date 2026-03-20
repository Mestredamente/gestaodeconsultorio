import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './layout/Sidebar'
import MobileNav from './layout/MobileNav'
import Header from './layout/Header'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

export default function Layout() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const applyTheme = (themeName: string) => {
      document.documentElement.classList.remove(
        'theme-indigo',
        'theme-blue',
        'theme-emerald',
        'theme-rose',
        'theme-slate',
      )
      document.documentElement.classList.add(`theme-${themeName}`)
    }

    const fetchTheme = async () => {
      const { data } = await supabase
        .from('usuarios')
        .select('preferencias_dashboard')
        .eq('id', user.id)
        .single()
      const theme = data?.preferencias_dashboard?.theme_color || 'indigo'
      applyTheme(theme)
    }
    fetchTheme()

    const channel = supabase
      .channel('theme_global')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'usuarios', filter: `id=eq.${user.id}` },
        (payload) => {
          const theme = payload.new.preferencias_dashboard?.theme_color || 'indigo'
          applyTheme(theme)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return (
    <div className="flex min-h-screen bg-slate-50/50 selection:bg-primary/20 selection:text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <MobileNav />
        <main className="flex-1 p-4 pb-24 lg:p-8 lg:pb-8 overflow-x-hidden max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
