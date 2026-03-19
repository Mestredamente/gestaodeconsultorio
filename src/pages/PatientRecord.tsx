import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Save,
  FileText,
  Plus,
  Printer,
  Calendar,
  Edit2,
  Clock,
  MessageSquare,
  CheckCircle2,
  Mic,
  Square,
  Loader2,
  FileCheck2,
  RefreshCw,
  BrainCircuit,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PrescriptionsList } from '@/components/PrescriptionsList'
import { QuickMessageDialog } from '@/components/QuickMessageDialog'

type HistoricoEntry = { id: string; date: string; content: string }
type MensagemEntry = {
  id: string
  tipo: string
  conteudo: string
  data_envio: string
  status_envio: string
}

export default function PatientRecord() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<any>(null)
  const [clinicInfo, setClinicInfo] = useState<any>(null)
  const [prontuarioId, setProntuarioId] = useState<string | null>(null)
  const [queixa, setQueixa] = useState('')
  const [isEditingQueixa, setIsEditingQueixa] = useState(false)
  const [historico, setHistorico] = useState<HistoricoEntry[]>([])
  const [mensagens, setMensagens] = useState<MensagemEntry[]>([])
  const [laudos, setLaudos] = useState<any[]>([])
  const [laudoTemplates, setLaudoTemplates] = useState<any[]>([])

  const [isEvolModalOpen, setIsEvolModalOpen] = useState(false)
  const [isLaudoModalOpen, setIsLaudoModalOpen] = useState(false)
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newContent, setNewContent] = useState('')

  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const [laudoContent, setLaudoContent] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  // Anamnese Smart Form
  const [anamneseTemplates, setAnamneseTemplates] = useState<any[]>([])
  const [activeAnamneseTemplateId, setActiveAnamneseTemplateId] = useState<string>('')
  const [anamneseAnswers, setAnamneseAnswers] = useState<Record<string, string>>({})
  const [savingAnamnese, setSavingAnamnese] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return
      if (id === 'novo') {
        setLoading(false)
        return
      }
      setLoading(true)
      const { data: pData } = await supabase.from('pacientes').select('*').eq('id', id).single()
      setPatient(pData)

      if (pData?.anamnese && Object.keys(pData.anamnese).length > 0) {
        setAnamneseAnswers(pData.anamnese)
      }

      const { data: cData } = await supabase
        .from('usuarios')
        .select('nome_consultorio, anamnese_template')
        .eq('id', user.id)
        .single()

      setClinicInfo(cData)

      if (cData?.anamnese_template && Array.isArray(cData.anamnese_template)) {
        setAnamneseTemplates(cData.anamnese_template)
        if (
          cData.anamnese_template.length > 0 &&
          (!pData?.anamnese || Object.keys(pData.anamnese).length === 0)
        ) {
          setActiveAnamneseTemplateId(cData.anamnese_template[0].id)
        }
      }

      const { data: prData } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('paciente_id', id)
        .maybeSingle()

      if (prData) {
        setProntuarioId(prData.id)
        setQueixa(prData.queixa_principal || '')
        const rawHistorico = (prData.historico_sessoes as unknown as HistoricoEntry[]) || []
        setHistorico(
          rawHistorico.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        )
      }

      const { data: msgData } = await supabase
        .from('historico_mensagens' as any)
        .select('*')
        .eq('paciente_id', id)
        .order('data_envio', { ascending: false })

      if (msgData) setMensagens(msgData)

      const { data: laudosData } = await supabase
        .from('laudos' as any)
        .select('*')
        .eq('paciente_id', id)
        .order('data_emissao', { ascending: false })

      if (laudosData) setLaudos(laudosData)

      const { data: tData } = await supabase
        .from('templates_documentos')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('tipo', 'laudo')

      if (tData) setLaudoTemplates(tData)

      setLoading(false)
    }
    fetchData()
  }, [id, user])

  const ensureProntuario = async () => {
    if (prontuarioId) return prontuarioId
    if (!user || !id || id === 'novo') return null
    const { data, error } = await supabase
      .from('prontuarios')
      .insert({
        paciente_id: id,
        usuario_id: user.id,
        queixa_principal: '',
        historico_sessoes: [],
      })
      .select()
      .single()
    if (data && !error) {
      setProntuarioId(data.id)
      return data.id
    }
    return null
  }

  const saveQueixa = async () => {
    const pid = await ensureProntuario()
    if (!pid) return
    const { error } = await supabase
      .from('prontuarios')
      .update({ queixa_principal: queixa })
      .eq('id', pid)
    if (!error) {
      setIsEditingQueixa(false)
      toast({ title: 'Queixa principal salva com sucesso!' })
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const saveEvolucao = async () => {
    if (!newContent.trim()) return toast({ title: 'Preencha a evolução', variant: 'destructive' })
    const pid = await ensureProntuario()
    if (!pid) return
    const newEntry: HistoricoEntry = {
      id: Math.random().toString(36).substring(2, 9),
      date: newDate,
      content: newContent,
    }
    const updatedHistorico = [newEntry, ...historico].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    const { error } = await supabase
      .from('prontuarios')
      .update({ historico_sessoes: updatedHistorico as any })
      .eq('id', pid)
    if (!error) {
      setHistorico(updatedHistorico)
      setIsEvolModalOpen(false)
      setNewContent('')
      toast({ title: 'Evolução clínica registrada!' })
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const handleSaveAnamnese = async () => {
    if (!id || id === 'novo') return
    setSavingAnamnese(true)
    const { error } = await supabase
      .from('pacientes')
      .update({ anamnese: anamneseAnswers as any })
      .eq('id', id)

    setSavingAnamnese(false)
    if (!error) {
      toast({ title: 'Anamnese salva com sucesso!' })
    } else {
      toast({ title: 'Erro ao salvar anamnese', variant: 'destructive' })
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        await handleTranscription(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      setMediaRecorder(recorder)
      recorder.start()
      setIsRecording(true)
    } catch (err) {
      toast({ title: 'Erro ao acessar microfone', variant: 'destructive' })
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const handleTranscription = async (blob: Blob) => {
    setIsTranscribing(true)
    try {
      const { data, error } = await supabase.functions.invoke('transcrever_audio', {
        body: {},
      })

      if (error) throw error

      if (data?.text) {
        setNewContent((prev) => (prev ? prev + '\n\n' + data.text : data.text))
        toast({ title: 'Áudio transcrito com sucesso!' })
      }
    } catch (err) {
      toast({ title: 'Erro na transcrição', variant: 'destructive' })
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleGenerateLaudo = () => {
    if (!selectedTemplate) {
      toast({ title: 'Selecione um template', variant: 'destructive' })
      return
    }
    const t = laudoTemplates.find((x) => x.id === selectedTemplate)
    if (t) {
      let content = t.conteudo
      content = content.replace(/\[Nome do Paciente\]/gi, patient.nome || '')
      content = content.replace(/\[Nome\]/gi, patient.nome || '')
      content = content.replace(/\[CPF\]/gi, patient.cpf || '')
      content = content.replace(/\[Data\]/gi, new Date().toLocaleDateString('pt-BR'))
      content = content.replace(/\[Nome do Consultório\]/gi, clinicInfo?.nome_consultorio || '')

      const sessoesResumo = historico
        .slice(0, 5)
        .map((h) => `- ${new Date(h.date).toLocaleDateString('pt-BR')}: ${h.content}`)
        .join('\n')
      content = content.replace(/\[Resumo Histórico\]/gi, sessoesResumo)

      setLaudoContent(content)
    }
  }

  const handleSaveLaudo = async () => {
    if (!laudoContent.trim() || id === 'novo') return
    const { data, error } = await supabase
      .from('laudos' as any)
      .insert({
        paciente_id: id,
        usuario_id: user?.id,
        conteudo: laudoContent,
        tipo: 'psicologico',
      })
      .select()
      .single()

    if (!error && data) {
      toast({ title: 'Laudo gerado e salvo com sucesso!' })
      setLaudos([data, ...laudos])
      setIsLaudoModalOpen(false)
      setLaudoContent('')
      setSelectedTemplate('')
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  const printLaudo = (laudo: any) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Laudo Psicológico - ${patient.nome}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; }
              .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #666; }
              .content { white-space: pre-wrap; text-align: justify; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${clinicInfo?.nome_consultorio || 'Consultório Psicológico'}</h1>
              <h3>LAUDO PSICOLÓGICO</h3>
            </div>
            <div class="content">${laudo.conteudo}</div>
            <div class="footer">
              <p>Emitido em ${new Date(laudo.data_emissao).toLocaleDateString('pt-BR')}</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )

  if (id === 'novo') {
    return (
      <div className="space-y-6 animate-fade-in-up pb-10 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/pacientes')}
          className="gap-2 -ml-4 text-slate-500 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-700">Paciente não salvo</h2>
          <p className="text-slate-500">Salve o paciente primeiro para acessar seu prontuário.</p>
        </div>
      </div>
    )
  }

  if (!patient) return <div className="text-center py-20">Paciente não encontrado.</div>

  const activeTemplateData =
    anamneseTemplates.find((t) => t.id === activeAnamneseTemplateId) || anamneseTemplates[0]

  return (
    <>
      <style media="print">{`body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { display: block !important; position: absolute; left: 0; top: 0; width: 100%; } html, body { background-color: white !important; min-height: 100%; } @page { size: auto; margin: 20mm; }`}</style>
      <div className="space-y-8 animate-fade-in-up pb-10 max-w-5xl mx-auto print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(`/pacientes/${id}`)}
              className="gap-2 -ml-4 text-slate-500 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" /> Prontuário Digital
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Paciente: <span className="font-semibold text-slate-700">{patient.nome}</span>
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <QuickMessageDialog patient={patient} />
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="gap-2 shadow-sm shrink-0"
            >
              <Printer className="w-4 h-4" /> Exportar PDF
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-slate-200 border-t-4 border-t-primary overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4 bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg text-slate-800">Queixa Principal / Objetivos</CardTitle>
            {!isEditingQueixa && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingQueixa(true)}
                className="text-slate-500 hover:text-primary"
              >
                <Edit2 className="w-4 h-4 mr-2" /> Editar
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {isEditingQueixa ? (
              <div className="space-y-4 animate-fade-in">
                <Textarea
                  value={queixa}
                  onChange={(e) => setQueixa(e.target.value)}
                  placeholder="Descreva o motivo da consulta..."
                  className="min-h-[140px] bg-white border-slate-200 text-base"
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditingQueixa(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveQueixa} className="gap-2">
                    <Save className="w-4 h-4" /> Salvar Queixa
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-base">
                {queixa || (
                  <span className="text-slate-400 italic">
                    Nenhuma anotação registrada. Adicione os objetivos terapêuticos aqui.
                  </span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="historico" className="w-full">
          <TabsList className="mb-6 h-auto p-1 flex-wrap bg-slate-100/50 border border-slate-200">
            <TabsTrigger value="historico" className="gap-2 py-2.5 px-4">
              <Clock className="w-4 h-4" /> Evolução Clínica
            </TabsTrigger>
            <TabsTrigger value="anamnese" className="gap-2 py-2.5 px-4">
              <BrainCircuit className="w-4 h-4" /> Anamnese
            </TabsTrigger>
            <TabsTrigger value="prescricoes" className="gap-2 py-2.5 px-4">
              <FileText className="w-4 h-4" /> Documentos
            </TabsTrigger>
            <TabsTrigger value="laudos" className="gap-2 py-2.5 px-4">
              <FileCheck2 className="w-4 h-4" /> Laudos
            </TabsTrigger>
            <TabsTrigger value="mensagens" className="gap-2 py-2.5 px-4">
              <MessageSquare className="w-4 h-4" /> Mensagens
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historico" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setIsEvolModalOpen(true)}
                className="gap-2 rounded-full shadow-sm"
              >
                <Plus className="w-4 h-4" /> Registrar Sessão
              </Button>
            </div>
            {historico.length === 0 ? (
              <div className="text-center p-12 bg-white border border-dashed border-slate-300 rounded-xl shadow-sm">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900">Nenhum registro</h3>
                <p className="text-slate-500 mt-1">
                  A evolução clínica do paciente aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent space-y-8">
                {historico.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-primary group-hover:text-white">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                      <CardHeader className="py-3 px-5 border-b border-slate-50 bg-slate-50/50">
                        <span className="font-semibold text-slate-700 text-sm">
                          Sessão de {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </CardHeader>
                      <CardContent className="p-5 text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px]">
                        {entry.content}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="anamnese" className="space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Anamnese Inteligente</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Formulário clínico adaptado à especialidade.
                  </p>
                </div>
                {anamneseTemplates.length > 0 && (
                  <Select
                    value={activeAnamneseTemplateId || anamneseTemplates[0]?.id}
                    onValueChange={setActiveAnamneseTemplateId}
                  >
                    <SelectTrigger className="w-full sm:w-[250px] bg-white">
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {anamneseTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.titulo} ({t.especialidade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {anamneseTemplates.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    Nenhum modelo de anamnese configurado. Crie em Configurações.
                  </div>
                ) : activeTemplateData ? (
                  <div className="space-y-6 animate-fade-in">
                    {activeTemplateData.perguntas.map((q: string, i: number) => (
                      <div key={i} className="space-y-2">
                        <Label className="text-base text-slate-800">{q}</Label>
                        <Textarea
                          className="bg-white min-h-[100px]"
                          placeholder="Sua anotação aqui..."
                          value={anamneseAnswers[q] || ''}
                          onChange={(e) =>
                            setAnamneseAnswers({ ...anamneseAnswers, [q]: e.target.value })
                          }
                        />
                      </div>
                    ))}

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <Button
                        onClick={handleSaveAnamnese}
                        disabled={savingAnamnese}
                        className="gap-2"
                      >
                        <Save className="w-4 h-4" />{' '}
                        {savingAnamnese ? 'Salvando...' : 'Salvar Anamnese'}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescricoes">
            <PrescriptionsList pacienteId={id} clinicInfo={clinicInfo} patientName={patient.nome} />
          </TabsContent>

          <TabsContent value="laudos" className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-800">Laudos Psicológicos</h3>
                <p className="text-sm text-slate-500">
                  Gere documentos formais com base no histórico do paciente.
                </p>
              </div>
              <Button onClick={() => setIsLaudoModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Gerar Laudo
              </Button>
            </div>

            {laudos.length === 0 ? (
              <Card className="p-12 text-center text-slate-500 border-dashed shadow-none bg-transparent">
                Nenhum laudo gerado para este paciente.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {laudos.map((l) => (
                  <Card key={l.id} className="shadow-sm">
                    <CardContent className="p-4 flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                          <FileCheck2 className="w-4 h-4 text-primary" /> Laudo Psicológico
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Emitido em {new Date(l.data_emissao).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printLaudo(l)}
                          className="gap-2"
                        >
                          <Printer className="w-4 h-4" /> Imprimir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mensagens" className="space-y-4">
            {mensagens.length === 0 ? (
              <Card className="p-12 text-center text-slate-500 border-dashed shadow-none bg-transparent">
                <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                Nenhuma mensagem registrada no histórico para este paciente.
              </Card>
            ) : (
              <div className="space-y-4">
                {mensagens.map((msg) => (
                  <Card key={msg.id} className="shadow-sm border-slate-200 overflow-hidden">
                    <div className="bg-slate-50/50 p-3 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-slate-700 capitalize">
                          {msg.tipo}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-medium">
                          {new Date(msg.data_envio).toLocaleString('pt-BR')}
                        </span>
                        {msg.status_envio === 'enviado' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4 text-sm text-slate-700 whitespace-pre-wrap">
                      {msg.conteudo}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isEvolModalOpen} onOpenChange={setIsEvolModalOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
            <DialogTitle className="text-xl">Anotações da Sessão</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="date">Data da Sessão</Label>
              <Input
                id="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-white max-w-[200px]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center mt-2">
                <Label htmlFor="content">Evolução Clínica</Label>
                {isTranscribing ? (
                  <div className="flex items-center text-sm text-primary gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Transcrevendo...
                  </div>
                ) : isRecording ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={stopRecording}
                    className="gap-2 animate-pulse"
                  >
                    <Square className="w-4 h-4" /> Parar Gravação
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={startRecording}
                    className="gap-2 text-primary border-primary hover:bg-primary/10"
                  >
                    <Mic className="w-4 h-4" /> Gravar por Voz (AI)
                  </Button>
                )}
              </div>
              <Textarea
                id="content"
                placeholder="Descreva as observações e evolução..."
                className="min-h-[250px] bg-white resize-y text-base p-4"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 bg-slate-50 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsEvolModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEvolucao} className="gap-2">
              <Save className="w-4 h-4" /> Salvar Evolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLaudoModalOpen} onOpenChange={setIsLaudoModalOpen}>
        <DialogContent className="sm:max-w-3xl p-0">
          <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
            <DialogTitle>Gerar Laudo Psicológico</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="flex gap-4 items-end">
              <div className="space-y-2 flex-1">
                <Label>Template de Laudo</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo base..." />
                  </SelectTrigger>
                  <SelectContent>
                    {laudoTemplates.length === 0 && (
                      <SelectItem value="empty" disabled>
                        Nenhum template encontrado (Crie em Configurações)
                      </SelectItem>
                    )}
                    {laudoTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateLaudo} variant="secondary" className="gap-2">
                <RefreshCw className="w-4 h-4" /> Preencher Dados
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Conteúdo do Laudo (Editável)</Label>
              <Textarea
                className="min-h-[300px] font-mono text-sm"
                value={laudoContent}
                onChange={(e) => setLaudoContent(e.target.value)}
                placeholder="Selecione o template e clique em preencher para carregar as informações do paciente e histórico..."
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 bg-slate-50 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsLaudoModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLaudo} disabled={!laudoContent.trim()}>
              Salvar Documento Oficial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div id="print-area" className="hidden bg-white text-black p-8 font-sans">
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-wider">
            {clinicInfo?.nome_consultorio || 'Consultório Clínico'}
          </h1>
          <p className="text-lg font-medium text-slate-600 mt-2">Prontuário de Evolução Clínica</p>
        </div>
        <div className="mb-8 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <p className="text-sm text-slate-500 uppercase font-semibold">Paciente</p>
            <p className="text-lg font-bold">{patient.nome}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 uppercase font-semibold">CPF</p>
            <p className="text-lg font-medium">{patient.cpf || 'Não informado'}</p>
          </div>
        </div>
        <div className="mb-10">
          <h2 className="text-xl font-bold border-b border-slate-300 mb-3 pb-1 uppercase">
            Queixa Principal
          </h2>
          <p className="whitespace-pre-wrap text-slate-800 text-[15px] leading-relaxed">
            {queixa || 'Nenhuma queixa registrada.'}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold border-b border-slate-300 mb-5 pb-1 uppercase">
            Histórico de Sessões
          </h2>
          <div className="space-y-8">
            {historico.map((entry) => (
              <div key={entry.id} className="break-inside-avoid">
                <p className="font-bold text-slate-900 bg-slate-100 inline-block px-3 py-1 rounded mb-2 border border-slate-200">
                  Sessão: {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
                <p className="whitespace-pre-wrap text-slate-800 text-[15px] leading-relaxed text-justify">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
