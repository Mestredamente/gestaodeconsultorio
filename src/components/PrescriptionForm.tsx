import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Save } from 'lucide-react'

export default function PrescriptionForm({
  pacienteId,
  onCancel,
  onSuccess,
}: {
  pacienteId: string
  onCancel: () => void
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tipo, setTipo] = useState('prescricao')
  const [items, setItems] = useState([{ nome: '', instrucoes: '', tipo: 'medicamento' }])
  const [laudoText, setLaudoText] = useState('')
  const [templates, setTemplates] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      supabase
        .from('templates_documentos')
        .select('*')
        .eq('usuario_id', user.id)
        .in('tipo', ['laudo', 'prescricao'])
        .then(({ data }) => {
          if (data) setTemplates(data)
        })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    const conteudo =
      tipo === 'laudo'
        ? [{ tipo: 'laudo', nome: 'Laudo/Atestado', instrucoes: laudoText }]
        : items.filter((i) => i.nome.trim())

    if (conteudo.length === 0) {
      return toast({ title: 'Documento vazio', variant: 'destructive' })
    }

    const { data: userData } = await supabase
      .from('usuarios')
      .select('nome_consultorio')
      .eq('id', user.id)
      .single()

    const { error } = await supabase.from('prescricoes').insert({
      paciente_id: pacienteId,
      usuario_id: user.id,
      medico_nome: userData?.nome_consultorio || 'Profissional',
      conteudo_json: conteudo,
      data_emissao: new Date().toISOString(),
    })

    if (!error) {
      toast({ title: 'Documento emitido e assinado digitalmente!' })
      onSuccess()
    } else {
      toast({ title: 'Erro ao emitir', description: error.message, variant: 'destructive' })
    }
  }

  const applyTemplate = (tId: string) => {
    const t = templates.find((x) => x.id === tId)
    if (!t) return
    if (t.tipo === 'laudo') {
      setTipo('laudo')
      setLaudoText(t.conteudo)
    } else {
      setTipo('prescricao')
      setItems([{ nome: t.titulo, instrucoes: t.conteudo, tipo: 'medicamento' }])
    }
  }

  return (
    <Card className="shadow-sm border-slate-200 animate-fade-in">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1 w-64">
            <Label>Tipo de Documento</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prescricao">Prescrição / Receita</SelectItem>
                <SelectItem value="laudo">Laudo / Atestado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {templates.length > 0 && (
            <div className="w-64 space-y-1">
              <Label>Usar Modelo</Label>
              <Select onValueChange={applyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um modelo..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {tipo === 'laudo' ? (
          <div className="space-y-2">
            <Label>Conteúdo do Laudo/Atestado</Label>
            <Textarea
              className="min-h-[250px] resize-y"
              value={laudoText}
              onChange={(e) => setLaudoText(e.target.value)}
              placeholder="Descreva o laudo, encaminhamento ou atestado..."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border border-slate-100"
              >
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label>Nome (Medicamento, Exame, etc)</Label>
                    <Input
                      value={item.nome}
                      onChange={(e) => {
                        const newItems = [...items]
                        newItems[idx].nome = e.target.value
                        setItems(newItems)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instruções de Uso / Observações</Label>
                    <Textarea
                      value={item.instrucoes}
                      onChange={(e) => {
                        const newItems = [...items]
                        newItems[idx].instrucoes = e.target.value
                        setItems(newItems)
                      }}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 mt-6"
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() =>
                setItems([...items, { nome: '', instrucoes: '', tipo: 'medicamento' }])
              }
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Item
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" /> Emitir Documento
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
