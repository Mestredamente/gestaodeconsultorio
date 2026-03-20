import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Video, Mic, MicOff, VideoOff, PhoneOff, UserSquare } from 'lucide-react'

export default function PublicTelehealth() {
  const { hash } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [data, setData] = useState<any>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    supabase.rpc('get_patient_portal_data', { p_hash: hash }).then(({ data: res }) => {
      if (res && res.paciente_nome) setData(res)
    })
  }, [hash])

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
          title: 'Permissão Necessária',
          description: 'Por favor, permita o acesso à câmera e ao microfone no seu navegador.',
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

  if (!data)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Carregando sala segura...
      </div>
    )

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col animate-fade-in">
      <header className="p-4 bg-slate-900 flex justify-between items-center border-b border-slate-800 shadow-md">
        <div>
          <h1 className="font-bold text-lg">Atendimento Remoto</h1>
          <p className="text-sm font-medium text-emerald-400">Dr(a). {data.consultorio}</p>
        </div>
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => navigate(`/portal/${hash}`)}
        >
          Voltar ao Portal
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center relative">
        <div className="w-full max-w-4xl aspect-video bg-slate-900/80 rounded-2xl overflow-hidden border border-slate-800 relative flex items-center justify-center shadow-2xl ring-1 ring-white/5">
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
            <UserSquare className="w-32 h-32 text-slate-700 mb-4 animate-pulse" />
            <p className="text-slate-400 font-medium">
              Aguardando o profissional iniciar a câmera...
            </p>
            <p className="absolute bottom-4 left-4 font-bold text-slate-300 drop-shadow-md text-lg">
              Dr(a). {data.consultorio}
            </p>
          </div>

          <div className="absolute top-4 right-4 w-32 md:w-48 aspect-video bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl flex items-center justify-center z-10 transition-all">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!camOn ? 'hidden' : ''}`}
            />
            {!camOn && <VideoOff className="w-8 h-8 text-slate-600 absolute" />}
            <span className="absolute bottom-1 left-2 text-[10px] font-medium bg-black/60 px-1.5 rounded text-white backdrop-blur-sm z-20">
              Você
            </span>
          </div>
        </div>
      </main>
      <footer className="p-6 bg-slate-900 flex justify-center gap-6 border-t border-slate-800">
        <Button
          size="icon"
          variant="outline"
          className={`rounded-full w-14 h-14 transition-colors ${!micOn ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'}`}
          onClick={() => setMicOn(!micOn)}
        >
          {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className={`rounded-full w-14 h-14 transition-colors ${!camOn ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'}`}
          onClick={() => setCamOn(!camOn)}
        >
          {camOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-red-500/20"
          onClick={() => navigate(`/portal/${hash}`)}
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </footer>
    </div>
  )
}
