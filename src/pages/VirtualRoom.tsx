import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  Video,
  FileText,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  CheckCircle,
  CalendarPlus,
  Clock,
  Play,
  Settings,
  ArrowLeft,
  RefreshCcw,
  Volume2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function VirtualRoom() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [activeSession, setActiveSession] = useState<any | null>(null)

  // Dispositivos state
  const [inDeviceTest, setInDeviceTest] = useState(false)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string>('')
  const [selectedAudio, setSelectedAudio] = useState<string>('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [deviceError, setDeviceError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Media controls
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  // Notes state
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const notesRef = useRef(notes)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Finish session state
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false)
  const [nextDate, setNextDate] = useState('')
  const [nextTime, setNextTime] = useState('')
  const [nextType, setNextType] = useState('online')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [isScheduling, setIsScheduling] = useState(false)

  useEffect(() => {
    fetchTodayAppointments()
  }, [user])

  const fetchTodayAppointments = async () => {
    if (!user) return
    setLoading(true)
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const { data } = await supabase
      .from('agendamentos')
      .select('*, pacientes(nome, telefone, hash_anamnese)')
      .eq('usuario_id', user.id)
      .in('status', ['agendado', 'confirmado'])
      .gte('data_hora', startOfDay.toISOString())
      .lte('data_hora', endOfDay.toISOString())
      .order('data_hora')

    if (data) setAppointments(data)
    setLoading(false)
  }

  const prepareSession = async (apt: any) => {
    setActiveSession(apt)
    setInDeviceTest(true)
    setDeviceError(null)

    try {
      // Pedir permissão inicial para garantir que enumerateDevices retorne os rótulos reais
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoInput = devices.filter((device) => device.kind === 'videoinput')
      const audioInput = devices.filter((device) => device.kind === 'audioinput')

      setVideoDevices(videoInput)
      setAudioDevices(audioInput)

      if (videoInput.length > 0) setSelectedVideo(videoInput[0].deviceId)
      if (audioInput.length > 0) setSelectedAudio(audioInput[0].deviceId)

      // Libera a câmera do stream temporário
      tempStream.getTracks().forEach((t) => t.stop())
    } catch (err: any) {
      console.error('Permissão de dispositivos negada', err)
      setDeviceError(
        'Acesso à câmera ou microfone negado. Por favor, libere as permissões no seu navegador ou sistema operacional e tente novamente.',
      )
      setCamOn(false)
      setMicOn(false)
    }

    // Carregar prontuário
    let { data: pront } = await supabase
      .from('prontuarios')
      .select('id, nova_nota')
      .eq('paciente_id', apt.paciente_id)
      .maybeSingle()

    if (!pront) {
      const { data: newPront } = await supabase
        .from('prontuarios')
        .insert({ paciente_id: apt.paciente_id, usuario_id: user?.id, historico_sessoes: [] })
        .select()
        .single()
      pront = newPront
    }

    if (pront) {
      setNotes(pront.nova_nota || '')
      notesRef.current = pront.nova_nota || ''
    }
  }

  // Effect para aquisição do stream
  useEffect(() => {
    let activeStream: MediaStream | null = null

    const acquireStream = async () => {
      if (!activeSession || deviceError) return

      // Aguarda a definição dos dispositivos padrão caso existam na lista
      if (!selectedVideo && videoDevices.length > 0) return
      if (!selectedAudio && audioDevices.length > 0) return

      try {
        const constraints: MediaStreamConstraints = {
          video: selectedVideo ? { deviceId: { exact: selectedVideo } } : true,
          audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : true,
        }

        activeStream = await navigator.mediaDevices.getUserMedia(constraints)
        setStream(activeStream)
      } catch (err: any) {
        console.error('Erro ao acessar a mídia', err)
        setDeviceError(
          'Não foi possível acessar a câmera e o microfone. Verifique as permissões do dispositivo.',
        )
      }
    }

    acquireStream()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [activeSession, selectedVideo, selectedAudio])

  // Effect para o medidor de áudio em tempo real
  useEffect(() => {
    let localAudioContext: AudioContext | null = null
    let localAnalyser: AnalyserNode | null = null
    let animationFrame: number | null = null

    if (inDeviceTest && stream && stream.getAudioTracks().length > 0 && micOn) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        localAudioContext = new AudioContextClass()
        localAudioContext
          .resume()
          .then(() => {
            const source = localAudioContext!.createMediaStreamSource(stream)
            localAnalyser = localAudioContext!.createAnalyser()
            localAnalyser.fftSize = 256
            source.connect(localAnalyser)

            const bufferLength = localAnalyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)

            const updateVolume = () => {
              if (!localAnalyser) return
              localAnalyser.getByteFrequencyData(dataArray)
              let sum = 0
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i]
              }
              const average = sum / bufferLength
              setAudioLevel(Math.min(100, Math.round((average / 255) * 100 * 1.5)))
              animationFrame = requestAnimationFrame(updateVolume)
            }
            updateVolume()
          })
          .catch(console.error)
      }
    } else {
      setAudioLevel(0)
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
      if (localAudioContext && localAudioContext.state !== 'closed') {
        localAudioContext.close().catch(console.error)
      }
    }
  }, [stream, inDeviceTest, micOn])

  // Effect para alternar estado das faixas de mídia (camOn / micOn)
  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = camOn))
      stream.getAudioTracks().forEach((track) => (track.enabled = micOn))
    }
  }, [camOn, micOn, stream])

  const playTestSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) {
        toast({
          title: 'Áudio não suportado',
          description: 'Seu navegador não suporta a reprodução de áudio de teste.',
          variant: 'destructive',
        })
        return
      }
      const ctx = new AudioContextClass()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1)

      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch (err) {
      console.error(err)
    }
  }

  // Real-time and Debounce for notes
  useEffect(() => {
    if (!activeSession || inDeviceTest) return

    const channel = supabase
      .channel(`prontuarios_${activeSession.paciente_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'prontuarios',
          filter: `paciente_id=eq.${activeSession.paciente_id}`,
        },
        (payload) => {
          if (payload.new.nova_nota !== notesRef.current) {
            setNotes(payload.new.nova_nota || '')
            notesRef.current = payload.new.nova_nota || ''
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeSession, inDeviceTest])

  const handleNotesChange = (val: string) => {
    setNotes(val)
    notesRef.current = val
    setIsSavingNotes(true)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    typingTimeoutRef.current = setTimeout(async () => {
      if (activeSession) {
        await supabase
          .from('prontuarios')
          .update({ nova_nota: val })
          .eq('paciente_id', activeSession.paciente_id)
      }
      setIsSavingNotes(false)
    }, 3000)
  }

  const handleCompileNotes = async () => {
    if (!activeSession || !notes.trim()) return

    const { data: pront } = await supabase
      .from('prontuarios')
      .select('historico_sessoes')
      .eq('paciente_id', activeSession.paciente_id)
      .single()
    const history = Array.isArray(pront?.historico_sessoes) ? pront.historico_sessoes : []

    const newEntry = {
      data: new Date().toISOString(),
      tipo: 'Evolução Clínica',
      descricao: notes,
    }

    await supabase
      .from('prontuarios')
      .update({
        historico_sessoes: [newEntry, ...history],
        nova_nota: '',
      })
      .eq('paciente_id', activeSession.paciente_id)

    setNotes('')
    notesRef.current = ''
    setIsNotesOpen(false)
    toast({ title: 'Notas compiladas no histórico com sucesso!' })
  }

  // Scheduling Next Session
  useEffect(() => {
    const fetchTimes = async () => {
      if (!nextDate || !user) {
        setAvailableTimes([])
        return
      }
      const { data } = await supabase
        .from('agendamentos')
        .select('data_hora')
        .eq('usuario_id', user.id)
        .gte('data_hora', `${nextDate}T00:00:00-03:00`)
        .lte('data_hora', `${nextDate}T23:59:59-03:00`)
        .neq('status', 'desmarcou')

      const occupied = data?.map((a) => new Date(a.data_hora).getHours()) || []
      const allSlots = [8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19]
      const free = allSlots
        .filter((s) => !occupied.includes(s))
        .map((s) => `${String(s).padStart(2, '0')}:00`)
      setAvailableTimes(free)
    }
    fetchTimes()
  }, [nextDate, user])

  const confirmNextSession = async () => {
    if (!nextDate || !nextTime || !user || !activeSession) return
    setIsScheduling(true)

    try {
      const [hour, minute] = nextTime.split(':')
      const dt = new Date(`${nextDate}T00:00:00`)
      dt.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0)

      const patient = Array.isArray(activeSession.pacientes)
        ? activeSession.pacientes[0]
        : activeSession.pacientes

      const { error } = await supabase.from('agendamentos').insert({
        usuario_id: user.id,
        paciente_id: activeSession.paciente_id,
        data_hora: dt.toISOString(),
        is_online: nextType === 'online',
        status: 'agendado',
        tipo_pagamento: activeSession.tipo_pagamento || 'particular',
        valor_total: activeSession.valor_total || 0,
      })

      if (error) throw error

      await supabase
        .from('agendamentos')
        .update({ status: 'compareceu' })
        .eq('id', activeSession.id)

      toast({ title: 'Sessão finalizada e nova consulta agendada!' })

      if (patient?.telefone) {
        const dStr = dt.toLocaleDateString('pt-BR')
        const tStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        const msg = `Olá ${patient.nome}, sua próxima consulta foi agendada para ${dStr} às ${tStr}.`
        const cleanPhone = patient.telefone.replace(/\D/g, '')
        window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank')
      }

      endSessionCleanup()
    } catch (err: any) {
      toast({ title: 'Erro ao agendar', description: err.message, variant: 'destructive' })
    } finally {
      setIsScheduling(false)
    }
  }

  const skipScheduling = async () => {
    if (!activeSession) return
    await supabase.from('agendamentos').update({ status: 'compareceu' }).eq('id', activeSession.id)
    toast({ title: 'Sessão finalizada com sucesso.' })
    endSessionCleanup()
  }

  const endSessionCleanup = () => {
    if (stream) stream.getTracks().forEach((track) => track.stop())
    setStream(null)
    setActiveSession(null)
    setInDeviceTest(false)
    setIsFinishModalOpen(false)
    navigate('/')
  }

  const joinLiveSession = () => {
    setInDeviceTest(false)
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  if (!activeSession) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sala Virtual</h1>
            <p className="text-slate-500">
              Selecione uma sessão agendada para hoje para iniciar o atendimento.
            </p>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Nenhuma sessão para hoje</h3>
            <p className="text-slate-500 mt-1">
              Você não possui agendamentos marcados para o dia de hoje.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((apt) => {
              const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
              const time = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })
              return (
                <Card
                  key={apt.id}
                  className="rounded-2xl border-slate-200 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6 flex flex-col justify-between h-full gap-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold mb-3">
                          <Clock className="w-3.5 h-3.5" /> {time}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">{p?.nome}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {apt.is_online ? 'Consulta Online' : 'Consulta Presencial'}
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                        {p?.nome?.charAt(0).toUpperCase() || 'P'}
                      </div>
                    </div>
                    <Button
                      onClick={() => prepareSession(apt)}
                      className="w-full gap-2 rounded-xl h-11 bg-primary hover:bg-primary/90"
                    >
                      <Video className="w-4 h-4" /> Preparar Sala
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const patient = Array.isArray(activeSession.pacientes)
    ? activeSession.pacientes[0]
    : activeSession.pacientes

  if (inDeviceTest) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 px-4 animate-fade-in overflow-y-auto">
        <div className="w-full max-w-4xl mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              if (stream) stream.getTracks().forEach((t) => t.stop())
              setStream(null)
              setActiveSession(null)
              setInDeviceTest(false)
            }}
            className="gap-2 text-slate-500 hover:text-slate-800 -ml-2 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Settings className="w-6 h-6" />
            </div>
            Teste de Dispositivos
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Configure e teste sua câmera e microfone antes de iniciar a sessão com {patient?.nome}.
          </p>
        </div>

        <div className="w-full max-w-4xl space-y-6">
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> Visualização e Níveis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {deviceError ? (
                <div className="bg-red-50 text-red-700 p-8 rounded-2xl border border-red-200 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                    <VideoOff className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Permissão de Acesso Necessária</h3>
                    <p className="mt-1 max-w-md mx-auto text-sm">{deviceError}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => prepareSession(activeSession)}
                    className="mt-2 bg-white gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" /> Tentar Novamente
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center border-4 border-slate-100 shadow-inner">
                    <video
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transition-all duration-300 ${!camOn ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                      ref={(node) => {
                        if (node && node.srcObject !== stream) {
                          node.srcObject = stream
                        }
                      }}
                    />
                    {!camOn && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900">
                        <VideoOff className="w-12 h-12 mb-3" />
                        <span className="font-medium">Câmera Desativada</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Câmera de Vídeo</Label>
                      <Select
                        value={selectedVideo}
                        onValueChange={setSelectedVideo}
                        disabled={videoDevices.length === 0 || !camOn}
                      >
                        <SelectTrigger className="bg-slate-50 h-11">
                          <SelectValue placeholder="Buscando câmeras..." />
                        </SelectTrigger>
                        <SelectContent>
                          {videoDevices.map((device) => (
                            <SelectItem key={device.deviceId} value={device.deviceId}>
                              {device.label || `Câmera ${device.deviceId.substring(0, 5)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Microfone</Label>
                      <Select
                        value={selectedAudio}
                        onValueChange={setSelectedAudio}
                        disabled={audioDevices.length === 0 || !micOn}
                      >
                        <SelectTrigger className="bg-slate-50 h-11">
                          <SelectValue placeholder="Buscando microfones..." />
                        </SelectTrigger>
                        <SelectContent>
                          {audioDevices.map((device) => (
                            <SelectItem key={device.deviceId} value={device.deviceId}>
                              {device.label || `Microfone ${device.deviceId.substring(0, 5)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="font-bold text-slate-700">Nível de Captação</Label>
                        {micOn && (
                          <span className="text-xs font-medium text-emerald-600">Ouvindo...</span>
                        )}
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex items-center">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-100 ease-out"
                          style={{ width: micOn ? `${audioLevel}%` : '0%' }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-2 flex-wrap pt-2">
                      <div className="flex gap-2">
                        <Button
                          variant={micOn ? 'outline' : 'destructive'}
                          onClick={() => setMicOn(!micOn)}
                          className={`w-12 h-12 rounded-full p-0 transition-colors ${micOn ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : ''}`}
                          title={micOn ? 'Desativar Microfone' : 'Ativar Microfone'}
                        >
                          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </Button>
                        <Button
                          variant={camOn ? 'outline' : 'destructive'}
                          onClick={() => setCamOn(!camOn)}
                          className={`w-12 h-12 rounded-full p-0 transition-colors ${camOn ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : ''}`}
                          title={camOn ? 'Desativar Câmera' : 'Ativar Câmera'}
                        >
                          {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </Button>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={playTestSound}
                        className="gap-2 h-12 px-5 rounded-full border border-slate-200 hover:bg-slate-100"
                      >
                        <Volume2 className="w-4 h-4 text-slate-600" /> Testar Áudio
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            className="w-full gap-2 text-lg h-14 bg-primary hover:bg-primary/90 text-white shadow-lg disabled:opacity-50"
            onClick={joinLiveSession}
            disabled={!!deviceError}
          >
            <CheckCircle className="w-5 h-5" /> Entrar na Sessão
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-fade-in relative mt-2 mb-6 max-w-[1600px] mx-auto">
      {/* Header Room */}
      <div className="h-16 px-6 flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-slate-800 absolute top-0 w-full z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400">
            <Video className="w-4 h-4" />
          </div>
          <span className="text-white font-medium">
            Sessão com <strong className="font-bold">{patient?.nome}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ao vivo
          </span>
        </div>

        <Sheet open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <SheetTrigger asChild>
            <Button
              variant="secondary"
              className="gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border-0 h-9 rounded-full px-4"
            >
              <FileText className="w-4 h-4" /> Notas da Sessão
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md border-l border-slate-200 flex flex-col bg-white">
            <SheetHeader className="pb-4 border-b border-slate-100 shrink-0">
              <SheetTitle className="text-xl font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Notas da Sessão
                </span>
                {isSavingNotes ? (
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-normal">
                    <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
                  </span>
                ) : (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-normal">
                    <CheckCircle className="w-3 h-3" /> Salvo
                  </span>
                )}
              </SheetTitle>
              <SheetDescription>
                Anotações salvas automaticamente. Compile ao final.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 py-4 flex flex-col">
              <Textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="flex-1 resize-none bg-slate-50 border-slate-200 focus-visible:ring-primary text-base p-4"
                placeholder="Digite suas observações clínicas aqui..."
              />
            </div>
            <div className="pt-4 border-t border-slate-100 shrink-0">
              <Button
                onClick={handleCompileNotes}
                className="w-full h-11 rounded-xl gap-2 bg-slate-900 hover:bg-slate-800"
              >
                <CheckCircle className="w-4 h-4" /> Salvar e Fechar
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Video Area (Mock) */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-900">
        {/* Remote Video Mock */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={`https://img.usecurling.com/ppl/large?gender=female&seed=${activeSession.id}`}
            alt="Patient"
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
          />
          <div className="absolute bottom-24 left-6 text-white bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm">
            {patient?.nome}
          </div>
        </div>

        {/* Local Video - Real Stream from WebRTC */}
        <div className="absolute bottom-24 right-6 w-48 h-64 bg-slate-800 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-xl">
          <video
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!camOn ? 'hidden' : ''}`}
            ref={(node) => {
              if (node && stream && node.srcObject !== stream) {
                node.srcObject = stream
              }
            }}
          />
          {!camOn && (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500">
              <VideoOff className="w-8 h-8 mb-2" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-white bg-black/40 px-2 py-1 rounded text-xs backdrop-blur-sm">
            Você
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="h-20 bg-slate-950 flex items-center justify-center gap-4 px-6 border-t border-slate-800">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMicOn(!micOn)}
          className={cn(
            'w-12 h-12 rounded-full border-0',
            micOn
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-red-500 text-white hover:bg-red-600',
          )}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCamOn(!camOn)}
          className={cn(
            'w-12 h-12 rounded-full border-0',
            camOn
              ? 'bg-slate-800 text-white hover:bg-slate-700'
              : 'bg-red-500 text-white hover:bg-red-600',
          )}
        >
          {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        <Dialog open={isFinishModalOpen} onOpenChange={setIsFinishModalOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="h-12 px-6 rounded-full font-bold gap-2 ml-4">
              <PhoneOff className="w-4 h-4" /> Finalizar Sessão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[2rem]">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <CalendarPlus className="w-6 h-6 text-primary" /> Agendar Próxima Sessão
              </DialogTitle>
              <DialogDescription className="text-base mt-1">
                Gostaria de já deixar o próximo horário reservado para {patient?.nome}?
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-2 space-y-4">
              <div className="space-y-2">
                <Label>Data da próxima sessão</Label>
                <Input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-slate-50 h-12 rounded-xl text-base"
                />
              </div>

              {nextDate && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Horário (Disponíveis)</Label>
                  <Select value={nextTime} onValueChange={setNextTime}>
                    <SelectTrigger className="bg-slate-50 h-12 rounded-xl text-base">
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-48">
                      {availableTimes.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum horário disponível
                        </SelectItem>
                      ) : (
                        availableTimes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Modalidade</Label>
                <Select value={nextType} onValueChange={setNextType}>
                  <SelectTrigger className="bg-slate-50 h-12 rounded-xl text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl text-base"
                onClick={skipScheduling}
              >
                Pular
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl text-base gap-2"
                onClick={confirmNextSession}
                disabled={!nextDate || !nextTime || isScheduling}
              >
                {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar e Enviar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
