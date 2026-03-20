import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { maskPhone } from '@/lib/utils'
import {
  CheckCircle2,
  ChevronLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Check,
} from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DIAS_SEMANA_MAP: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
}

export default function PublicBooking() {
  const { clinicId } = useParams()
  const { toast } = useToast()

  const [clinic, setClinic] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    especialidade: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)

  useEffect(() => {
    if (!clinicId) return

    supabase
      .from('usuarios')
      .select(
        'nome_consultorio, logo_url, endereco_consultorio, especialidades_disponiveis, agendamento_publico_ativo, horario_funcionamento',
      )
      .eq('id', clinicId)
      .single()
      .then(({ data }) => {
        setClinic(data)
        if (data && data.especialidades_disponiveis && data.especialidades_disponiveis.length > 0) {
          setFormData((prev) => ({ ...prev, especialidade: data.especialidades_disponiveis[0] }))
        }
        setLoading(false)
      })
  }, [clinicId])

  useEffect(() => {
    if (selectedDate && clinicId) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate, clinicId])

  const fetchAvailableSlots = async (date: Date) => {
    setSlotsLoading(true)
    const dateStr = format(date, 'yyyy-MM-dd')
    const { data: dbData } = await supabase.rpc('get_clinic_slots', {
      p_clinic_id: clinicId,
      p_date: dateStr,
    })

    if (dbData && dbData.ativo && clinic?.horario_funcionamento) {
      const dayOfWeek = DIAS_SEMANA_MAP[date.getDay()]
      const configDia = clinic.horario_funcionamento.find(
        (h: any) => h.dia === dayOfWeek && h.ativo,
      )

      if (!configDia || !configDia.turnos) {
        setAvailableSlots([])
        setSlotsLoading(false)
        return
      }

      const generatedSlots: string[] = []

      configDia.turnos.forEach((turno: any) => {
        const startParts = turno.inicio.split(':')
        const endParts = turno.fim.split(':')

        let currentH = parseInt(startParts[0])
        let currentM = parseInt(startParts[1] || '0')

        const endH = parseInt(endParts[0])
        const endM = parseInt(endParts[1] || '0')
        const endTotal = endH * 60 + endM

        while (currentH * 60 + currentM < endTotal) {
          const hh = String(currentH).padStart(2, '0')
          const mm = String(currentM).padStart(2, '0')
          const timeSlot = `${hh}:${mm}`

          const slotDate = new Date(date)
          slotDate.setHours(currentH, currentM, 0, 0)
          const slotEnd = new Date(slotDate.getTime() + 60 * 60000)

          const hasApt = dbData.agendamentos?.some((a: any) => {
            const aDate = new Date(a.data_hora)
            const aEnd = new Date(aDate.getTime() + 60 * 60000)
            return slotDate < aEnd && slotEnd > aDate
          })

          const hasBlock = dbData.bloqueios?.some((b: any) => {
            const bStart = new Date(b.data_inicio)
            const bEnd = new Date(b.data_fim)
            return slotDate < bEnd && slotEnd > bStart
          })

          if (!hasApt && !hasBlock) {
            if (isSameDay(date, new Date())) {
              const now = new Date()
              if (
                currentH > now.getHours() ||
                (currentH === now.getHours() && currentM > now.getMinutes())
              ) {
                generatedSlots.push(timeSlot)
              }
            } else {
              generatedSlots.push(timeSlot)
            }
          }

          currentM += 60
          if (currentM >= 60) {
            currentH += Math.floor(currentM / 60)
            currentM = currentM % 60
          }
        }
      })

      setAvailableSlots(generatedSlots.sort())
    } else {
      setAvailableSlots([])
    }
    setSlotsLoading(false)
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !formData.nome || !formData.telefone) {
      toast({ title: 'Preencha todos os campos obrigatórios.', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)

    const [hh, mm] = selectedTime.split(':')
    const finalDate = new Date(selectedDate)
    finalDate.setHours(parseInt(hh), parseInt(mm), 0, 0)

    const { data, error } = await supabase.rpc('create_public_booking', {
      p_clinic_id: clinicId,
      p_nome: formData.nome,
      p_telefone: formData.telefone,
      p_data_hora: finalDate.toISOString(),
    })

    setIsSubmitting(false)

    if (error) {
      toast({ title: 'Erro ao agendar', description: error.message, variant: 'destructive' })
    } else if (data && data.success) {
      setSuccessData({
        data_hora: finalDate,
        hash_anamnese: data.hash_anamnese,
      })
      setStep(3)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!clinic || !clinic.agendamento_publico_ativo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center py-10 shadow-lg">
          <CardContent className="space-y-4">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="text-xl font-bold text-slate-700">Agendamento Indisponível</h2>
            <p className="text-slate-500">
              Este consultório não está aceitando agendamentos online no momento. Por favor, entre
              em contato diretamente.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header da Clínica */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-4">
          <Avatar className="w-24 h-24 border-4 border-white shadow-md">
            <AvatarImage src={clinic.logo_url} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {clinic.nome_consultorio?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{clinic.nome_consultorio}</h1>
            {clinic.endereco_consultorio && (
              <p className="text-sm text-slate-500 mt-1">{clinic.endereco_consultorio}</p>
            )}
          </div>
        </div>

        {/* Steps */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-4 text-sm font-medium text-slate-400 mb-8 mt-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary text-white' : 'border-slate-200'}`}
              >
                1
              </div>
              <span className="hidden sm:inline">Data e Hora</span>
            </div>
            <div className="w-12 h-px bg-slate-200"></div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary text-white' : 'border-slate-200'}`}
              >
                2
              </div>
              <span className="hidden sm:inline">Seus Dados</span>
            </div>
          </div>
        )}

        {/* Step 1: Data e Hora */}
        {step === 1 && (
          <Card className="shadow-lg border-slate-200 overflow-hidden animate-fade-in-up">
            <div className="md:flex">
              <div className="p-6 md:border-r border-slate-100 flex-1 flex flex-col items-center">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" /> Escolha uma data
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d)
                    setSelectedTime('')
                  }}
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    if (date < today) return true

                    if (clinic.horario_funcionamento) {
                      const dayOfWeek = DIAS_SEMANA_MAP[date.getDay()]
                      const configDia = clinic.horario_funcionamento.find(
                        (h: any) => h.dia === dayOfWeek,
                      )
                      if (!configDia || !configDia.ativo) return true
                    }
                    return false
                  }}
                  className="bg-white rounded-xl border-none shadow-sm pointer-events-auto"
                />
              </div>
              <div className="p-6 flex-1 bg-slate-50/50">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Horários disponíveis
                </h3>

                {!selectedDate ? (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                    Selecione uma data ao lado
                  </div>
                ) : slotsLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-xl bg-white">
                    Nenhum horário disponível
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${selectedTime === time ? 'bg-primary text-white shadow-md ring-2 ring-primary ring-offset-1' : 'bg-white text-slate-700 border border-slate-200 hover:border-primary hover:text-primary'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}

                {selectedTime && (
                  <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end animate-fade-in">
                    <Button onClick={() => setStep(2)} className="w-full sm:w-auto px-8 gap-2">
                      Continuar <ChevronLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Dados do Paciente */}
        {step === 2 && (
          <Card className="shadow-lg border-slate-200 overflow-hidden animate-fade-in-up max-w-lg mx-auto">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="w-fit mb-4 text-slate-500 hover:text-slate-800 -ml-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
              <CardTitle className="text-xl">Confirme seus dados</CardTitle>
              {selectedDate && selectedTime && (
                <div className="flex items-center gap-2 mt-2 text-primary font-medium bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      required
                      placeholder="Ex: João da Silva"
                      className="pl-9 bg-slate-50"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      required
                      placeholder="(00) 00000-0000"
                      className="pl-9 bg-slate-50"
                      value={formData.telefone}
                      onChange={(e) =>
                        setFormData({ ...formData, telefone: maskPhone(e.target.value) })
                      }
                    />
                  </div>
                </div>
                {clinic.especialidades_disponiveis &&
                  clinic.especialidades_disponiveis.length > 0 && (
                    <div className="space-y-2">
                      <Label>Especialidade</Label>
                      <Select
                        value={formData.especialidade}
                        onValueChange={(v) => setFormData({ ...formData, especialidade: v })}
                      >
                        <SelectTrigger className="bg-slate-50">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {clinic.especialidades_disponiveis.map((esp: string) => (
                            <SelectItem key={esp} value={esp}>
                              {esp}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                <Button
                  type="submit"
                  className="w-full mt-6 h-12 text-base font-semibold shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Confirmar Agendamento'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 3 && successData && (
          <Card className="shadow-lg border-slate-200 overflow-hidden animate-fade-in-up text-center max-w-lg mx-auto">
            <div className="bg-emerald-500 p-8 text-white flex flex-col items-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold">Agendamento Confirmado!</h2>
              <p className="mt-2 text-emerald-50 font-medium">
                Sua consulta foi reservada com sucesso.
              </p>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">
                  Data e Hora
                </p>
                <p className="text-lg text-slate-800 font-semibold">
                  {format(successData.data_hora, "dd/MM/yyyy 'às' HH:mm")}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-slate-600 font-medium">
                  Acesse seu portal exclusivo para preencher a anamnese antes da consulta:
                </p>
                <Button
                  onClick={() => (window.location.href = `/portal/${successData.hash_anamnese}`)}
                  className="w-full gap-2 h-12 shadow-sm"
                >
                  Acessar Meu Portal <ChevronLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
