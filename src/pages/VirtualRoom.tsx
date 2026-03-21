import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Copy,
  Check,
  X,
  Video,
  Users,
  Loader2,
  Link2,
  LogOut,
  Camera,
  FileText,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import { generateWhatsAppLink } from '@/lib/whatsapp'

export default function VirtualRoom() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState<any[]>([])
  const [waitingMap, setWaitingMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<any | null>(null)
  const [generatingLinkFor, setGeneratingLinkFor] = useState<string | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  // Drawer / Notas State
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [initialNotesFetched, setInitialNotesFetched] = useState(false)

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [sessionType, setSessionType] = useState<'presencial' | 'online'>('online')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  const allTimeSlots = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ]

  const playAlertSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      const playBeep = (time: number, freq: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, time)
        gain.gain.setValueAtTime(0.1, time)
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1)
        osc.start(time)
        osc.stop(time + 0.1)
      }
      playBeep(ctx.currentTime, 880)
      playBeep(ctx.currentTime + 0.15, 1046.5)
    } catch (e) {
      console.error('Audio Context falhou', e)
    }
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchAppointments = async () => {
      setLoading(true)
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      const { data, error } = await supabase
        .from('agendamentos')
        .select('*, pacientes(nome, hash_anamnese, telefone)')
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

  // Real-time Patient Waitlist
  useEffect(() => {
    const channel = supabase
      .channel('sala_espera_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sala_espera' }, (payload) => {
        if (payload.new && (payload.new as any).agendamento_id) {
          const agendamento_id = (payload.new as any).agendamento_id
          const status = (payload.new as any).status

          setWaitingMap((prev) => {
            const oldStatus = prev[agendamento_id]
            if (status === 'aguardando' && oldStatus !== 'aguardando') {
              playAlertSound()
              toast({
                title: '🚨 Paciente na Sala de Espera!',
                description: 'Um novo paciente acabou de entrar na sala. Verifique a lista.',
                className: 'bg-amber-500 text-white border-none shadow-xl',
                duration: 6000,
              })
            }
            return { ...prev, [agendamento_id]: status }
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [playAlertSound, toast])

  // Local Media Init
  useEffect(() => {
    let stream: MediaStream | null = null
    const initMedia = async () => {
      if (!activeSession) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          setLocalStream(stream)
        } catch (err) {
          toast({
            title: 'Aviso de Permissão',
            description:
              'Não foi possível acessar a câmera ou microfone. Verifique as permissões do navegador.',
            variant: 'destructive',
          })
        }
      }
    }
    initMedia()
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop())
    }
  }, [activeSession, toast])

  const setupLocalVideo = useCallback(
    (element: HTMLVideoElement | null) => {
      if (element && localStream) {
        element.srcObject = localStream
      }
    },
    [localStream],
  )

  // Fetch initial notes
  useEffect(() => {
    if (activeSession) {
      const fetchProntuario = async () => {
        const { data } = await supabase
          .from('prontuarios')
          .select('nova_nota')
          .eq('paciente_id', activeSession.paciente_id)
          .maybeSingle()

        if (data) setNotes(data.nova_nota || '')
        setInitialNotesFetched(true)
      }
      fetchProntuario()
    } else {
      setNotes('')
      setInitialNotesFetched(false)
      setIsNotesOpen(false)
    }
  }, [activeSession])

  // Real-time Notes Sync
  useEffect(() => {
    if (!activeSession) return
    const channel = supabase
      .channel('prontuario_notes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'prontuarios',
          filter: `paciente_id=eq.${activeSession.paciente_id}`,
        },
        (payload) => {
          if (payload.new && payload.new.nova_nota !== undefined) {
            setNotes((prev) => {
              if (prev !== payload.new.nova_nota) return payload.new.nova_nota || ''
              return prev
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeSession])

  // Save Notes Debounce
  useEffect(() => {
    if (!initialNotesFetched || !activeSession) return
    const timeoutId = setTimeout(() => {
      saveNotes(notes)
    }, 3000)
    return () => clearTimeout(timeoutId)
  }, [notes, activeSession, initialNotesFetched])

  const saveNotes = async (text: string) => {
    if (!activeSession || !user) return
    const { data: prontuario } = await supabase
      .from('prontuarios')
      .select('id')
      .eq('paciente_id', activeSession.paciente_id)
      .maybeSingle()

    if (prontuario) {
      await supabase.from('prontuarios').update({ nova_nota: text }).eq('id', prontuario.id)
    } else {
      await supabase.from('prontuarios').insert({
        paciente_id: activeSession.paciente_id,
        usuario_id: user.id,
        nova_nota: text,
        historico_sessoes: [],
      })
    }
  }

  const compileNotes = async () => {
    if (!activeSession || !user) return
    const textToSave = notes.trim()

    const { data: prontuario } = await supabase
      .from('prontuarios')
      .select('id, historico_sessoes')
      .eq('paciente_id', activeSession.paciente_id)
      .maybeSingle()

    if (prontuario) {
      const history = Array.isArray(prontuario.historico_sessoes)
        ? prontuario.historico_sessoes
        : []
      let newHistory = history

      if (textToSave) {
        newHistory = [
          {
            data: new Date().toISOString(),
            evolucao: textToSave,
            agendamento_id: activeSession.id,
          },
          ...history,
        ]
      }

      await supabase
        .from('prontuarios')
        .update({ historico_sessoes: newHistory, nova_nota: '' })
        .eq('id', prontuario.id)
    }
  }

  // Load available slots for calendar
  useEffect(() => {
    if (!selectedDate || !user) {
      setAvailableSlots([])
      return
    }

    const start = new Date(selectedDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(selectedDate)
    end.setHours(23, 59, 59, 999)

    supabase
      .from('agendamentos')
      .select('data_hora')
      .eq('usuario_id', user.id)
      .gte('data_hora', start.toISOString())
      .lte('data_hora', end.toISOString())
      .in('status', ['agendado', 'confirmado'])
      .then(({ data }) => {
        const booked =
          data?.map((a) => {
            const d = new Date(a.data_hora)
            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
          }) || []

        setAvailableSlots(allTimeSlots.filter((t) => !booked.includes(t)))
      })
  }, [selectedDate, user])

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
      toast({ title: 'Erro ao gerar link', description: err.message, variant: 'destructive' })
    } finally {
      setGeneratingLinkFor(null)
    }
  }

  const handleApprove = async (apt: any) => {
    await supabase
      .from('sala_espera')
      .upsert(
        { agendamento_id: apt.id, paciente_id: apt.paciente_id, status: 'aprovado' },
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

  const finishProcess = async () => {
    await compileNotes()
    if (activeSession) {
      await supabase
        .from('sala_espera')
        .update({ status: 'finalizado' })
        .eq('agendamento_id', activeSession.id)
      setWaitingMap((prev) => ({ ...prev, [activeSession.id]: 'finalizado' }))
    }
    setActiveSession(null)
    setIsScheduleModalOpen(false)
    toast({
      title: 'Sessão finalizada com sucesso',
      description: 'Redirecionando para o painel...',
    })
    navigate('/')
  }

  const handleEndSessionClick = () => {
    if (activeSession) setIsScheduleModalOpen(true)
  }

  const handleConfirmSchedule = async () => {
    if (!selectedDate || !selectedTime || !activeSession || !user) return

    const [hour, minute] = selectedTime.split(':').map(Number)
    const dataHora = new Date(selectedDate)
    dataHora.setHours(hour, minute, 0, 0)

    const { error } = await supabase.from('agendamentos').insert({
      usuario_id: user.id,
      paciente_id: activeSession.paciente_id,
      data_hora: dataHora.toISOString(),
      is_online: sessionType === 'online',
      status: 'agendado',
      tipo_pagamento: activeSession.tipo_pagamento || 'particular',
      valor_total: activeSession.valor_total || 0,
    })

    if (!error) {
      const d = new Date(dataHora)
      const dateStr = d.toLocaleDateString('pt-BR')
      const msg = `Olá ${activeSession.pacientes?.nome || 'Paciente'}, sua próxima consulta foi agendada para ${dateStr} às ${selectedTime}! Acesse o portal do paciente: ${window.location.origin}/portal/${activeSession.pacientes?.hash_anamnese || ''}`

      if (activeSession.pacientes?.telefone) {
        const link = generateWhatsAppLink(activeSession.pacientes.telefone, msg)
        window.open(link, '_blank')
      }
      toast({ title: 'Próxima sessão agendada!' })
    } else {
      toast({ title: 'Erro ao agendar', variant: 'destructive' })
    }
    await finishProcess()
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
        {/* Waiting Room List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2 px-1">
            <Users className="w-5 h-5 text-primary" /> Sala de Espera
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
                    className={cn(
                      'shadow-sm transition-all rounded-2xl overflow-hidden relative',
                      isSelected && 'ring-2 ring-primary border-primary bg-primary/5',
                      isWaiting &&
                        !isSelected &&
                        'border-amber-400 bg-gradient-to-r from-amber-50 to-white ring-2 ring-amber-400/50 shadow-lg',
                      !isSelected &&
                        !isWaiting &&
                        'border-slate-100 bg-white hover:border-primary/30',
                    )}
                  >
                    {isWaiting && (
                      <div className="absolute inset-0 ring-4 ring-amber-400/20 rounded-2xl animate-pulse pointer-events-none" />
                    )}
                    <CardContent className="p-5 relative z-10">
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
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-transparent gap-1.5 shadow-md">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                              </span>
                              Aguardando
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
                        Gerar Link e Copiar
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Video Area */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl border-slate-200 h-[600px] lg:h-[800px] overflow-hidden flex flex-col rounded-2xl ring-1 ring-slate-900/5">
            <CardHeader className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 z-20 gap-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg ring-1 ring-emerald-500/30">
                  <Video className="w-5 h-5 text-emerald-400" />
                </div>
                {activeSession ? `Sessão: ${activeSession.pacientes?.nome}` : 'Videoconferência'}
              </CardTitle>
              {activeSession && (
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setIsNotesOpen(true)}
                    className="gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white w-full sm:w-auto"
                  >
                    <FileText className="w-4 h-4" /> Notas da Sessão
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleEndSessionClick}
                    className="rounded-xl font-bold px-6 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 gap-2 w-full sm:w-auto"
                  >
                    <LogOut className="w-4 h-4" /> Finalizar Sessão
                  </Button>
                </div>
              )}
            </CardHeader>
            <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden z-10">
              {!activeSession ? (
                <div className="w-full h-full relative flex flex-col items-center justify-center animate-fade-in">
                  {localStream ? (
                    <>
                      <video
                        ref={setupLocalVideo}
                        autoPlay
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md"
                      />
                      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center p-8 bg-slate-950/40 backdrop-blur-sm rounded-3xl border border-slate-800/50">
                        <div className="w-72 h-72 sm:w-[480px] sm:h-[360px] bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700/50 mb-8 relative">
                          <video
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover transform -scale-x-100"
                            ref={setupLocalVideo}
                          />
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <div className="bg-emerald-500/90 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-md flex items-center gap-2">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                              </span>
                              Câmera e Microfone Prontos
                            </div>
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
                          Pré-visualização Ativa
                        </h3>
                        <p className="text-slate-300 max-w-md mx-auto text-center text-lg leading-relaxed">
                          Tudo certo com seu áudio e vídeo. Acompanhe a lista ao lado e aguarde a
                          chegada do paciente.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8 animate-fade-in-up z-10">
                      <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700 shadow-xl">
                        <Camera className="w-10 h-10 text-slate-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Preparando Sala...</h3>
                      <p className="text-slate-400 max-w-md mx-auto text-lg">
                        Solicitando permissão de câmera e microfone para garantir que tudo esteja
                        perfeito.
                      </p>
                    </div>
                  )}
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

      {/* Notas Drawer */}
      <Sheet open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md flex flex-col h-full bg-white p-0 shadow-2xl"
        >
          <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-primary" />
              Notas da Sessão
            </SheetTitle>
            <SheetDescription>Anotações são salvas automaticamente.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 p-6 overflow-hidden flex flex-col">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Comece a digitar as notas do atendimento aqui..."
              className="flex-1 resize-none border-slate-200 focus-visible:ring-primary/20 text-base leading-relaxed p-4 h-full"
            />
          </div>
          <SheetFooter className="p-6 border-t border-slate-100 bg-slate-50/50">
            <Button
              onClick={() => {
                saveNotes(notes)
                setIsNotesOpen(false)
              }}
              className="w-full sm:w-auto"
            >
              <Check className="w-4 h-4 mr-2" /> Salvar e Fechar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Schedule Next Session Modal */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl overflow-hidden p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold">Agendar Próxima Sessão</DialogTitle>
            <DialogDescription className="text-base mt-2">
              A sessão com {activeSession?.pacientes?.nome} foi finalizada. Deseja já deixar o
              próximo encontro agendado?
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Selecione a Data</label>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 flex justify-center p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return date < today
                  }}
                  className="bg-transparent"
                />
              </div>
            </div>

            {selectedDate && (
              <div className="space-y-3 animate-fade-in">
                <label className="text-sm font-semibold text-slate-700">Horários Disponíveis</label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          'px-3 py-2 text-sm font-medium rounded-lg border transition-all',
                          selectedTime === time
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-primary/50 hover:bg-slate-50',
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                    Nenhum horário disponível nesta data.
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Tipo de Sessão</label>
              <div className="flex gap-4">
                <label
                  className={cn(
                    'flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all',
                    sessionType === 'online'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-slate-200 hover:bg-slate-50',
                  )}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value="online"
                    checked={sessionType === 'online'}
                    onChange={() => setSessionType('online')}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="font-medium text-slate-700">Online</span>
                </label>
                <label
                  className={cn(
                    'flex-1 flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all',
                    sessionType === 'presencial'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-slate-200 hover:bg-slate-50',
                  )}
                >
                  <input
                    type="radio"
                    name="tipo"
                    value="presencial"
                    checked={sessionType === 'presencial'}
                    onChange={() => setSessionType('presencial')}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="font-medium text-slate-700">Presencial</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-slate-300"
              onClick={finishProcess}
            >
              Pular
            </Button>
            <Button
              className="w-full sm:w-auto gap-2"
              disabled={!selectedDate || !selectedTime}
              onClick={handleConfirmSchedule}
            >
              <Check className="w-4 h-4" /> Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
