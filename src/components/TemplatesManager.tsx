import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Plus, FileText, ArrowLeft, Save } from 'lucide-react'

export function TemplatesManager() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)

  const fetchTemplates = async () => {
    if (!user) return
    const { data } = await supabase
      .from('templates_documentos')
      .select('*')
      .eq('usuario_id', user.id)
      .order('data_criacao', { ascending: false })
    if (data) setTemplates(data)
  }

  useEffect(() => {
    fetchTemplates()
  }, [user])

  const handleSave = async () => {
    if (!editing.titulo || !editing.conteudo) {
      toast({ title: 'Preencha título e conteúdo.', variant: 'destructive' })
      return
    }
    if (editing.id) {
      await supabase
        .from('templates_documentos')
        .update({ titulo: editing.titulo, conteudo: editing.conteudo, tipo: editing.tipo })
        .eq('id', editing.id)
    } else {
      await supabase
        .from('templates_documentos')
        .insert({
          usuario_id: user!.id,
          titulo: editing.titulo,
          conteudo: editing.conteudo,
          tipo: editing.tipo,
        })
    }
    setEditing(null)
    fetchTemplates()
    toast({ title: 'Template salvo com sucesso!' })
  }

  const handleDelete = async (id: string) => {
    await supabase.from('templates_documentos').delete().eq('id', id)
    fetchTemplates()
    toast({ title: 'Template removido!' })
  }

  if (editing) {
    return (
      <div className="space-y-5 animate-fade-in bg-white p-5 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(null)}
              className="text-slate-500 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
            <h3 className="font-bold text-lg text-slate-800">
              {editing.id ? 'Editar Modelo' : 'Novo Modelo'}
            </h3>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" /> Salvar
          </Button>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-600">Título do Documento</Label>
          <Input
            value={editing.titulo}
            onChange={(e) => setEditing({ ...editing, titulo: e.target.value })}
            placeholder="Ex: Contrato de Terapia Padrão"
            className="bg-slate-50 font-medium"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <Label className="text-slate-600">Conteúdo do Template</Label>
          </div>
          <p className="text-xs text-indigo-600 bg-indigo-50 p-2 rounded-md font-medium border border-indigo-100">
            Variáveis disponíveis: [Nome do Paciente], [CPF], [Data da Consulta], [Nome do
            Consultório]
          </p>
          <Textarea
            value={editing.conteudo}
            onChange={(e) => setEditing({ ...editing, conteudo: e.target.value })}
            className="min-h-[350px] bg-slate-50 leading-relaxed"
            placeholder="Cole o texto do seu contrato ou política aqui..."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-900">Biblioteca de Documentos</h3>
          <p className="text-sm text-slate-500">
            Crie modelos padronizados de contratos e termos de consentimento.
          </p>
        </div>
        <Button
          onClick={() => setEditing({ titulo: '', conteudo: '', tipo: 'contrato' })}
          className="gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Criar Modelo
        </Button>
      </div>
      <div className="grid gap-3">
        {templates.length === 0 && (
          <div className="text-slate-500 text-sm py-10 text-center border border-dashed border-slate-300 rounded-xl bg-white shadow-sm">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            Nenhum template cadastrado na biblioteca.
          </div>
        )}
        {templates.map((t) => (
          <Card
            key={t.id}
            className="cursor-pointer hover:border-primary hover:shadow-md transition-all active:scale-[0.99]"
            onClick={() => setEditing(t)}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{t.titulo}</p>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Atualizado em {new Date(t.data_criacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(t.id)
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
