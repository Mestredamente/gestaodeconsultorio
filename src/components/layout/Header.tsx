import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, CalendarX, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

export default function Header() {
  const { user } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [unreadCount, setUnreadCount] = useState(0)
  const [clinic, setClinic] = useState({ name: '', logo: '' })

  const [unreadCancelCount, setUnreadCancelCount] = useState(0)
  const [cancellations, setCancellations] = useState<any[]>([])
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchNotifs = async () => {
      try {
        const { count, error } = await supabase
          .from('notificacoes')
          .select('id', { count: 'exact' })
          .eq('usuario_id', user.id)
          .eq('lida', false)
          .limit(0)

        if (error) {
          console.error('Erro ao buscar total de notificações:', error)
          return
        }
        setUnreadCount(count || 0)
      } catch (err) {
        console.error('Erro inesperado ao buscar notificações:', err)
      }
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

    const cancelSub = supabase
      .channel('header_cancellations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agendamentos',
          filter: `usuario_id=eq.${user.id}`,
        },
        async (payload: any) => {
          if (payload.new.status === 'desmarcou') {
            // Check if it was already desmarcou to avoid duplicate events
            if (payload.old && payload.old.status === 'desmarcou') return

            setCancellations((prev) => {
              if (prev.some((c) => c.id === payload.new.id)) return prev

              // Fetch patient name asynchronously
              supabase
                .from('pacientes')
                .select('nome')
                .eq('id', payload.new.paciente_id)
                .single()
                .then(({ data }) => {
                  const newCancel = {
                    id: payload.new.id,
                    patientName: data?.nome || 'Paciente',
                    date: payload.new.data_hora,
                    reason:
                      payload.new.motivo_cancelamento ||
                      payload.new.justificativa_falta ||
                      'Motivo não informado',
                  }

                  setCancellations((curr) => {
                    if (curr.some((c) => c.id === newCancel.id)) return curr
                    setUnreadCancelCount((cnt) => cnt + 1)

                    toast({
                      title: 'Agendamento Cancelado',
                      description: `${newCancel.patientName} cancelou a sessão. Motivo: ${newCancel.reason}`,
                      variant: 'destructive',
                    })

                    return [newCancel, ...curr]
                  })
                })

              return prev
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
      supabase.removeChannel(clinicSub)
      supabase.removeChannel(cancelSub)
    }
  }, [user])

  // In mobile, we don't render this header (Layout has its own).
  // But just in case this is used anywhere else in desktop:
  if (isMobile) return null

  return (
    <>
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

        <div className="hidden lg:flex items-center gap-2 text-slate-500 text-sm font-medium">
          {location.pathname !== '/' && (
            <button
              onClick={() => navigate(-1)}
              className="mr-2 p-1 hover:bg-slate-100 rounded-md transition-colors"
              title="Voltar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <span>Bem-vindo ao seu painel de gestão</span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => {
              setIsCancelModalOpen(true)
              setUnreadCancelCount(0)
            }}
            className="relative p-2.5 text-slate-500 hover:text-red-600 transition-colors hover:bg-red-50 rounded-xl"
            title="Cancelamentos Recentes"
          >
            <CalendarX className="w-5 h-5" />
            {unreadCancelCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          <Link
            to="/notificacoes"
            className="relative p-2.5 text-slate-500 hover:text-primary transition-colors hover:bg-slate-100 rounded-xl"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </Link>
        </div>
      </header>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <CalendarX className="w-5 h-5" /> Cancelamentos Recentes
            </DialogTitle>
            <DialogDescription>
              Acompanhe os agendamentos que foram desmarcados recentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {cancellations.length === 0 ? (
              <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-xl border border-dashed">
                Nenhum cancelamento recente.
              </p>
            ) : (
              cancellations.map((c, idx) => (
                <div key={idx} className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm">
                  <p className="font-bold text-red-900 text-base">Paciente: {c.patientName}</p>
                  <p className="text-xs text-red-800 mt-1 font-medium bg-white/50 inline-block px-2 py-0.5 rounded">
                    Sessão de:{' '}
                    {new Date(c.date).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                  <div className="mt-3 bg-white p-3 rounded-lg border border-red-100">
                    <p className="text-xs text-red-400 uppercase font-bold tracking-wider mb-1">
                      Motivo
                    </p>
                    <p className="text-sm text-slate-700 italic">"{c.reason}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
