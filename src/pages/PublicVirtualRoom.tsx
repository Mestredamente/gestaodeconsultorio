import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Video, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function PublicVirtualRoom() {
  const { id, token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [valid, setValid] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [waitingStatus, setWaitingStatus] = useState<string | null>(null)

  useEffect(() => {
    let channel: any = null

    const validateToken = async () => {
      if (!id || !token) {
        setError('Link de acesso inválido ou incompleto.')
        setLoading(false)
        return
      }

      const { data: agendamento, error: fetchErr } = await supabase
        .from('agendamentos')
        .select(
          'sala_virtual_token, sala_virtual_token_valid_from, sala_virtual_token_expires_at, id, paciente_id',
        )
        .eq('id', id)
        .single()

      if (fetchErr || !agendamento) {
        setError('Agendamento não encontrado.')
        setLoading(false)
        return
      }

      if (agendamento.sala_virtual_token !== token) {
        setError('Token de acesso inválido.')
        setLoading(false)
        return
      }

      const now = new Date()
      const validFrom = new Date(agendamento.sala_virtual_token_valid_from)
      const expiresAt = new Date(agendamento.sala_virtual_token_expires_at)

      if (now < validFrom) {
        setError(
          `A sala virtual só estará disponível a partir de ${validFrom.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
        )
        setLoading(false)
        return
      }

      if (now > expiresAt) {
        setError('O link de acesso expirou. Por favor, solicite um novo link ao profissional.')
        setLoading(false)
        return
      }

      // Handle Waiting Room Logic
      const { data: waitData } = await supabase
        .from('sala_espera')
        .select('*')
        .eq('agendamento_id', id)
        .maybeSingle()

      if (waitData) {
        setWaitingStatus(waitData.status)
      } else {
        await supabase.from('sala_espera').insert({
          agendamento_id: id,
          paciente_id: agendamento.paciente_id,
          status: 'aguardando',
        })
        setWaitingStatus('aguardando')
      }

      setValid(true)
      setRoomName(`PsicManager_${agendamento.id.replace(/-/g, '')}`)
      setLoading(false)

      // Subscribe to real-time changes
      channel = supabase
        .channel(`wait_${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'sala_espera',
            filter: `agendamento_id=eq.${id}`,
          },
          (payload) => {
            setWaitingStatus(payload.new.status)
          },
        )
        .subscribe()
    }

    validateToken()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [id, token])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error || !valid) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900 border-slate-800">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Acesso Negado</h1>
            <p className="text-slate-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (waitingStatus === 'aguardando') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="w-28 h-28 bg-slate-900 rounded-full flex items-center justify-center mx-auto relative shadow-2xl">
            <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-ping"></div>
            <Clock className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Sala de Espera</h2>
          <p className="text-slate-400 max-w-md mx-auto text-lg leading-relaxed">
            O profissional foi notificado que você chegou. Aguarde um momento enquanto ele autoriza
            sua entrada na sala virtual.
          </p>
        </div>
      </div>
    )
  }

  if (waitingStatus === 'rejeitado' || waitingStatus === 'finalizado') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-5 animate-fade-in-up">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {waitingStatus === 'finalizado' ? 'Sessão Encerrada' : 'Acesso Indisponível'}
          </h2>
          <p className="text-slate-400 max-w-sm mx-auto">
            {waitingStatus === 'finalizado'
              ? 'Esta sessão já foi concluída pelo profissional.'
              : 'O profissional não pôde liberar sua entrada neste momento.'}
          </p>
        </div>
      </div>
    )
  }

  if (waitingStatus === 'aprovado') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col animate-fade-in">
        <header className="bg-slate-900 p-4 flex items-center gap-3 border-b border-slate-800">
          <div className="p-2 bg-emerald-500/20 rounded-lg shadow-inner">
            <Video className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-white font-medium">Sessão Online Segura</h1>
        </header>
        <main className="flex-1 relative">
          <iframe
            allow="camera *; microphone *; display-capture *; autoplay *; clipboard-read; clipboard-write; fullscreen *"
            allowFullScreen
            src={`https://meet.jit.si/${roomName}#config.disableDeepLinking=true&config.prejoinPageEnabled=false`}
            className="w-full h-full border-0 absolute inset-0"
            style={{ minHeight: '100%' }}
          />
        </main>
      </div>
    )
  }

  return null
}
