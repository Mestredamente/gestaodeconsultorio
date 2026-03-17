import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, FileText, Plus, Printer, Calendar, Edit2 } from 'lucide-react'
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
  const [historico, setHistorico] = useState<any[]>([])

  // Modal State
  const [isEvolModalOpen, setIsEvolModalOpen] = useState(false)
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [newContent, setNewContent] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return
      setLoading(true)

      // Fetch Patient
      const { data: pData } = await supabase.from('pacientes').select('*').eq('id', id).single()
      setPatient(pData)

      // Fetch Clinic Info
      const { data: cData } = await supabase
        .from('usuarios')
        .select('nome_consultorio')
        .eq('id', user.id)
        .single()
      setClinicInfo(cData)

      // Fetch Prontuario
      const { data: prData } = await supabase
        .from('prontuarios' as any)
        .select('*')
        .eq('paciente_id', id)
        .maybeSingle()

      if (prData) {
        setProntuarioId(prData.id)
        setQueixa(prData.queixa_principal || '')
        setHistorico(prData.historico_sessoes || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [id, user])

  const ensureProntuario = async () => {
    if (prontuarioId) return prontuarioId
    if (!user || !id) return null

    const { data, error } = await supabase
      .from('prontuarios' as any)
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
      .from('prontuarios' as any)
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
    if (!newContent.trim()) {
      toast({ title: 'Preencha a evolução', variant: 'destructive' })
      return
    }

    const pid = await ensureProntuario()
    if (!pid) return

    const newEntry = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      date: newDate,
      content: newContent,
    }

    const updatedHistorico = [newEntry, ...historico].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    const { error } = await supabase
      .from('prontuarios' as any)
      .update({ historico_sessoes: updatedHistorico })
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

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!patient) return <div className="text-center py-20">Paciente não encontrado.</div>

  return (
    <>
      <style media="print">
        {`
          body * {
            visibility: hidden;
          }
          #print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          html, body {
            background-color: white !important;
            min-height: 100%;
          }
          @page { size: auto; margin: 20mm; }
        `}
      </style>

      {/* Main UI */}
      <div className="space-y-8 animate-fade-in-up pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(`/pacientes/${id}`)}
              className="gap-2 -ml-4 text-slate-500 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para Detalhes
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" /> Prontuário Médico
            </h1>
            <p className="text-slate-500 text-sm mt-1">Paciente: {patient.nome}</p>
          </div>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Gerar PDF
          </Button>
        </div>

        <Card className="shadow-sm border-slate-200 border-t-4 border-t-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <CardTitle className="text-lg">Queixa Principal</CardTitle>
            {!isEditingQueixa && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditingQueixa(true)}>
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
                  placeholder="Descreva o motivo da consulta e a queixa principal do paciente..."
                  className="min-h-[120px] bg-slate-50"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditingQueixa(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveQueixa} className="gap-2">
                    <Save className="w-4 h-4" /> Salvar Queixa
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {queixa || (
                  <span className="text-slate-400 italic">
                    Nenhuma queixa principal registrada. Clique em editar para adicionar.
                  </span>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Histórico Clínico</h2>
            <Button onClick={() => setIsEvolModalOpen(true)} className="gap-2 rounded-full">
              <Plus className="w-4 h-4" /> Nova Evolução
            </Button>
          </div>

          {historico.length === 0 ? (
            <div className="text-center p-12 bg-white border border-dashed border-slate-300 rounded-xl shadow-sm">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">Sem registros</h3>
              <p className="text-slate-500 mt-1">
                Nenhuma evolução clínica foi registrada para este paciente ainda.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
              {historico.map((entry) => (
                <div key={entry.id} className="relative pl-6">
                  <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1 ring-4 ring-slate-50 shadow-sm" />
                  <div className="mb-3 flex items-center">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-2 border border-slate-200 shadow-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-5 text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px]">
                      {entry.content}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Evolução */}
      <Dialog open={isEvolModalOpen} onOpenChange={setIsEvolModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Nova Evolução Clínica</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data da Sessão</Label>
              <Input
                id="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-slate-50 w-full sm:w-auto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Anotações da Sessão</Label>
              <Textarea
                id="content"
                placeholder="Descreva as observações, intervenções e evolução..."
                className="min-h-[200px] bg-slate-50 resize-none"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEvolModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEvolucao} className="gap-2">
              <Save className="w-4 h-4" /> Salvar Evolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Only UI */}
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
          <div className="col-span-2">
            <p className="text-sm text-slate-500 uppercase font-semibold">Data de Nascimento</p>
            <p className="text-lg font-medium">
              {patient.data_nascimento
                ? new Date(patient.data_nascimento).toLocaleDateString('pt-BR')
                : 'Não informado'}
            </p>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-bold border-b border-slate-300 mb-3 pb-1 uppercase">
            Queixa Principal
          </h2>
          <p className="whitespace-pre-wrap text-slate-800 text-[15px] leading-relaxed">
            {queixa || 'Nenhuma queixa registrada no prontuário.'}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold border-b border-slate-300 mb-5 pb-1 uppercase">
            Histórico de Sessões
          </h2>
          {historico.length === 0 ? (
            <p className="text-slate-500 italic">Nenhum registro de evolução documentado.</p>
          ) : (
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
          )}
        </div>
      </div>
    </>
  )
}
