import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Save, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function TemplatesManager({
  defaultTipo = 'contrato',
  title = 'Modelos de Documentos',
  description = 'Crie templates de contratos, laudos e e-mails',
}: {
  defaultTipo?: string
  title?: string
  description?: string
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({ titulo: '', conteudo: '', tipo: defaultTipo })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchTemplates()
    }
  }, [user])

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('templates_documentos')
      .select('*')
      .eq('usuario_id', user?.id)
      .order('data_criacao', { ascending: false })
    if (data) setTemplates(data)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const payload = {
      usuario_id: user.id,
      titulo: formData.titulo,
      conteudo: formData.conteudo,
      tipo: formData.tipo,
    }

    let error
    if (editingId) {
      const { error: err } = await supabase
        .from('templates_documentos')
        .update(payload)
        .eq('id', editingId)
      error = err
    } else {
      const { error: err } = await supabase.from('templates_documentos').insert(payload)
      error = err
    }

    if (!error) {
      toast({ title: 'Modelo salvo com sucesso!' })
      setIsOpen(false)
      fetchTemplates()
      setFormData({ titulo: '', conteudo: '', tipo: defaultTipo })
      setEditingId(null)
    } else {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('templates_documentos').delete().eq('id', id)
    if (!error) {
      toast({ title: 'Modelo excluído' })
      fetchTemplates()
    }
  }

  const openEdit = (t: any) => {
    setFormData({ titulo: t.titulo, conteudo: t.conteudo, tipo: t.tipo })
    setEditingId(t.id)
    setIsOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(v) => {
            setIsOpen(v)
            if (!v) {
              setFormData({ titulo: '', conteudo: '', tipo: defaultTipo })
              setEditingId(null)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Modelo' : 'Novo Modelo'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título do Modelo</Label>
                  <Input
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contrato">Contrato / Termos</SelectItem>
                      <SelectItem value="laudo">Laudo / Atestado</SelectItem>
                      <SelectItem value="prescricao">Prescrição</SelectItem>
                      <SelectItem value="email_marketing">Email / Comunicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <Textarea
                  required
                  className="min-h-[250px]"
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                />
                <p className="text-xs text-slate-500">
                  Dica: Use variáveis como [Nome do Paciente], [CPF], [Nome do Consultório]
                </p>
              </div>
              <Button type="submit" className="w-full gap-2">
                <Save className="w-4 h-4" /> Salvar Modelo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <Card key={t.id} className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex flex-col h-full justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-slate-800 line-clamp-1 flex-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    {t.titulo}
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {t.tipo.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{t.conteudo}</p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(t.id)}
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {templates.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            Nenhum modelo cadastrado.
          </div>
        )}
      </div>
    </div>
  )
}
