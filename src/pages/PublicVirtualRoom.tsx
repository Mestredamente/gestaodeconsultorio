import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Loader2, Video, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function PublicVirtualRoom() {
  const { id, token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [valid, setValid] = useState(false)
  const [roomName, setRoomName] = useState('')

  useEffect(() => {
    const validateToken = async () => {
      if (!id || !token) {
        setError('Link de acesso inválido ou incompleto.')
        setLoading(false)
        return
      }

      const { data: agendamento, error: fetchErr } = await supabase
        .from('agendamentos')
        .select(
          'sala_virtual_token, sala_virtual_token_valid_from, sala_virtual_token_expires_at, id',
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

      setValid(true)
      setRoomName(`PsicManager_${agendamento.id.replace(/-/g, '')}`)
      setLoading(false)
    }

    validateToken()
  }, [id, token])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !valid) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-slate-200">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Acesso Negado</h1>
            <p className="text-slate-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="bg-slate-900 p-4 flex items-center gap-3 border-b border-slate-800">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Video className="w-5 h-5 text-emerald-400" />
        </div>
        <h1 className="text-white font-medium">Sessão Online</h1>
      </header>
      <main className="flex-1 relative">
        <iframe
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          src={`https://meet.jit.si/${roomName}`}
          className="w-full h-full border-0 absolute inset-0"
          style={{ minHeight: '100%' }}
        />
      </main>
    </div>
  )
}
