import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
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

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchApt = async () => {
      if (!agendamentoId) return

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        agendamentoId,
      )

      if (agendamentoId === 'nova' || !isUUID) {
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
  }, [agendamentoId])

  const handleSaveNotes = async () => {
    if (!notes.trim() || !prontuarioId) return
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

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const copyPatientLink = () => {
    const patientHash = Array.isArray(apt?.pacientes)
      ? apt?.pacientes[0]?.hash_anamnese
      : apt?.pacientes?.hash_anamnese
    if (patientHash) {
      const link = `${window.location.origin}/sessao/${patientHash}`
      navigator.clipboard.writeText(link)
      toast({ title: 'Link da sessão copiado!' })
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o link do paciente.',
        variant: 'destructive',
      })
    }
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  const patient = Array.isArray(apt?.pacientes) ? apt?.pacientes[0] : apt?.pacientes
  const patientName = patient?.nome || 'Paciente'

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
              {camOn ? (
                <UserSquare className="w-16 h-16 text-slate-600" />
              ) : (
                <VideoOff className="w-8 h-8 text-slate-600" />
              )}
              <span className="absolute bottom-1 left-2 text-[10px] bg-black/50 px-1.5 rounded text-white shadow-sm">
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
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
          <h2 className="font-bold text-slate-800 text-lg">Prontuário e Anotações</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-2">
            {patientName}
          </p>
        </div>
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-3">
            <Textarea
              className="min-h-[150px] md:min-h-[250px] resize-y border-amber-200 bg-amber-50/50 focus-visible:ring-amber-500 text-base leading-relaxed p-4"
              placeholder="Digite as anotações e evolução da sessão atual..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button
              className="w-full gap-2 h-11"
              onClick={handleSaveNotes}
              disabled={!notes.trim() || !prontuarioId}
            >
              <Save className="w-4 h-4" /> Salvar Evolução
            </Button>
          </div>

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
              {historico.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Nenhum registro anterior encontrado.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
