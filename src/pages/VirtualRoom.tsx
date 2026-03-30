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
  Settings,
  ArrowLeft,
  RefreshCcw,
  Volume2,
  AlertCircle,
} from 'lucide-react'

export default function VirtualRoom() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<any[]>([])
  const [activeSession, setActiveSession] = useState<any | null>(null)

  const [inDeviceTest, setInDeviceTest] = useState(false)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string>('')
  const [selectedAudio, setSelectedAudio] = useState<string>('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [deviceError, setDeviceError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false)

  useEffect(() => {
    const fetchApts = async () => {
      if (!user) return
      setLoading(true)
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      const { data } = await supabase
        .from('agendamentos')
        .select('*, pacientes(nome, telefone, hash_anamnese)')
        .eq('usuario_id', user.id)
        .in('status', ['agendado', 'confirmado'])
        .gte('data_hora', start.toISOString())
        .lte('data_hora', end.toISOString())
        .order('data_hora')
      if (data) setAppointments(data)
      setLoading(false)
    }
    fetchApts()
  }, [user])

  const prepareSession = async (apt: any) => {
    setActiveSession(apt)
    setInDeviceTest(true)
    setDeviceError(null)

    try {
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        throw new Error('Acesso à câmera requer conexão HTTPS segura.')
      }

      let tempStream
      try {
        tempStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      } catch (err) {
        tempStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setCamOn(false)
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoInput = devices.filter((device) => device.kind === 'videoinput')
      const audioInput = devices.filter((device) => device.kind === 'audioinput')
      setVideoDevices(videoInput)
      setAudioDevices(audioInput)
      if (videoInput.length > 0) setSelectedVideo(videoInput[0].deviceId)
      if (audioInput.length > 0) setSelectedAudio(audioInput[0].deviceId)
      if (tempStream) tempStream.getTracks().forEach((t) => t.stop())
    } catch (err: any) {
      console.error(err)
      setDeviceError('Acesso à câmera/microfone negado. Verifique as permissões do navegador.')
      setCamOn(false)
      setMicOn(false)
    }
  }

  useEffect(() => {
    let activeStream: MediaStream | null = null
    const acquireStream = async () => {
      if (!activeSession || deviceError || !inDeviceTest) return
      try {
        let constraints: MediaStreamConstraints = {
          video: selectedVideo ? { deviceId: { exact: selectedVideo } } : camOn,
          audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : micOn,
        }
        try {
          activeStream = await navigator.mediaDevices.getUserMedia(constraints)
        } catch (e) {
          constraints.video = false
          setCamOn(false)
          activeStream = await navigator.mediaDevices.getUserMedia(constraints)
        }
        setStream(activeStream)
      } catch (err: any) {
        setDeviceError('Não foi possível acessar a câmera e o microfone.')
      }
    }
    acquireStream()
    return () => {
      if (activeStream) activeStream.getTracks().forEach((t) => t.stop())
    }
  }, [activeSession, selectedVideo, selectedAudio, inDeviceTest])

  useEffect(() => {
    if (stream && inDeviceTest) {
      stream.getVideoTracks().forEach((track) => (track.enabled = camOn))
      stream.getAudioTracks().forEach((track) => (track.enabled = micOn))
    }
  }, [camOn, micOn, stream, inDeviceTest])

  const joinLiveSession = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop())
    setStream(null)
    setInDeviceTest(false)
    setIframeLoaded(false)
  }

  const endSession = async () => {
    if (stream) stream.getTracks().forEach((t) => t.stop())
    setStream(null)
    if (activeSession) {
      await supabase
        .from('agendamentos')
        .update({ status: 'compareceu' })
        .eq('id', activeSession.id)

      const dt = new Date(activeSession.data_hora)
      await supabase.from('financeiro').insert({
        usuario_id: user?.id,
        paciente_id: activeSession.paciente_id,
        mes: dt.getMonth() + 1,
        ano: dt.getFullYear(),
        valor_a_receber: activeSession.valor_total || 0,
        valor_recebido: 0,
        status: 'pendente',
      })
    }
    setActiveSession(null)
    setInDeviceTest(false)
    navigate('/')
    toast({ title: 'Sessão finalizada com sucesso!' })
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
            Teste de Dispositivos
          </h1>
        </div>
        <div className="w-full max-w-4xl space-y-6">
          <Card className="shadow-sm border-slate-200 bg-white">
            <CardContent className="p-6">
              {deviceError ? (
                <div className="bg-red-50 text-red-700 p-8 rounded-2xl flex flex-col items-center text-center gap-4">
                  <VideoOff className="w-8 h-8" />
                  <h3>Erro de Permissão</h3>
                  <p>{deviceError}</p>
                  <Button variant="outline" onClick={() => prepareSession(activeSession)}>
                    <RefreshCcw className="w-4 h-4 mr-2" /> Tentar Novamente
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center border-4 border-slate-100">
                    <video
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transition-all ${!camOn ? 'opacity-0' : 'opacity-100'}`}
                      ref={(node) => {
                        if (node && node.srcObject !== stream) node.srcObject = stream
                      }}
                    />
                    {!camOn && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                        <VideoOff className="w-12 h-12 mb-3" />
                        <span>Câmera Desativada</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-2">
                      <Button
                        variant={micOn ? 'outline' : 'destructive'}
                        onClick={() => setMicOn(!micOn)}
                        className={`w-12 h-12 rounded-full p-0 ${micOn ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : ''}`}
                      >
                        {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </Button>
                      <Button
                        variant={camOn ? 'outline' : 'destructive'}
                        onClick={() => setCamOn(!camOn)}
                        className={`w-12 h-12 rounded-full p-0 ${camOn ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : ''}`}
                      >
                        {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Button
            className="w-full gap-2 text-lg h-14 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
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
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-950 rounded-3xl overflow-hidden shadow-2xl relative max-w-[1600px] mx-auto mt-2 mb-6">
      <div className="h-16 px-6 flex items-center justify-between bg-slate-900/80 border-b border-slate-800 absolute top-0 w-full z-20 pointer-events-none">
        <span className="text-white font-medium pointer-events-auto">
          Sessão com <strong className="font-bold">{patient?.nome}</strong>
        </span>
      </div>
      <div className="flex-1 relative flex items-center justify-center bg-slate-900 w-full pt-16 pb-24">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}
        <iframe
          src={`https://meet.jit.si/PsicManager_${activeSession.id.replace(/-/g, '')}?jwt=${activeSession.sala_virtual_token || ''}#config.startWithAudioMuted=${!micOn}&config.startWithVideoMuted=${!camOn}`}
          allow="camera; microphone; fullscreen"
          className={`w-full h-full border-0 absolute inset-0 pt-16 pb-24 z-0 ${!iframeLoaded ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIframeLoaded(true)}
        />
      </div>
      <div className="h-24 bg-slate-950 flex items-center justify-between px-6 border-t border-slate-800 absolute bottom-0 w-full z-20 pointer-events-auto">
        <Button
          variant="destructive"
          onClick={endSession}
          className="h-14 px-8 rounded-full font-bold text-lg gap-3 ml-auto"
        >
          <PhoneOff className="w-5 h-5" /> Finalizar
        </Button>
      </div>
    </div>
  )
}
