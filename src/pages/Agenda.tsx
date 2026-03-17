import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import ReceiptDialog from '@/components/ReceiptDialog'

export default function Agenda() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [receiptData, setReceiptData] = useState<any>(null)
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
      .select(`id, data_hora, status, paciente_id, pacientes (id, nome, valor_sessao)`)
      .eq('usuario_id', user.id)
      .gte('data_hora', startOfDay.toISOString())
      .lt('data_hora', endOfDay.toISOString())
      .order('data_hora', { ascending: true })
    if (!error && data) setAppointments(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchAppointments()
    if (!user) return

    const subscription = supabase
      .channel('agendamentos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos', filter: `usuario_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE')
            setAppointments((prev) => prev.filter((a) => a.id !== payload.old.id))
          else if (payload.eventType === 'UPDATE')
            setAppointments((prev) =>
              prev.map((a) =>
                a.id === payload.new.id
                  ? { ...a, status: payload.new.status, data_hora: payload.new.data_hora }
                  : a,
              ),
            )
          else if (payload.eventType === 'INSERT') fetchAppointments()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user, fetchAppointments])

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
    const pacienteInfo = Array.isArray(apt.pacientes) ? apt.pacientes[0] : apt.pacientes
    const valorSessao = pacienteInfo?.valor_sessao || 0

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
          valor_a_receber: Number(finData.valor_a_receber) + Number(valorSessao),
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
        valor_a_receber: Number(valorSessao),
      })
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
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-10">
      <header className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight capitalize">{todayStr}</h1>
        <p className="text-slate-500 mt-2 font-medium">Sua agenda de hoje</p>
      </header>

      <div className="flex flex-col gap-4">
        {appointments.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500">
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
            const valueStr = Number(pacienteInfo?.valor_sessao || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })

            return (
              <Card
                key={apt.id}
                className={cn(
                  'bg-white shadow-sm transition-all border-l-4 border-t-0 border-r-0 border-b-0',
                  statusColors[apt.status] || statusColors.agendado,
                )}
              >
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className="bg-slate-50 min-w-[70px] py-2 rounded-lg text-center border border-slate-100 shrink-0">
                      <span className="font-bold text-slate-700">{timeStr}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">{patientName}</h3>
                      <p className="text-sm text-slate-500 font-medium">{valueStr}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    {apt.status === 'compareceu' && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                        onClick={() => handleViewReceipt(apt)}
                        title="Gerar Recibo de Pagamento"
                      >
                        <FileText className="w-5 h-5 text-blue-500" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      className={cn(
                        'hover:bg-emerald-50 hover:border-emerald-200 transition-colors',
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
                        'hover:bg-red-50 hover:border-red-200 transition-colors',
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
                        'hover:bg-amber-50 hover:border-amber-200 transition-colors font-bold text-lg text-amber-500',
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
    </div>
  )
}
