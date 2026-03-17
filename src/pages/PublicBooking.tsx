import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Calendar, CheckCircle, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PublicBooking() {
  const { clinicId } = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)
  const [clinicName, setClinicName] = useState('Clínica')
  const [isActive, setIsActive] = useState(true)
  const [slots, setSlots] = useState<string[]>([])

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    data: '',
    hora: '',
  })

  useEffect(() => {
    const fetchClinic = async () => {
      if (clinicId) {
        const { data } = await supabase
          .from('usuarios')
          .select('nome_consultorio, agendamento_publico_ativo')
          .eq('id', clinicId)
          .single()
        if (data) {
          setClinicName(data.nome_consultorio || 'Clínica')
          setIsActive(data.agendamento_publico_ativo || false)
        }
      }
    }
    fetchClinic()
  }, [clinicId])

  useEffect(() => {
    if (formData.data && clinicId && isActive) {
      supabase
        .rpc('get_clinic_slots', { p_clinic_id: clinicId, p_date: formData.data })
        .then(({ data }) => {
          if (data && data.ativo) {
            const occupied = data.occupied || []
            const available = []
            for (let i = 8; i <= 18; i++) {
              const h = i.toString().padStart(2, '0') + ':00'
              if (!occupied.includes(h)) available.push(h)
            }
            setSlots(available)
            setFormData((prev) => ({ ...prev, hora: '' }))
          } else if (data && !data.ativo) {
            setIsActive(false)
          }
        })
    }
  }, [formData.data, clinicId, isActive])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinicId || !formData.hora)
      return toast({ title: 'Selecione um horário', variant: 'destructive' })

    setLoading(true)
    const dt = new Date(`${formData.data}T${formData.hora}:00-03:00`).toISOString()

    const { data, error } = await supabase.rpc('create_public_booking', {
      p_clinic_id: clinicId,
      p_nome: formData.nome,
      p_telefone: formData.telefone,
      p_data_hora: dt,
    })

    setLoading(false)

    if (error) {
      toast({ title: 'Erro ao agendar', description: error.message, variant: 'destructive' })
    } else {
      setSuccessData(data)
    }
  }

  if (!clinicId)
    return <div className="min-h-screen flex items-center justify-center p-4">Link inválido.</div>

  if (!isActive)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-sm border-slate-200 p-8 text-center text-slate-500">
          O agendamento online está temporariamente desativado para este profissional.
        </Card>
      </div>
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200 animate-fade-in-up">
        {successData ? (
          <CardContent className="pt-10 pb-10 text-center space-y-5">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <CardTitle className="text-2xl font-bold text-slate-900">
              Agendamento Confirmado!
            </CardTitle>
            <p className="text-slate-600">
              Sua sessão foi marcada com sucesso para{' '}
              <strong className="text-slate-900">
                {new Date(`${formData.data}T${formData.hora}:00`).toLocaleDateString('pt-BR')} às{' '}
                {formData.hora}
              </strong>
              .
            </p>
            {successData.hash_anamnese && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-4">
                <Video className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-sm text-indigo-800 font-medium mb-3">
                  Acesse o link de vídeo abaixo no dia da consulta:
                </p>
                <Button asChild className="w-full gap-2">
                  <Link to={`/sessao/${successData.hash_anamnese}`} target="_blank">
                    Sala de Telemedicina
                  </Link>
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                setSuccessData(null)
                setFormData({ nome: '', telefone: '', data: '', hora: '' })
              }}
            >
              Agendar Nova Sessão
            </Button>
          </CardContent>
        ) : (
          <>
            <CardHeader className="text-center pb-6 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Agendamento Online
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Profissional: <strong className="text-slate-800">{clinicName}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    required
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone / WhatsApp</Label>
                  <Input
                    id="telefone"
                    required
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data de Preferência</Label>
                  <Input
                    id="data"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  />
                </div>
                {formData.data && (
                  <div className="space-y-2">
                    <Label>Horários Disponíveis</Label>
                    {slots.length === 0 ? (
                      <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        Nenhum horário disponível nesta data.
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setFormData({ ...formData, hora: h })}
                            className={cn(
                              'p-2 text-sm rounded-md border font-medium transition-colors',
                              formData.hora === h
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white hover:bg-slate-50 border-slate-200',
                            )}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full h-11 text-base mt-4"
                  disabled={loading || !formData.hora}
                >
                  {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
