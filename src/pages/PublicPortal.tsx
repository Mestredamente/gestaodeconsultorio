import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  ExternalLink,
  Activity,
  FileText,
  Star,
  Scale,
  Ban,
  CheckCircle,
  Video,
} from 'lucide-react'
import { formatGoogleCalendarLink } from '@/lib/calendar'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

export default function PublicPortal() {
  const { hash } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelAptId, setCancelAptId] = useState<string | null>(null)
  const [cancelJustification, setCancelJustification] = useState('')

  const fetchPortalData = async () => {
    if (!hash) return
    const { data: res, error } = await supabase.rpc('get_patient_portal_data', { p_hash: hash })
    if (!error && res && Object.keys(res).length > 0) setData(res)
    setLoading(false)
  }

  useEffect(() => {
    fetchPortalData()
  }, [hash])

  const replaceVars = (text: string) => {
    if (!text) return ''
    return text
      .replace(/\[Nome do Paciente\]/gi, data.paciente_nome || '')
      .replace(/\[CPF\]/gi, data.paciente_cpf || 'Não informado')
      .replace(/\[Nome do Consultório\]/gi, data.consultorio || '')
      .replace(/\[Data da Consulta\]/gi, new Date().toLocaleDateString('pt-BR'))
  }

  const handleRating = async () => {
    if (!data.pending_survey?.[0]) return
    await supabase
      .from('avaliacoes')
      .insert({
        paciente_id: data.paciente_id,
        agendamento_id: data.pending_survey[0].id,
        nota: rating,
        comentario: comment,
      })
    setRatingSubmitted(true)
    toast({ title: 'Avaliação enviada com sucesso! Obrigado.' })
  }

  const handleAcceptContract = async () => {
    if (!hash) return
    const { error } = await supabase.rpc('accept_patient_contract', { p_hash: hash })
    if (!error) {
      toast({ title: 'Contrato aceito com sucesso.' })
      fetchPortalData()
    } else toast({ title: 'Erro ao aceitar contrato.', variant: 'destructive' })
  }

  const handleCancelAppointment = async () => {
    if (!hash || !cancelAptId) return
    const { error } = await supabase.rpc('cancel_appointment_portal', {
      p_hash: hash,
      p_agendamento_id: cancelAptId,
      p_justificativa: cancelJustification,
    })
    if (!error) {
      toast({ title: 'Consulta desmarcada.' })
      setIsCancelDialogOpen(false)
      setCancelAptId(null)
      setCancelJustification('')
      fetchPortalData()
    } else toast({ title: 'Erro ao desmarcar consulta.', variant: 'destructive' })
  }

  const isToday = (d: Date) => {
    const today = new Date()
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    )
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  if (!data || !data.paciente_nome)
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Card className="max-w-md w-full p-8 text-center text-slate-500 shadow-sm">
          Link do portal inválido ou expirado.
        </Card>
      </div>
    )

  const showLegalTab = data.texto_contrato || data.politica_cancelamento

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-indigo-600 text-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="font-bold">Baixe nosso Aplicativo!</h3>
            <p className="text-indigo-100 text-sm">
              Acompanhe seus dados e agendamentos diretamente do celular.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-indigo-700 hover:bg-indigo-50"
            >
              iOS App Store
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-indigo-700 hover:bg-indigo-50"
            >
              Google Play
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-slate-200 bg-white">
          <CardHeader className="pb-6 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-slate-900">Portal do Paciente</CardTitle>
            <CardDescription className="text-base mt-2">
              Bem-vindo(a), <strong className="text-slate-800">{data.paciente_nome}</strong>
              <br />
              Clínica: <strong className="text-slate-800">{data.consultorio}</strong>
            </CardDescription>
          </CardHeader>
        </Card>

        {!ratingSubmitted && data.pending_survey && data.pending_survey.length > 0 && (
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2 text-slate-800">
                Avalie sua última consulta (
                {new Date(data.pending_survey[0].data_hora).toLocaleDateString('pt-BR')})
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Sua opinião é muito importante para melhorarmos nosso atendimento.
              </p>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      'w-8 h-8 cursor-pointer transition-colors',
                      rating >= n
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 hover:text-amber-200',
                    )}
                    onClick={() => setRating(n)}
                  />
                ))}
              </div>
              <Textarea
                placeholder="Deixe um comentário (opcional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4 bg-white"
              />
              <Button onClick={handleRating} disabled={rating === 0}>
                Enviar Avaliação
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="agenda" className="w-full">
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="agenda" className="gap-2 py-2">
              <Calendar className="w-4 h-4" /> Meus Agendamentos
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2 py-2">
              <Activity className="w-4 h-4" /> Meu Histórico
            </TabsTrigger>
            {showLegalTab && (
              <TabsTrigger value="juridico" className="gap-2 py-2 relative">
                <Scale className="w-4 h-4" /> Contratos e Políticas
                {!data.contrato_aceito && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="agenda" className="space-y-4">
            {!data.agendamentos || data.agendamentos.length === 0 ? (
              <Card className="p-12 text-center text-slate-500 border-dashed shadow-none">
                Nenhuma consulta futura agendada.
              </Card>
            ) : (
              data.agendamentos.map((apt: any) => {
                const dateObj = new Date(apt.data_hora)
                const title = `Consulta: ${data.paciente_nome} - ${apt.especialidade || 'Geral'}`
                const today = isToday(dateObj)
                return (
                  <Card
                    key={apt.id}
                    className={cn(
                      'shadow-sm border-slate-200',
                      today && 'border-indigo-300 bg-indigo-50/10',
                    )}
                  >
                    <CardContent className="p-5 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              'capitalize',
                              today
                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                : 'bg-primary/5 text-primary border-primary/20',
                            )}
                          >
                            {today
                              ? 'Hoje'
                              : dateObj.toLocaleDateString('pt-BR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                })}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="w-3 h-3" />{' '}
                            {dateObj.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg text-slate-900">
                          {apt.especialidade || 'Consulta Geral'}
                        </h3>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        {today && (
                          <Button
                            className="gap-2 justify-start bg-indigo-600 hover:bg-indigo-700 text-white shadow-md animate-pulse"
                            onClick={() => navigate(`/sessao/${hash}`)}
                          >
                            <Video className="w-4 h-4 shrink-0" /> Entrar na Sessão
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 justify-start"
                          onClick={() =>
                            window.open(
                              formatGoogleCalendarLink(
                                title,
                                `Clínica: ${data.consultorio}`,
                                apt.data_hora,
                              ),
                              '_blank',
                            )
                          }
                        >
                          <ExternalLink className="w-4 h-4 shrink-0" /> Salvar na Agenda
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 justify-start"
                          onClick={() => {
                            setCancelAptId(apt.id)
                            setIsCancelDialogOpen(true)
                          }}
                        >
                          <Ban className="w-4 h-4 shrink-0" /> Solicitar Cancelamento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            {!data.historico || data.historico.length === 0 ? (
              <Card className="p-12 text-center text-slate-500 border-dashed shadow-none">
                Nenhum histórico registrado ainda.
              </Card>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pb-4">
                {data.historico.map((entry: any) => (
                  <div key={entry.id} className="relative pl-6">
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full -left-[9px] top-1 ring-4 ring-slate-50" />
                    <div className="mb-2">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm font-semibold inline-flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />{' '}
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <Card className="shadow-sm border-slate-200">
                      <CardContent className="p-4 text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {entry.content}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {showLegalTab && (
            <TabsContent value="juridico" className="space-y-6">
              {!data.contrato_aceito && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start gap-3">
                  <FileText className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Ação Necessária</p>
                    <p className="text-sm mt-1">
                      Por favor, leia e aceite os termos do contrato e política de cancelamento para
                      continuar seu tratamento.
                    </p>
                  </div>
                </div>
              )}
              {data.texto_contrato && (
                <Card className="shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-lg">Contrato de Prestação de Serviços</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-700 whitespace-pre-wrap h-64 overflow-y-auto border border-slate-200">
                      {replaceVars(data.texto_contrato)}
                    </div>
                  </CardContent>
                </Card>
              )}
              {data.politica_cancelamento && (
                <Card className="shadow-sm">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-lg">Política de Cancelamento</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
                      {replaceVars(data.politica_cancelamento)}
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                {data.contrato_aceito ? (
                  <div className="flex items-center gap-3 text-emerald-700">
                    <CheckCircle className="w-6 h-6" />
                    <div>
                      <p className="font-bold">Termos Aceitos</p>
                      <p className="text-sm opacity-80">
                        Você já concordou com as políticas da clínica.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      className="mt-1"
                      onCheckedChange={(c) => c && handleAcceptContract()}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Li e estou de acordo com os termos do contrato e a política de cancelamento.
                    </label>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Cancelamento</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento. Esta ação não poderá ser desfeita e está sujeita às
              políticas da clínica.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Justificativa (obrigatório)"
              value={cancelJustification}
              onChange={(e) => setCancelJustification(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={!cancelJustification.trim()}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
