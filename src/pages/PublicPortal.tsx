import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Download, ExternalLink, Activity, FileText, Star } from 'lucide-react'
import { formatGoogleCalendarLink, downloadIcs } from '@/lib/calendar'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function PublicPortal() {
  const { hash } = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

  useEffect(() => {
    const fetchPortalData = async () => {
      if (!hash) return
      const { data: res, error } = await supabase.rpc('get_patient_portal_data', { p_hash: hash })
      if (!error && res && Object.keys(res).length > 0) setData(res)
      setLoading(false)
    }
    fetchPortalData()
  }, [hash])

  const handleRating = async () => {
    if (!data.pending_survey?.[0]) return
    await supabase.from('avaliacoes').insert({
      paciente_id: data.paciente_id,
      agendamento_id: data.pending_survey[0].id,
      nota: rating,
      comentario: comment,
    })
    setRatingSubmitted(true)
    toast({ title: 'Avaliação enviada com sucesso! Obrigado.' })
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

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
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
          <TabsList className="mb-4">
            <TabsTrigger value="agenda" className="gap-2">
              <Calendar className="w-4 h-4" /> Meus Agendamentos
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <Activity className="w-4 h-4" /> Meu Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agenda" className="space-y-4">
            {!data.agendamentos || data.agendamentos.length === 0 ? (
              <Card className="p-12 text-center text-slate-500 border-dashed shadow-none">
                Nenhuma consulta futura agendada.
              </Card>
            ) : (
              data.agendamentos.map((apt: any) => {
                const dateObj = new Date(apt.data_hora)
                const dateStr = dateObj.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
                const timeStr = dateObj.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const title = `Consulta: ${data.paciente_nome} - ${apt.especialidade || 'Geral'}`
                const details = `Clínica: ${data.consultorio}`
                return (
                  <Card key={apt.id} className="shadow-sm border-slate-200">
                    <CardContent className="p-5 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-primary/5 text-primary border-primary/20 capitalize"
                          >
                            {dateStr}
                          </Badge>
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="w-3 h-3" /> {timeStr}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg text-slate-900">
                          {apt.especialidade || 'Consulta Geral'}
                        </h3>
                        {apt.valor_sinal > 0 && !apt.sinal_pago && (
                          <Badge variant="destructive" className="mt-1">
                            Sinal Pendente
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() =>
                            window.open(
                              formatGoogleCalendarLink(title, details, apt.data_hora),
                              '_blank',
                            )
                          }
                        >
                          <ExternalLink className="w-4 h-4" /> Google Calendar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => downloadIcs(title, details, apt.data_hora)}
                        >
                          <Download className="w-4 h-4" /> Outlook / Apple
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
                        <FileText className="w-4 h-4 text-primary" />
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
        </Tabs>
      </div>
    </div>
  )
}
