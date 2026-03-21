import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Copy, Check, X, Video, Users, Loader2, Link2, Clock, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function VirtualRoom() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [appointments, setAppointments] = useState<any[]>([])
  const [waitingMap, setWaitingMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<any | null>(null)
  const [generatingLinkFor, setGeneratingLinkFor] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchAppointments = async () => {
      setLoading(true)
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      const { data, error } = await supabase
        .from('agendamentos')
        .select('*, pacientes(nome, hash_anamnese)')
        .eq('usuario_id', user.id)
        .eq('is_online', true)
        .in('status', ['agendado', 'confirmado'])
        .gte('data_hora', startOfDay)
        .lte('data_hora', endOfDay)
        .order('data_hora', { ascending: true })

      if (!error && data) {
        setAppointments(data)

        const aptIds = data.map((a) => a.id)
        if (aptIds.length > 0) {
          const { data: waitData } = await supabase
            .from('sala_espera')
            .select('agendamento_id, status')
            .in('agendamento_id', aptIds)

          if (waitData) {
            const map: Record<string, string> = {}
            waitData.forEach((w) => (map[w.agendamento_id] = w.status))
            setWaitingMap(map)

            const activeWait = waitData.find((w) => w.status === 'aprovado')
            if (activeWait && !activeSession) {
              const activeApt = data.find((a) => a.id === activeWait.agendamento_id)
              if (activeApt) setActiveSession(activeApt)
            }
          }
        }
      }
      setLoading(false)
    }

    fetchAppointments()
  }, [user])

  useEffect(() => {
    const channel = supabase
      .channel('sala_espera_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sala_espera' }, (payload) => {
        if (payload.new && (payload.new as any).agendamento_id) {
          const agendamento_id = (payload.new as any).agendamento_id
          const status = (payload.new as any).status
          setWaitingMap((prev) => ({
            ...prev,
            [agendamento_id]: status,
          }))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const copyAccessLink = () => {
    const link = `${window.location.origin}/portal`
    navigator.clipboard.writeText(link)
    toast({ title: 'Link de acesso geral copiado!' })
  }

  const generateAndCopySpecificLink = async (appointmentId: string) => {
    setGeneratingLinkFor(appointmentId)
    try {
      const { data, error } = await supabase.functions.invoke('gerar_link_sala_virtual', {
        body: { agendamento_id: appointmentId },
      })

      if (error) throw error

      if (data?.link) {
        navigator.clipboard.writeText(data.link)
        toast({
          title: 'Link seguro copiado!',
          description: 'O link expirará automaticamente após a sessão.',
        })

        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, link_sala_virtual: data.link } : apt,
          ),
        )
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao gerar link',
        description: err.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setGeneratingLinkFor(null)
    }
  }

  const handleApprove = async (apt: any) => {
    await supabase.from('sala_espera').upsert(
      {
        agendamento_id: apt.id,
        paciente_id: apt.paciente_id,
        status: 'aprovado',
      },
      { onConflict: 'agendamento_id' },
    )

    setWaitingMap((prev) => ({ ...prev, [apt.id]: 'aprovado' }))
    setActiveSession(apt)
    toast({
      title: 'Sessão iniciada',
      description: `Conectando com ${apt.pacientes?.nome || 'Paciente'}`,
    })
  }

  const handleReject = async (id: string) => {
    await supabase.from('sala_espera').update({ status: 'rejeitado' }).eq('agendamento_id', id)
    setWaitingMap((prev) => ({ ...prev, [id]: 'rejeitado' }))
    if (activeSession?.id === id) setActiveSession(null)
    toast({ title: 'Entrada rejeitada' })
  }

  const handleEndSession = async () => {
    if (activeSession) {
      await supabase
        .from('sala_espera')
        .update({ status: 'finalizado' })
        .eq('agendamento_id', activeSession.id)
      setWaitingMap((prev) => ({ ...prev, [activeSession.id]: 'finalizado' }))
      setActiveSession(null)
      toast({ title: 'Sessão encerrada com sucesso' })
    }
  }

  const roomName = activeSession ? `PsicManager_${activeSession.id.replace(/-/g, '')}` : ''

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Video className="w-8 h-8" />
            </div>
            Sala Virtual
          </h1>
          <p className="text-slate-500 mt-1 text-base">
            Controle de acesso em tempo real e videoconferência segura.
          </p>
        </div>
        <Button
          onClick={copyAccessLink}
          className="gap-2 shadow-sm h-12 px-6 rounded-xl"
          variant="outline"
        >
          <Copy className="w-4 h-4" /> Link do Portal Geral
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2 px-1">
            <Users className="w-5 h-5 text-primary" /> Sala de Espera / Agendados
          </h2>

          {loading ? (
            <div className="flex justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : appointments.length === 0 ? (
            <Card className="shadow-sm border-dashed border-slate-200 bg-slate-50/50 rounded-2xl">
              <CardContent className="p-12 text-center text-slate-500 font-medium">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                Nenhuma sessão online agendada para hoje.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {appointments.map((apt) => {
                const patientName = apt.pacientes?.nome || 'Desconhecido'
                const time = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const waitStatus = waitingMap[apt.id]
                const isSelected = activeSession?.id === apt.id
                const isWaiting = waitStatus === 'aguardando'
                const isGenerating = generatingLinkFor === apt.id

                return (
                  <Card
                    key={apt.id}
                    className={`shadow-sm transition-all rounded-2xl overflow-hidden ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : isWaiting ? 'border-amber-300 bg-amber-50/30 ring-1 ring-amber-200' : 'border-slate-100 bg-white hover:border-primary/30'}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-slate-800 text-lg">{patientName}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                            <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                              {time}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{apt.status}</span>
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {apt.is_online && (
                            <Badge
                              variant="outline"
                              className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1"
                            >
                              <Video className="w-3 h-3" /> Online
                            </Badge>
                          )}
                          {isWaiting && (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1 animate-pulse shadow-sm">
                              <Clock className="w-3 h-3" /> Na sala
                            </Badge>
                          )}
                        </div>
                      </div>

                      {waitStatus !== 'finalizado' && (
                        <div className="flex gap-2">
                          <Button
                            className={`flex-1 gap-2 h-10 rounded-xl ${isWaiting ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md' : ''}`}
                            onClick={() => handleApprove(apt)}
                            disabled={isSelected}
                            variant={isWaiting ? 'default' : 'secondary'}
                          >
                            <Check className="w-4 h-4" />{' '}
                            {isSelected
                              ? 'Em Sessão'
                              : isWaiting
                                ? 'Permitir Entrada'
                                : 'Iniciar Sessão'}
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2 px-4 h-10 rounded-xl"
                            onClick={() => handleReject(apt.id)}
                            disabled={isSelected || waitStatus === 'rejeitado'}
                          >
                            <X className="w-4 h-4" /> Rejeitar
                          </Button>
                        </div>
                      )}

                      {waitStatus === 'finalizado' && (
                        <div className="bg-slate-100 text-slate-500 text-center py-2 rounded-xl text-sm font-medium border border-slate-200">
                          Sessão Finalizada
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        className="w-full mt-3 text-sm h-9 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl font-medium transition-colors"
                        onClick={() => generateAndCopySpecificLink(apt.id)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Link2 className="w-4 h-4 mr-2" />
                        )}
                        Gerar Link Seguro e Copiar
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-xl border-slate-200 h-[600px] lg:h-[800px] overflow-hidden flex flex-col rounded-2xl ring-1 ring-slate-900/5">
            <CardHeader className="bg-slate-900 text-white p-5 flex flex-row items-center justify-between border-b border-slate-800">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg ring-1 ring-emerald-500/30">
                  <Video className="w-5 h-5 text-emerald-400" />
                </div>
                {activeSession ? `Sessão: ${activeSession.pacientes?.nome}` : 'Videoconferência'}
              </CardTitle>
              {activeSession && (
                <Button
                  variant="destructive"
                  onClick={handleEndSession}
                  className="rounded-xl font-bold px-6 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 gap-2"
                >
                  <LogOut className="w-4 h-4" /> Encerrar Sessão
                </Button>
              )}
            </CardHeader>
            <div className="flex-1 bg-slate-950 relative flex items-center justify-center">
              {!activeSession ? (
                <div className="text-center p-8 animate-fade-in-up">
                  <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700 shadow-xl">
                    <Video className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Nenhuma Sessão Ativa</h3>
                  <p className="text-slate-400 max-w-md mx-auto text-lg">
                    Acompanhe os pacientes na lista ao lado. O indicador{' '}
                    <strong className="text-amber-400">Na sala</strong> aparecerá quando o paciente
                    acessar o link. Clique em <strong>Permitir Entrada</strong> para iniciar.
                  </p>
                </div>
              ) : (
                <iframe
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  src={`https://meet.jit.si/${roomName}`}
                  className="w-full h-full border-0 absolute inset-0 animate-fade-in"
                  style={{ minHeight: '100%' }}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
