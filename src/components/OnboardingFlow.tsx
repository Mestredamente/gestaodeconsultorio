import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, CheckCircle, ChevronRight, Building2, UserRound, Loader2 } from 'lucide-react'
import { cn, maskPhone } from '@/lib/utils'

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nome_consultorio: '',
    endereco: '',
    chave_pix: '',
    paciente_nome: '',
    paciente_telefone: '',
    valor_sessao: '',
    data_sessao: '',
    hora_sessao: '',
  })

  const handleNext = () => setStep(step + 1)

  const handleComplete = async () => {
    if (!user) return
    setLoading(true)
    try {
      // 1. Update User Profile
      await supabase
        .from('usuarios')
        .update({
          nome_consultorio: form.nome_consultorio,
          endereco_consultorio: form.endereco,
          chave_pix: form.chave_pix,
          onboarding_concluido: true,
        })
        .eq('id', user.id)

      // 2. Insert Paciente
      let pacienteId = null
      if (form.paciente_nome) {
        const { data: p } = await supabase
          .from('pacientes')
          .insert({
            usuario_id: user.id,
            nome: form.paciente_nome,
            telefone: form.paciente_telefone,
            valor_sessao: form.valor_sessao ? Number(form.valor_sessao) : null,
          })
          .select()
          .single()
        pacienteId = p?.id
      }

      // 3. Insert Agendamento
      if (pacienteId && form.data_sessao && form.hora_sessao) {
        const dataHora = `${form.data_sessao}T${form.hora_sessao}:00`
        await supabase.from('agendamentos').insert({
          usuario_id: user.id,
          paciente_id: pacienteId,
          data_hora: new Date(dataHora).toISOString(),
          status: 'agendado',
          valor_total: form.valor_sessao ? Number(form.valor_sessao) : 0,
        })
      }

      toast({ title: 'Tudo pronto!', description: 'Bem-vindo ao seu novo consultório digital.' })
      onComplete()
    } catch (e: any) {
      toast({
        title: 'Erro ao concluir configuração',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const isStep1Valid = form.nome_consultorio.length > 2
  const isStep2Valid = form.paciente_nome.length > 2
  const isStep3Valid = form.data_sessao && form.hora_sessao

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bem-vindo à Gestão Clínica</h1>
        <p className="text-slate-500">Vamos configurar seu ambiente em 3 passos rápidos.</p>
      </div>

      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 -translate-y-1/2 transition-all duration-500"
          style={{ width: `${(step - 1) * 50}%` }}
        ></div>

        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 border-white',
              step >= s ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500',
            )}
          >
            {step > s ? <CheckCircle className="w-5 h-5" /> : s}
          </div>
        ))}
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
          {step === 1 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Dados do Consultório</CardTitle>
                <CardDescription>
                  Informações básicas para personalizar seus documentos.
                </CardDescription>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <UserRound className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Seu Primeiro Paciente</CardTitle>
                <CardDescription>Cadastre um paciente para testar a agenda.</CardDescription>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Agendar Consulta</CardTitle>
                <CardDescription>Marque a primeira sessão deste paciente.</CardDescription>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Nome do Profissional ou Clínica *</Label>
                <Input
                  value={form.nome_consultorio}
                  onChange={(e) => setForm({ ...form, nome_consultorio: e.target.value })}
                  placeholder="Ex: Dr. João Silva"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Endereço (Opcional)</Label>
                <Input
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  placeholder="Rua, Número, Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label>Chave PIX para Cobranças (Opcional)</Label>
                <Input
                  value={form.chave_pix}
                  onChange={(e) => setForm({ ...form, chave_pix: e.target.value })}
                  placeholder="CPF, E-mail ou Telefone"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={handleNext} disabled={!isStep1Valid} className="gap-2 px-8">
                  Próximo Passo <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label>Nome do Paciente *</Label>
                <Input
                  value={form.paciente_nome}
                  onChange={(e) => setForm({ ...form, paciente_nome: e.target.value })}
                  placeholder="Nome completo"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone / WhatsApp (Opcional)</Label>
                <Input
                  value={form.paciente_telefone}
                  onChange={(e) =>
                    setForm({ ...form, paciente_telefone: maskPhone(e.target.value) })
                  }
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>Valor da Sessão (Opcional)</Label>
                <Input
                  type="number"
                  value={form.valor_sessao}
                  onChange={(e) => setForm({ ...form, valor_sessao: e.target.value })}
                  placeholder="Ex: 150"
                />
              </div>
              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Voltar
                </Button>
                <Button onClick={handleNext} disabled={!isStep2Valid} className="gap-2 px-8">
                  Próximo Passo <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data da Sessão *</Label>
                  <Input
                    type="date"
                    value={form.data_sessao}
                    onChange={(e) => setForm({ ...form, data_sessao: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Horário *</Label>
                  <Input
                    type="time"
                    value={form.hora_sessao}
                    onChange={(e) => setForm({ ...form, hora_sessao: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg mt-6">
                <p className="text-emerald-800 text-sm font-medium">
                  Tudo certo! Após concluir, você será redirecionado para o seu painel principal.
                </p>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Voltar
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={!isStep3Valid || loading}
                  className="gap-2 px-8 bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Concluir Configuração
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
