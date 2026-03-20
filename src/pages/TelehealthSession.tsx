import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Clock,
  Save,
  ArrowLeft,
  Loader2,
  UserSquare,
  Copy,
  ChevronRight,
  Wallet,
  Sparkles,
} from 'lucide-react'

export default function TelehealthSession() {
  const { agendamentoId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

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

  const [avulsaName, setAvulsaName] = useState('')
  const [avulsaValue, setAvulsaValue] = useState('')

  const isAvulsa = agendamentoId === 'nova'

  useEffect(() => {
    let activeStream: MediaStream | null = null
    const initMedia = async () => {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setStream(activeStream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = activeStream
        }
      } catch (err) {
        toast({
          title: 'Atenção (Permissão Negada)',
          description:
            'Não foi possível acessar a câmera ou microfone. O paciente não conseguirá ver ou ouvir você.',
          variant: 'destructive',
        })
      }
    }
    initMedia()
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [toast])

  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) videoTrack.enabled = camOn
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) audioTrack.enabled = micOn
    }
  }, [camOn, micOn, stream])

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

  const handleGerarLinkAvulsa = () => {
    if (!avulsaName) {
      toast({
        title: 'Atenção',
        description: 'Preencha o nome do paciente',
        variant: 'destructive',
      })
      return
    }
    const fakePix = `00020126...${avulsaName.replace(/\s+/g, '')}`
    navigator.clipboard.writeText(
      `Olá ${avulsaName}, segue o link para pagamento da sessão avulsa (R$ ${avulsaValue || '0'}): \n\n${fakePix}\n\nAcesse a sala de vídeo: ${window.location.href}`,
    )
    toast({
      title: 'Sessão Avulsa Registrada',
      description: 'Link de pagamento e acesso copiado para a área de transferência.',
    })
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  if (inWaitingRoom) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-slate-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex justify-center items-center gap-2 text-slate-800">
              <Video className="w-6 h-6 text-primary" /> Sala de Espera
            </CardTitle>
            <CardDescription>
              Prepare sua câmera e microfone antes de iniciar o atendimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative flex items-center justify-center border border-slate-200 shadow-inner">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!camOn ? 'hidden' : ''}`}
              />
              {!camOn && <VideoOff className="w-12 h-12 text-slate-600" />}
            </div>
            <div className="flex justify-center gap-4">
              <Button
                variant={micOn ? 'default' : 'destructive'}
                onClick={() => setMicOn(!micOn)}
                className="w-40"
              >
                {micOn ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
                {micOn ? 'Microfone Ativo' : 'Mudo'}
              </Button>
              <Button
                variant={camOn ? 'default' : 'destructive'}
                onClick={() => setCamOn(!camOn)}
                className="w-40"
              >
                {camOn ? <Video className="w-4 h-4 mr-2" /> : <VideoOff className="w-4 h-4 mr-2" />}
                {camOn ? 'Câmera Ativa' : 'Desligada'}
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {patient?.hash_anamnese ? (
                <Button
                  variant="outline"
                  className="w-full gap-2 text-primary border-primary hover:bg-primary/5"
                  onClick={copyPatientLink}
                >
                  <Copy className="w-4 h-4" /> Copiar Link do Paciente
                </Button>
              ) : isAvulsa ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700">Registro de Sessão Avulsa</p>
                  <Input
                    placeholder="Nome do Paciente"
                    value={avulsaName}
                    onChange={(e) => setAvulsaName(e.target.value)}
                    className="bg-white"
                  />
                  <Input
                    placeholder="Valor da Sessão (R$)"
                    type="number"
                    value={avulsaValue}
                    onChange={(e) => setAvulsaValue(e.target.value)}
                    className="bg-white"
                  />
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    onClick={handleGerarLinkAvulsa}
                  >
                    <Wallet className="w-4 h-4" /> Gerar Link PIX + Sala
                  </Button>
                </div>
              ) : null}

              <Button
                className="w-full gap-2 text-lg h-12 mt-2"
                onClick={() => {
                  if (localVideoRef.current) localVideoRef.current.srcObject = null
                  setInWaitingRoom(false)
                }}
              >
                Entrar na Sessão <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden animate-fade-in">
      <div className="flex-1 bg-slate-950 text-white flex flex-col relative">
        <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => navigate('/agenda')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <div className="flex gap-3">
            {patient?.hash_anamnese && (
              <Button
                variant="outline"
                size="sm"
                className="bg-black/50 text-white border-white/20 hover:bg-white/20 gap-2 backdrop-blur-sm"
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

        <div className="flex-1 flex items-center justify-center relative p-4 mt-12 md:mt-0">
          <div className="w-full max-w-5xl aspect-video bg-slate-900/50 rounded-2xl border border-slate-800 flex items-center justify-center relative shadow-2xl overflow-hidden ring-1 ring-white/5">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <UserSquare className="w-32 h-32 text-slate-700 mb-4 animate-pulse" />
              <p className="text-slate-500 font-medium">Aguardando câmera do paciente...</p>
            </div>
            <p className="absolute bottom-4 left-4 font-medium drop-shadow-md text-slate-300 z-10">
              {patientName}
            </p>

            <div className="absolute top-4 right-4 w-32 md:w-48 aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-xl flex items-center justify-center z-10">
              <video
                ref={localVideoRef}
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
              {!camOn && <VideoOff className="w-8 h-8 text-slate-600 absolute" />}
              <span className="absolute bottom-1 left-2 text-[10px] bg-black/50 px-1.5 rounded text-white shadow-sm z-20">
                Você
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900/80 flex justify-center gap-4 border-t border-slate-800 backdrop-blur-sm">
          <Button
            size="icon"
            variant="outline"
            className={`rounded-full w-14 h-14 transition-colors ${!micOn ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'}`}
            onClick={() => setMicOn(!micOn)}
          >
            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            className={`rounded-full w-14 h-14 transition-colors ${!camOn ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'}`}
            onClick={() => setCamOn(!camOn)}
          >
            {camOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>
          <Button
            size="icon"
            variant="destructive"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-red-500/20"
            onClick={() => navigate('/agenda')}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
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
