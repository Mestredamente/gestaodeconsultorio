import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Send } from 'lucide-react'

export function SelfCareNewsletter() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user) fetchTemplates()
  }, [user])

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('templates_documentos')
      .select('*')
      .eq('usuario_id', user?.id)
      .eq('tipo', 'email_marketing')
    if (data) setTemplates(data)
  }

  const handleTemplateChange = (id: string) => {
    setSelectedTemplate(id)
    const t = templates.find((x) => x.id === id)
    if (t) {
      setTitulo(t.titulo)
      setConteudo(t.conteudo)
    }
  }

  const handleSend = async () => {
    if (!user || !titulo || !conteudo) return
    setSending(true)

    try {
      const res = await supabase.functions.invoke('enviar_comunicado_massa', {
        body: { titulo, conteudo, tipo: 'newsletter' },
      })

      if (res.error) throw res.error

      await supabase.from('notificacoes').insert({
        usuario_id: user.id,
        titulo: 'Newsletter Enviada',
        mensagem: `A newsletter "${titulo}" foi enviada para ${res.data?.count || 0} pacientes ativos.`,
      })

      toast({ title: 'Newsletter disparada com sucesso!' })
      setSelectedTemplate('')
      setTitulo('')
      setConteudo('')
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar newsletter',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-lg">Newsletter de Autocuidado</CardTitle>
        <CardDescription>
          Envie conteúdos terapêuticos e mensagens para seus pacientes ativos (consultas nos últimos
          90 dias).
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>Selecionar Template</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um modelo..." />
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

        <div className="space-y-2">
          <Label>Título (Assunto do Email)</Label>
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Assunto..."
          />
        </div>

        <div className="space-y-2">
          <Label>Conteúdo</Label>
          <Textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            className="min-h-[200px]"
            placeholder="Edite o conteúdo antes de enviar..."
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={sending || !titulo || !conteudo}
          className="w-full gap-2"
        >
          <Send className="w-4 h-4" />
          {sending ? 'Enviando...' : 'Disparar para Pacientes Ativos'}
        </Button>
      </CardContent>
    </Card>
  )
}
