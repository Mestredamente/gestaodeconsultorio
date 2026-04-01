import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Clock,
  Save,
  ArrowLeft,
  Loader2,
  Copy,
  ChevronRight,
  Wallet,
  Sparkles,
  Calendar,
  Link as LinkIcon,
  Plus,
  Play,
  Settings,
  CheckCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'

export default function TelehealthSession() {
  const { agendamentoId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [apt, setApt] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [prontuarioId, setProntuarioId] = useState<string | null>(null)
  const [historico, setHistorico] = useState<any[]>([])

  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [seconds, setSeconds] = useState(0)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const [inWaitingRoom, setInWaitingRoom] = useState(true)
  const [generatingAI, setGeneratingAI] = useState(false)

  const [todayApts, setTodayApts] = useState<any[]>([])
  const [clinicConfig, setClinicConfig] = useState<any>(null)

  const [avulsaName, setAvulsaName] = useState('')
  const [avulsaValue, setAvulsaValue] = useState('')
  const [creatingAvulsa, setCreatingAvulsa] = useState(false)

  // Device Test states
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string>('')
  const [selectedAudio, setSelectedAudio] = useState<string>('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [deviceError, setDeviceError] = useState<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const isAvulsa = agendamentoId === 'nova'

  useEffect(() => {
    const getDevices = async () => {
      try {
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
        setDeviceError(
          'Permissão negada ou dispositivos não encontrados. Por favor, libere o acesso à câmera e ao microfone no seu navegador.',
        )
        setCamOn(false)
        setMicOn(false)
      }
    }
    getDevices()
  }, [])

  useEffect(() => {
    let activeStream: MediaStream | null = null

    const initMedia = async () => {
      if (deviceError || !inWaitingRoom) return
      try {
        if (activeStream) {
          activeStream.getTracks().forEach((t) => t.stop())
        }

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

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = activeStream
        }

        // Setup audio level meter
        if (activeStream.getAudioTracks().length > 0) {
          if (!audioContextRef.current) {
            audioContextRef.current = new (
              window.AudioContext || (window as any).webkitAudioContext
            )()
          }
          if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume()
          }

          const source = audioContextRef.current.createMediaStreamSource(activeStream)
          analyserRef.current = audioContextRef.current.createAnalyser()
          analyserRef.current.fftSize = 256
          source.connect(analyserRef.current)

          const bufferLength = analyserRef.current.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)

          const updateVolume = () => {
            if (!analyserRef.current) return
            analyserRef.current.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i]
            }
            const average = sum / bufferLength
            setAudioLevel(Math.min(100, Math.round((average / 255) * 100 * 1.5)))
            animationFrameRef.current = requestAnimationFrame(updateVolume)
          }
          updateVolume()
        }
      } catch (err) {
        console.error('Error starting media', err)
      }
    }

    initMedia()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop())
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [selectedVideo, selectedAudio, inWaitingRoom, deviceError])

  useEffect(() => {
    if (stream && inWaitingRoom) {
      stream.getVideoTracks().forEach((track) => (track.enabled = camOn))
      stream.getAudioTracks().forEach((track) => (track.enabled = micOn))
    }
  }, [camOn, micOn, stream, inWaitingRoom])

  useEffect(() => {
    if (!inWaitingRoom) {
      const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [inWaitingRoom])

  useEffect(() => {
    const fetchApt = async () => {
      if (!agendamentoId || isAvulsa) {
        setLoading(false)
        return
      }

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        agendamentoId,
      )
      if (!isUUID) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('agendamentos')
        .select('*, pacientes(nome, id, hash_anamnese)')
        .eq('id', agendamentoId)
        .single()

      if (data) {
        setApt(data)
        const patient = Array.isArray(data.pacientes) ? data.pacientes[0] : data.pacientes
        if (patient) {
          const { data: prData } = await supabase
            .from('prontuarios')
            .select('*')
            .eq('paciente_id', patient.id)
            .maybeSingle()
          if (prData) {
            setProntuarioId(prData.id)
            setHistorico(prData.historico_sessoes || [])
          }
        }
      }
      setLoading(false)
    }
    fetchApt()
  }, [agendamentoId, isAvulsa])

  useEffect(() => {
    if (!user) return
    supabase
      .from('usuarios')
      .select('chave_pix')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setClinicConfig(data)
      })

    if (isAvulsa) {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)

      supabase
        .from('agendamentos')
        .select('id, data_hora, is_online, pacientes(nome, hash_anamnese)')
        .eq('usuario_id', user.id)
        .gte('data_hora', start.toISOString())
        .lte('data_hora', end.toISOString())
        .neq('status', 'desmarcou')
        .neq('status', 'faltou')
        .order('data_hora')
        .then(({ data }) => {
          if (data) setTodayApts(data)
        })
    }
  }, [user, isAvulsa])

  const handleSaveNotes = async () => {
    if (!notes.trim() || (!prontuarioId && !isAvulsa)) return
    if (isAvulsa) {
      toast({ title: 'Anotações temporárias salvas.' })
      return
    }
    const newEntry = {
      id: Math.random().toString(36).substring(2),
      date: new Date().toISOString().split('T')[0],
      content: notes,
    }
    const updated = [newEntry, ...historico]
    await supabase.from('prontuarios').update({ historico_sessoes: updated }).eq('id', prontuarioId)
    setHistorico(updated)
    setNotes('')
    toast({ title: 'Anotações salvas com sucesso!' })
  }

  const handleAIAssist = async () => {
    setGeneratingAI(true)
    try {
      const { data, error } = await supabase.functions.invoke('gerar_sugestao_evolucao', {
        body: { historico: historico.slice(0, 3), queixa: 'acompanhamento contínuo' },
      })
      if (error) throw error
      if (data?.text) {
        setNotes((prev) => prev + (prev ? '\n\n' : '') + data.text)
        toast({ title: 'Sugestão gerada com sucesso!' })
      }
    } catch (e) {
      toast({ title: 'Erro na IA', variant: 'destructive' })
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleCreateAvulsa = async () => {
    if (!avulsaName || !avulsaValue) {
      toast({
        title: 'Atenção',
        description: 'Preencha o nome e o valor da sessão.',
        variant: 'destructive',
      })
      return
    }
    setCreatingAvulsa(true)

    const { data: pData, error: pErr } = await supabase
      .from('pacientes')
      .insert({
        usuario_id: user?.id,
        nome: avulsaName,
        tipo_horario: 'avulso',
        telefone: '',
      })
      .select('id, hash_anamnese')
      .single()

    if (pErr || !pData) {
      toast({ title: 'Erro ao registrar paciente', variant: 'destructive' })
      setCreatingAvulsa(false)
      return
    }

    const { data: aData, error: aErr } = await supabase
      .from('agendamentos')
      .insert({
        usuario_id: user?.id,
        paciente_id: pData.id,
        data_hora: new Date().toISOString(),
        status: 'agendado',
        valor_total: Number(avulsaValue),
        is_online: true,
      })
      .select('id')
      .single()

    setCreatingAvulsa(false)

    if (aErr || !aData) {
      toast({ title: 'Erro ao registrar sessão', variant: 'destructive' })
      return
    }

    const pix = clinicConfig?.chave_pix || 'Chave PIX não configurada'
    const link = `${window.location.origin}/sessao/${pData.hash_anamnese}`
    const msg = `Olá ${avulsaName},\n\nSua sessão online está pronta.\nValor: R$ ${Number(avulsaValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nPIX: ${pix}\n\nAcesse a sala de vídeo pelo link abaixo:\n${link}`
    navigator.clipboard.writeText(msg)

    toast({
      title: 'Sessão Avulsa Registrada!',
      description: 'O link de pagamento e acesso foi copiado para a área de transferência.',
    })

    navigate(`/atendimento/${aData.id}`)
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const patient = Array.isArray(apt?.pacientes) ? apt?.pacientes[0] : apt?.pacientes
  const patientName = isAvulsa ? avulsaName || 'Paciente Avulso' : patient?.nome || 'Paciente'

  const copyPatientLink = () => {
    if (patient?.hash_anamnese) {
      const link = `${window.location.origin}/sessao/${patient.hash_anamnese}`
      navigator.clipboard.writeText(link)
      toast({ title: 'Link da sessão copiado!' })
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o link.',
        variant: 'destructive',
      })
    }
  }

  const copySessionLink = (hash: string) => {
    if (!hash) return
    const link = `${window.location.origin}/sessao/${hash}`
    navigator.clipboard.writeText(link)
    toast({ title: 'Link copiado!', description: 'Envie para o paciente acessar a sala.' })
  }

  const playTestSound = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1)
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  if (inWaitingRoom) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 px-4 animate-fade-in overflow-y-auto">
        <div className="w-full max-w-6xl mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/agenda')}
            className="gap-2 text-slate-500 hover:text-slate-800 -ml-2 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Agenda
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 mt-2 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Settings className="w-6 h-6" />
            </div>
            Teste de Dispositivos e Preparação
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Configure seu áudio e vídeo antes de iniciar a sessão online.
          </p>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-sm border-slate-200 h-fit bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> Preview de Câmera
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {deviceError ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-medium">
                  {deviceError}
                </div>
              ) : (
                <>
                  <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative flex items-center justify-center border-4 border-slate-100 shadow-inner">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transition-all duration-300 ${!camOn ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                    />
                    {!camOn && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900">
                        <VideoOff className="w-12 h-12 mb-3" />
                        <span className="font-medium">Câmera Desativada</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Selecione a Câmera</Label>
                      <Select
                        value={selectedVideo}
                        onValueChange={setSelectedVideo}
                        disabled={videoDevices.length === 0 || !camOn}
                      >
                        <SelectTrigger className="bg-slate-50 h-11">
                          <SelectValue placeholder="Câmera Padrão" />
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
                      <Label className="font-bold text-slate-700">Selecione o Microfone</Label>
                      <Select
                        value={selectedAudio}
                        onValueChange={setSelectedAudio}
                        disabled={audioDevices.length === 0 || !micOn}
                      >
                        <SelectTrigger className="bg-slate-50 h-11">
                          <SelectValue placeholder="Microfone Padrão" />
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
                        <Label className="font-bold text-slate-700">Nível do Microfone</Label>
                        {micOn && (
                          <span className="text-xs font-medium text-emerald-600">Captando...</span>
                        )}
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex items-center">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-100 ease-out"
                          style={{ width: micOn ? `${audioLevel}%` : '0%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 gap-2 flex-wrap">
                    <div className="flex gap-2">
                      <Button
                        variant={micOn ? 'outline' : 'destructive'}
                        onClick={() => setMicOn(!micOn)}
                        className={`w-12 h-12 rounded-full p-0 ${micOn ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : ''}`}
                        title={micOn ? 'Desativar Microfone' : 'Ativar Microfone'}
                      >
                        {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </Button>
                      <Button
                        variant={camOn ? 'outline' : 'destructive'}
                        onClick={() => setCamOn(!camOn)}
                        className={`w-12 h-12 rounded-full p-0 ${camOn ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : ''}`}
                        title={camOn ? 'Desativar Câmera' : 'Ativar Câmera'}
                      >
                        {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      </Button>
                    </div>
                    <Button variant="secondary" onClick={playTestSound} className="gap-2">
                      <Play className="w-4 h-4 text-slate-600" /> Testar Saída de Áudio
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {isAvulsa ? (
            <Card className="shadow-sm border-slate-200 bg-white flex flex-col">
              <Tabs defaultValue="agendados" className="w-full flex-1 flex flex-col">
                <CardHeader className="p-0 border-b border-slate-100 bg-slate-50/50 rounded-t-lg shrink-0">
                  <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent flex-wrap">
                    <TabsTrigger
                      value="agendados"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 px-6 text-base shadow-none flex-1"
                    >
                      <Calendar className="w-4 h-4 mr-2" /> Sessões de Hoje
                    </TabsTrigger>
                    <TabsTrigger
                      value="avulsa"
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 px-6 text-base shadow-none flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Avulsa Rápida
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-y-auto">
                  <TabsContent value="agendados" className="m-0 h-full">
                    {todayApts.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                        <Calendar className="w-12 h-12 text-slate-300 mb-3" />
                        Nenhuma sessão agendada para hoje.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {todayApts.map((apt) => {
                          const p = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
                          const time = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          return (
                            <div
                              key={apt.id}
                              className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div>
                                <p className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                  {time}{' '}
                                  <span className="font-medium text-slate-600">{p?.nome}</span>
                                </p>
                                {!apt.is_online && (
                                  <Badge variant="secondary" className="mt-1.5">
                                    Presencial
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copySessionLink(p?.hash_anamnese)}
                                  className="gap-2 shrink-0"
                                >
                                  <LinkIcon className="w-3 h-3" /> Link
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => navigate(`/atendimento/${apt.id}`)}
                                  className="gap-2 shrink-0 bg-indigo-600 hover:bg-indigo-700"
                                >
                                  Preparar <ChevronRight className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="avulsa" className="m-0 p-6 space-y-6 animate-fade-in">
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg text-indigo-800 text-sm">
                      <p>
                        <strong>Registro Rápido:</strong> Gere um link de acesso imediato para um
                        paciente não agendado, incluindo instruções de pagamento via PIX.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome do Paciente</Label>
                        <Input
                          placeholder="Ex: Maria Oliveira"
                          value={avulsaName}
                          onChange={(e) => setAvulsaName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor Cobrado (R$)</Label>
                        <Input
                          type="number"
                          placeholder="150"
                          value={avulsaValue}
                          onChange={(e) => setAvulsaValue(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleCreateAvulsa}
                        disabled={creatingAvulsa}
                        className="w-full gap-2 h-12 text-base mt-2"
                      >
                        {creatingAvulsa ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Wallet className="w-5 h-5" />
                        )}
                        {creatingAvulsa ? 'Gerando...' : 'Gerar Link PIX e Preparar Sala'}
                      </Button>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          ) : (
            <Card className="shadow-sm border-slate-200 bg-white flex flex-col">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-6 shrink-0">
                <CardTitle className="text-xl">Próximo Atendimento</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Confirme os dados do paciente antes de iniciar.
                </p>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl">
                      {patientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-0.5">
                        Paciente
                      </p>
                      <p className="text-2xl font-bold text-slate-800">{patientName}</p>
                    </div>
                  </div>

                  {patient?.hash_anamnese && (
                    <div className="space-y-3 pt-4 border-t border-slate-100 mb-8">
                      <p className="text-sm font-medium text-slate-700">Link da Sala de Vídeo</p>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={`${window.location.origin}/sessao/${patient.hash_anamnese}`}
                          className="bg-slate-50 font-mono text-sm text-slate-500"
                        />
                        <Button
                          variant="outline"
                          className="shrink-0 gap-2"
                          onClick={() => copySessionLink(patient.hash_anamnese)}
                        >
                          <Copy className="w-4 h-4" /> Copiar
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500">
                        Envie este link para o paciente. Ele deverá acessá-lo para que você possa
                        vê-lo na sala.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 mt-auto">
                  <Button
                    className="w-full gap-2 text-lg h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
                    onClick={() => {
                      if (stream) {
                        stream.getTracks().forEach((t) => t.stop())
                        setStream(null)
                      }
                      // Delay to ensure mobile hardware camera is fully released
                      setTimeout(() => {
                        setInWaitingRoom(false)
                      }, 600)
                    }}
                  >
                    <CheckCircle className="w-5 h-5" /> Confirmar Dispositivos e Iniciar Sessão
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden animate-fade-in">
      <div className="flex-1 bg-slate-950 text-white flex flex-col relative">
        <div className="absolute top-4 left-4 right-4 flex justify-between z-20 pointer-events-none">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 pointer-events-auto bg-black/50 backdrop-blur-sm rounded-full"
            onClick={() => {
              navigate('/agenda')
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Encerrar e Sair
          </Button>
          <div className="flex gap-3 pointer-events-auto">
            {patient?.hash_anamnese && (
              <Button
                variant="outline"
                size="sm"
                className="bg-black/50 text-white border-white/20 hover:bg-white/20 gap-2 backdrop-blur-sm rounded-full"
                onClick={copyPatientLink}
              >
                <Copy className="w-4 h-4" /> Copiar Link
              </Button>
            )}
            <div className="bg-black/50 px-4 py-1.5 rounded-full flex items-center gap-2 font-mono text-sm tracking-widest border border-white/10 shadow-sm backdrop-blur-sm">
              <Clock className="w-4 h-4 text-emerald-400" /> {formatTime(seconds)}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative p-0 bg-slate-900">
          <iframe
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            src={`https://meet.jit.si/PsicManager_${(apt?.id || agendamentoId || 'avulsa').replace(/-/g, '')}${apt?.sala_virtual_token ? `?jwt=${apt.sala_virtual_token}` : ''}#config.startWithAudioMuted=${!micOn}&config.startWithVideoMuted=${!camOn}&config.prejoinPageEnabled=false`}
            className="w-full h-full border-0 absolute inset-0 pt-16 md:pt-0"
          />
        </div>
      </div>

      <div className="w-full md:w-[450px] lg:w-[500px] bg-white border-l border-slate-200 flex flex-col h-[40vh] md:h-screen shadow-2xl z-10">
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Evolução Clínica</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-2">
              {patientName}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
            onClick={handleAIAssist}
            disabled={generatingAI}
          >
            {generatingAI ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Sugerir com IA
          </Button>
        </div>
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-3">
            <Textarea
              className="min-h-[150px] md:min-h-[250px] resize-y border-indigo-200 focus-visible:ring-indigo-500 text-base leading-relaxed p-4"
              placeholder="Digite as anotações e evolução da sessão atual..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button
              className="w-full gap-2 h-11"
              onClick={handleSaveNotes}
              disabled={!notes.trim() || (!prontuarioId && !isAvulsa)}
            >
              <Save className="w-4 h-4" /> Salvar Evolução
            </Button>
          </div>
          {!isAvulsa && (
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                Histórico Recente
              </h3>
              <div className="space-y-3">
                {historico.slice(0, 5).map((h: any) => (
                  <div
                    key={h.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm"
                  >
                    <p className="font-bold text-slate-700 text-xs mb-2 border-b border-slate-200 pb-1">
                      {new Date(h.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
                      {h.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
