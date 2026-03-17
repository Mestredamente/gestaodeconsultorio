import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Calendar, CheckCircle } from 'lucide-react'

export default function PublicBooking() {
  const { clinicId } = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [clinicName, setClinicName] = useState('Clínica')

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    data_hora: '',
  })

  useEffect(() => {
    const fetchClinic = async () => {
      if (clinicId) {
        const { data } = await supabase
          .from('usuarios')
          .select('nome_consultorio')
          .eq('id', clinicId)
          .single()
        if (data?.nome_consultorio) setClinicName(data.nome_consultorio)
      }
    }
    fetchClinic()
  }, [clinicId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clinicId) return

    setLoading(true)
    const dt = new Date(formData.data_hora).toISOString()

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
      setSuccess(true)
    }
  }

  if (!clinicId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        Link de agendamento inválido.
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200 animate-fade-in-up">
        {success ? (
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <CardTitle className="text-2xl font-bold text-slate-900">
              Agendamento Solicitado!
            </CardTitle>
            <p className="text-slate-500">
              Sua sessão foi enviada para o profissional. Aguarde o contato de confirmação.
            </p>
            <Button className="mt-4 w-full" onClick={() => setSuccess(false)}>
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
                  <Label htmlFor="data_hora">Data e Horário de Preferência</Label>
                  <Input
                    id="data_hora"
                    type="datetime-local"
                    required
                    value={formData.data_hora}
                    onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
                  {loading ? 'Enviando...' : 'Solicitar Agendamento'}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
