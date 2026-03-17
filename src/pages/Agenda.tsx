import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, FileText, Plus, ExternalLink, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import ReceiptDialog from '@/components/ReceiptDialog'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatGoogleCalendarLink, downloadIcs } from '@/lib/calendar'

export default function Agenda() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [receiptData, setReceiptData] = useState<any>(null)

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [clinicName, setClinicName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    paciente_id: '',
    data_hora: '',
    especialidade: '',
    valor_total: '0',
    valor_sinal: '0',
    sinal_pago: false,
  })

  const { toast } = useToast()
  const { user } = useAuth()

  const fetchAppointments = useCallback(async () => {
    if (!user) return

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)

    const { data, error } = await supabase
      .from('agendamentos')
      .select(
        `id, data_hora, status, especialidade, valor_total, valor_sinal, sinal_pago, paciente_id, pacientes (id, nome, valor_sessao)`,
      )
      .eq('usuario_id', user.id)
      .gte('data_hora', startOfDay.toISOString())
      .lt('data_hora', endOfDay.toISOString())
      .order('data_hora', { ascending: true })
    if (!error && data) setAppointments(data)
    setLoading(false)
  }, [user])

  const fetchInitialData = useCallback(async () => {
    if (!user) return
    const [pts, usr] = await Promise.all([
      supabase
        .from('pacientes')
        .select('id, nome, valor_sessao')
        .eq('usuario_id', user.id)
        .order('nome'),
      supabase
        .from('usuarios')
        .select('especialidades_disponiveis, nome_consultorio')
        .eq('id', user.id)
        .single(),
    ])
    if (pts.data) setPatients(pts.data)
    if (usr.data) {
      setEspecialidades(usr.data.especialidades_disponiveis || [])
      setClinicName(usr.data.nome_consultorio || '')
    }
  }, [user])

  useEffect(() => {
    fetchAppointments()
    fetchInitialData()
    if (!user) return

    const subscription = supabase
      .channel('agendamentos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos', filter: `usuario_id=eq.${user.id}` },
        () => fetchAppointments(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, fetchAppointments, fetchInitialData])

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    // Check conflicts
    const { data: conflict } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('usuario_id', user.id)
      .eq('data_hora', new Date(formData.data_hora).toISOString())

    if (conflict && conflict.length > 0) {
      toast({
        title: 'Este horário já está ocupado. Por favor, escolha outro.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    const isoDate = new Date(formData.data_hora).toISOString()

    const { data: newAppt, error } = await supabase
      .from('agendamentos')
      .insert({
        usuario_id: user.id,
        paciente_id: formData.paciente_id,
        data_hora: isoDate,
        especialidade: formData.especialidade || null,
        valor_total: Number(formData.valor_total),
        valor_sinal: Number(formData.valor_sinal),
        sinal_pago: formData.sinal_pago,
        status: 'agendado',
      })
      .select()
      .single()

    if (error) {
      toast({ title: 'Erro ao agendar', description: error.message, variant: 'destructive' })
      setIsSubmitting(false)
      return
    }

    // Handle financial integration for prepayments
    if (formData.sinal_pago && Number(formData.valor_sinal) > 0) {
      const d = new Date(isoDate)
      const mes = d.getMonth() + 1
      const ano = d.getFullYear()
      const ptId = formData.paciente_id

      const { data: fin } = await supabase
        .from('financeiro')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('paciente_id', ptId)
        .eq('mes', mes)
        .eq('ano', ano)
        .maybeSingle()

      if (fin) {
        await supabase
          .from('financeiro')
          .update({
            valor_recebido: Number(fin.valor_recebido) + Number(formData.valor_sinal),
            valor_a_receber:
              Number(fin.valor_a_receber) +
              (Number(formData.valor_total) - Number(formData.valor_sinal)),
          })
          .eq('id', fin.id)
      } else {
        await supabase.from('financeiro').insert({
          usuario_id: user.id,
          paciente_id: ptId,
          mes,
          ano,
          valor_recebido: Number(formData.valor_sinal),
          valor_a_receber: Number(formData.valor_total) - Number(formData.valor_sinal),
        })
      }
    }

    toast({ title: 'Agendamento salvo com sucesso!' })
    setIsNewModalOpen(false)
    setIsSubmitting(false)
    setFormData({
      paciente_id: '',
      data_hora: '',
      especialidade: '',
      valor_total: '0',
      valor_sinal: '0',
      sinal_pago: false,
    })
  }

  const handleCompareceu = async (apt: any) => {
    if (apt.status === 'compareceu') return
    setAppointments((prev) =>
      prev.map((a) => (a.id === apt.id ? { ...a, status: 'compareceu' } : a)),
    )
    await supabase.from('agendamentos').update({ status: 'compareceu' }).eq('id', apt.id)

    if (!user) return
    const now = new Date(apt.data_hora)
    const mes = now.getMonth() + 1
    const ano = now.getFullYear()

    // Use appointment's valor_total if specified, else fallback to patient's default
    const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
    const valorSessao = apt.valor_total > 0 ? apt.valor_total : pacienteInfo?.valor_sessao || 0

    // If sign was already paid, we only need to add the remainder to valor_a_receber
    // The signal was already added to financeiro during creation.
    const valorToAdd = apt.sinal_pago
      ? Number(valorSessao) - Number(apt.valor_sinal)
      : Number(valorSessao)

    if (valorToAdd > 0) {
      const { data: finData } = await supabase
        .from('financeiro')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('paciente_id', apt.paciente_id)
        .eq('mes', mes)
        .eq('ano', ano)
        .maybeSingle()

      if (finData) {
        await supabase
          .from('financeiro')
          .update({
            valor_a_receber: Number(finData.valor_a_receber) + valorToAdd,
            data_atualizacao: new Date().toISOString(),
          })
          .eq('id', finData.id)
      } else {
        await supabase.from('financeiro').insert({
          usuario_id: user.id,
          paciente_id: apt.paciente_id,
          mes,
          ano,
          valor_recebido: 0,
          valor_a_receber: valorToAdd,
        })
      }
    }
    toast({ title: 'Status atualizado: Compareceu' })
  }

  const handleFaltou = async (apt: any) => {
    if (apt.status === 'faltou') return
    setAppointments((prev) => prev.map((a) => (a.id === apt.id ? { ...a, status: 'faltou' } : a)))
    await supabase.from('agendamentos').update({ status: 'faltou' }).eq('id', apt.id)
    toast({ title: 'Status atualizado: Faltou' })
  }

  const handleDesmarcou = async (apt: any) => {
    setAppointments((prev) => prev.filter((a) => a.id !== apt.id))
    await supabase.from('agendamentos').delete().eq('id', apt.id)
    toast({ title: 'Sessão desmarcada' })
  }

  const handleViewReceipt = async (apt: any) => {
    if (!user) return
    const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
    const now = new Date(apt.data_hora)
    const mes = now.getMonth() + 1
    const ano = now.getFullYear()

    const { data: fin } = await supabase
      .from('financeiro')
      .select('valor_recebido')
      .eq('usuario_id', user.id)
      .eq('paciente_id', apt.paciente_id)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle()

    if (fin && fin.valor_recebido > 0) {
      setReceiptData({
        open: true,
        patientName: pacienteInfo.nome,
        amount: fin.valor_recebido,
        dateStr: new Date().toLocaleDateString('pt-BR'),
        referencia: `${String(mes).padStart(2, '0')}/${ano}`,
      })
    } else {
      toast({
        title: 'Pagamento pendente',
        description:
          'O paciente ainda não possui pagamentos registrados para emitir recibo neste mês.',
        variant: 'destructive',
      })
    }
  }

  const handlePatientSelect = (pid: string) => {
    const pt = patients.find((p) => p.id === pid)
    setFormData({ ...formData, paciente_id: pid, valor_total: pt?.valor_sessao?.toString() || '0' })
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )

  const todayStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  const statusColors: Record<string, string> = {
    agendado: 'border-l-slate-200',
    compareceu: 'border-l-emerald-500',
    faltou: 'border-l-red-500',
    desmarcou: 'border-l-amber-500',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight capitalize">
            {todayStr}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Sua agenda de hoje</p>
        </div>
        <Button onClick={() => setIsNewModalOpen(true)} className="gap-2 rounded-full">
          <Plus className="w-4 h-4" /> Novo Agendamento
        </Button>
      </header>

      <div className="flex flex-col gap-4">
        {appointments.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500">
            Nenhuma sessão agendada para hoje.
          </div>
        ) : (
          appointments.map((apt) => {
            const timeStr = new Date(apt.data_hora).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })
            const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
            const patientName = pacienteInfo?.nome || 'Paciente Desconhecido'
            const valueStr = Number(
              apt.valor_total > 0 ? apt.valor_total : pacienteInfo?.valor_sessao || 0,
            ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

            const eventTitle = `Consulta: ${patientName} ${apt.especialidade ? `(${apt.especialidade})` : ''}`

            return (
              <Card
                key={apt.id}
                className={cn(
                  'bg-white shadow-sm transition-all border-l-4 border-t-0 border-r-0 border-b-0',
                  statusColors[apt.status] || statusColors.agendado,
                )}
              >
                <CardContent className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-start lg:items-center gap-5 w-full lg:w-auto">
                    <div className="bg-slate-50 min-w-[70px] py-2 rounded-lg text-center border border-slate-100 shrink-0">
                      <span className="font-bold text-slate-700 text-lg">{timeStr}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-lg text-slate-900">{patientName}</h3>
                        {apt.especialidade && (
                          <Badge variant="secondary" className="text-xs">
                            {apt.especialidade}
                          </Badge>
                        )}
                        {apt.valor_sinal > 0 && !apt.sinal_pago && (
                          <Badge variant="destructive" className="text-[10px]">
                            Sinal Pendente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 font-medium">Valor: {valueStr}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
                    <Button
                      size="icon"
                      variant="outline"
                      className="text-slate-400 hover:text-primary"
                      title="Google Calendar"
                      onClick={() =>
                        window.open(
                          formatGoogleCalendarLink(eventTitle, clinicName, apt.data_hora),
                          '_blank',
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="text-slate-400 hover:text-primary"
                      title="Exportar ICS"
                      onClick={() => downloadIcs(eventTitle, clinicName, apt.data_hora)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>
                    {apt.status === 'compareceu' && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={() => handleViewReceipt(apt)}
                        title="Gerar Recibo"
                      >
                        <FileText className="w-5 h-5 text-blue-500" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      className={cn(
                        'hover:bg-emerald-50 hover:border-emerald-200',
                        apt.status === 'compareceu' && 'bg-emerald-50 border-emerald-200',
                      )}
                      onClick={() => handleCompareceu(apt)}
                      title="Compareceu"
                    >
                      <Check className="w-5 h-5 text-emerald-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className={cn(
                        'hover:bg-red-50 hover:border-red-200',
                        apt.status === 'faltou' && 'bg-red-50 border-red-200',
                      )}
                      onClick={() => handleFaltou(apt)}
                      title="Faltou"
                    >
                      <X className="w-5 h-5 text-red-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className={cn(
                        'hover:bg-amber-50 hover:border-amber-200 font-bold text-lg text-amber-500',
                        apt.status === 'desmarcou' && 'bg-amber-50 border-amber-200',
                      )}
                      onClick={() => handleDesmarcou(apt)}
                      title="Desmarcou"
                    >
                      D
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <ReceiptDialog
        {...receiptData}
        onOpenChange={(val: boolean) => setReceiptData(val ? receiptData : null)}
      />

      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={formData.paciente_id} onValueChange={handlePatientSelect} required>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data e Hora</Label>
              <Input
                type="datetime-local"
                required
                value={formData.data_hora}
                onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                className="bg-white"
              />
            </div>

            {especialidades.length > 0 && (
              <div className="space-y-2">
                <Label>Especialidade</Label>
                <Select
                  value={formData.especialidade}
                  onValueChange={(v) => setFormData({ ...formData, especialidade: v })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Opcional..." />
                  </SelectTrigger>
                  <SelectContent>
                    {especialidades.map((esp) => (
                      <SelectItem key={esp} value={esp}>
                        {esp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Total (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_total}
                  onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Sinal / Entrada (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_sinal}
                  onChange={(e) => setFormData({ ...formData, valor_sinal: e.target.value })}
                  className="bg-white"
                />
              </div>
            </div>

            {Number(formData.valor_sinal) > 0 && (
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-md">
                <Label>Sinal já foi pago?</Label>
                <Switch
                  checked={formData.sinal_pago}
                  onCheckedChange={(v) => setFormData({ ...formData, sinal_pago: v })}
                />
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
