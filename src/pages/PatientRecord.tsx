import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, FileText, Plus, Printer, Calendar, Edit2, Clock } from 'lucide-react'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PrescriptionsList } from '@/components/PrescriptionsList'

type HistoricoEntry = { id: string; date: string; content: string }

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

  const [isEvolModalOpen, setIsEvolModalOpen] = useState(false)
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newContent, setNewContent] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return
      setLoading(true)
      const { data: pData } = await supabase.from('pacientes').select('*').eq('id', id).single()
      setPatient(pData)
      const { data: cData } = await supabase
        .from('usuarios')
        .select('nome_consultorio')
        .eq('id', user.id)
        .single()
      setClinicInfo(cData)
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
      setLoading(false)
    }
    fetchData()
  }, [id, user])

  const ensureProntuario = async () => {
    if (prontuarioId) return prontuarioId
    if (!user || !id) return null
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

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  if (!patient) return <div className="text-center py-20">Paciente não encontrado.</div>

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
          <Button variant="outline" onClick={() => window.print()} className="gap-2 shadow-sm">
            <Printer className="w-4 h-4" /> Exportar PDF
          </Button>
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
          <TabsList className="mb-6 h-auto p-1 bg-slate-100/50 border border-slate-200">
            <TabsTrigger value="historico" className="gap-2 py-2.5 px-4">
              <Clock className="w-4 h-4" /> Histórico Clínico
            </TabsTrigger>
            <TabsTrigger value="prescricoes" className="gap-2 py-2.5 px-4">
              <FileText className="w-4 h-4" /> Prescrições
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

          <TabsContent value="prescricoes">
            <PrescriptionsList pacienteId={id} clinicInfo={clinicInfo} patientName={patient.nome} />
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
              <Label htmlFor="content">Evolução Clínica</Label>
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
