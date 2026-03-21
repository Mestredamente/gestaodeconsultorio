import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, Save, FileText, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PatientRecord() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [patient, setPatient] = useState<any>(null)
  const [record, setRecord] = useState<any>(null)
  
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState('Evolução Clínica')
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    if (!user || !id) return
    setLoading(true)
    
    const { data: pat } = await supabase.from('pacientes').select('nome, data_nascimento').eq('id', id).single()
    if (pat) setPatient(pat)
    
    let { data: rec } = await supabase.from('prontuarios').select('*').eq('paciente_id', id).maybeSingle()
    
    if (!rec) {
      const { data: newRec } = await supabase.from('prontuarios').insert({
        paciente_id: id,
        usuario_id: user.id,
        historico_sessoes: []
      }).select().single()
      rec = newRec
    }
    
    if (rec) setRecord(rec)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [user, id])

  const handleSaveNote = async () => {
    if (!user || !record || !newNote.trim()) return
    setSaving(true)
    
    const history = Array.isArray(record.historico_sessoes) ? record.historico_sessoes : []
    const entry = {
      data: new Date().toISOString(),
      tipo: noteType,
      descricao: newNote
    }
    
    const updatedHistory = [entry, ...history]
    
    try {
      await supabase.from('prontuarios').update({
        historico_sessoes: updatedHistory
      }).eq('id', record.id)
      
      setRecord({ ...record, historico_sessoes: updatedHistory })
      setNewNote('')
      toast({ title: 'Evolução salva com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateComplaint = async (val: string) => {
    if (!record) return
    setRecord({ ...record, queixa_principal: val })
    await supabase.from('prontuarios').update({ queixa_principal: val }).eq('id', record.id)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/pacientes/${id}`)} className="rounded-full bg-slate-100 hover:bg-slate-200 shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 line-clamp-1">{patient?.nome}</h1>
          <p className="text-slate-500">Prontuário Eletrônico</p>
        </div>
      </div>

      <Card className="rounded-[2rem] shadow-sm border-slate-200">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-base font-bold flex items-center gap-2 text-slate-800">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Queixa Principal / Hipótese Diagnóstica
            </Label>
            <Textarea 
              value={record?.queixa_principal || ''}
              onChange={(e) => handleUpdateComplaint(e.target.value)}
              placeholder="Descreva a queixa principal do paciente para manter no topo do prontuário..."
              className="bg-amber-50/30 border-amber-100 focus-visible:ring-amber-200 min-h-[80px] rounded-xl text-sm md:text-base"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] shadow-sm border-slate-200">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Label className="text-base font-bold flex items-center gap-2 text-slate-800">
                <FileText className="w-4 h-4 text-primary" /> Nova Evolução
              </Label>
              <select 
                value={noteType} 
                onChange={(e) => setNoteType(e.target.value)}
                className="h-9 rounded-lg border-slate-200 text-sm bg-slate-50 px-3 w-full sm:w-auto"
              >
                <option>Evolução Clínica</option>
                <option>Avaliação Psicológica</option>
                <option>Contato Extra-Sessão</option>
              </select>
            </div>
            <Textarea 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Digite as notas da sessão de hoje..."
              className="min-h-[150px] bg-slate-50 rounded-xl resize-none text-sm md:text-base"
            />
            <div className="flex justify-end">
              <Button onClick={handleSaveNote} disabled={saving || !newNote.trim()} className="rounded-xl px-6 w-full sm:w-auto h-11">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Salvar Evolução
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {record?.historico_sessoes?.length === 0 ? (
          <div className="text-center py-10 text-slate-400 font-medium relative z-10 bg-slate-50 rounded-2xl mx-12">Nenhuma evolução registrada ainda.</div>
        ) : (
          record?.historico_sessoes?.map((entry: any, idx: number) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-primary text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                <Clock className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 md:p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow ml-4 md:ml-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base">{entry.tipo}</h3>
                  <time className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md self-start sm:self-auto">{new Date(entry.data).toLocaleString('pt-BR')}</time>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{entry.descricao}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
