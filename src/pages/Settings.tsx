import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Save, Copy, Upload, ImageIcon, Trash2, Plus, Scale } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_consultorio: '',
    email: '',
    chave_pix: '',
    template_cobranca: '',
    logo_url: '',
    texto_contrato: '',
    politica_cancelamento: '',
  })

  const [questions, setQuestions] = useState<any[]>([])
  const [lembreteAtivo, setLembreteAtivo] = useState(false)
  const [templateLembrete, setTemplateLembrete] = useState(
    'Olá [Nome], você tem uma consulta marcada conosco para [data] às [hora].',
  )
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [novaEspecialidade, setNovaEspecialidade] = useState('')

  useEffect(() => {
    if (user) {
      supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFormData({
              nome_consultorio: data.nome_consultorio || '',
              email: data.email || user.email || '',
              chave_pix: data.chave_pix || '',
              template_cobranca: data.template_cobranca || '',
              logo_url: data.logo_url || '',
              texto_contrato: data.texto_contrato || '',
              politica_cancelamento: data.politica_cancelamento || '',
            })
            setQuestions(data.anamnese_template || [])
            setLembreteAtivo(data.lembrete_whatsapp_ativo || false)
            setTemplateLembrete(
              data.template_lembrete ||
                'Olá [Nome], você tem uma consulta marcada conosco para [data] às [hora].',
            )
            setEspecialidades(data.especialidades_disponiveis || [])
          }
        })
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...formData,
      id: user?.id,
      anamnese_template: questions,
      lembrete_whatsapp_ativo: lembreteAtivo,
      template_lembrete: templateLembrete,
      especialidades_disponiveis: especialidades,
    }
    const { error } = await supabase.from('usuarios').upsert(payload)
    setLoading(false)
    if (error)
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    else toast({ title: 'Configurações salvas!' })
  }

  const addEspecialidade = () => {
    if (novaEspecialidade.trim() && !especialidades.includes(novaEspecialidade.trim())) {
      setEspecialidades([...especialidades, novaEspecialidade.trim()])
      setNovaEspecialidade('')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up pb-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações Gerais</h1>
      <form onSubmit={handleSave}>
        <Tabs
          defaultValue="perfil"
          className="w-full bg-white shadow-sm border-slate-200 border rounded-xl overflow-hidden"
        >
          <TabsList className="w-full flex flex-wrap justify-start rounded-none border-b border-slate-100 bg-slate-50/50 p-0 h-auto">
            <TabsTrigger
              value="perfil"
              className="rounded-none py-3 px-4 sm:px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Perfil
            </TabsTrigger>
            <TabsTrigger
              value="especialidades"
              className="rounded-none py-3 px-4 sm:px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Especialidades
            </TabsTrigger>
            <TabsTrigger
              value="juridico"
              className="rounded-none py-3 px-4 sm:px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Jurídico & Contratos
            </TabsTrigger>
            <TabsTrigger
              value="anamnese"
              className="rounded-none py-3 px-4 sm:px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Anamnese
            </TabsTrigger>
            <TabsTrigger
              value="lembretes"
              className="rounded-none py-3 px-4 sm:px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Lembretes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="p-6 m-0 space-y-5">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="w-24 h-24 border-2 border-slate-200">
                  <AvatarImage src={formData.logo_url} />
                  <AvatarFallback>
                    <ImageIcon className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" /> Alterar Logo
                </Button>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file || !user) return
                    const path = `${user.id}/logo-${Date.now()}`
                    await supabase.storage.from('logos').upload(path, file)
                    const { data } = supabase.storage.from('logos').getPublicUrl(path)
                    setFormData({ ...formData, logo_url: data.publicUrl })
                  }}
                />
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Consultório</Label>
                    <Input
                      value={formData.nome_consultorio}
                      onChange={(e) =>
                        setFormData({ ...formData, nome_consultorio: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail Contato</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Chave PIX (Cobrança)</Label>
                    <Input
                      value={formData.chave_pix}
                      onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Label>Template de Cobrança WhatsApp</Label>
              <p className="text-xs text-slate-500">
                Variáveis: [Nome], [valor], [periodo], [chave_pix]
              </p>
              <Textarea
                value={formData.template_cobranca}
                onChange={(e) => setFormData({ ...formData, template_cobranca: e.target.value })}
                className="resize-none"
              />
            </div>
          </TabsContent>

          <TabsContent value="especialidades" className="p-6 m-0 space-y-5">
            <div>
              <h3 className="font-semibold text-slate-900">Especialidades e Serviços</h3>
              <p className="text-sm text-slate-500">
                Cadastre as opções que ficarão disponíveis para agendamento.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={novaEspecialidade}
                onChange={(e) => setNovaEspecialidade(e.target.value)}
                placeholder="Ex: Terapia de Casal, Avaliação Neuropsicológica..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEspecialidade())}
              />
              <Button type="button" onClick={addEspecialidade} variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {especialidades.length === 0 && (
                <p className="text-sm text-slate-400">Nenhuma especialidade cadastrada.</p>
              )}
              {especialidades.map((esp, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-md border border-slate-100"
                >
                  <span className="text-sm font-medium">{esp}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setEspecialidades(especialidades.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="juridico" className="p-6 m-0 space-y-5">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" /> Textos Legais e Políticas
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Estes textos serão exibidos no Portal do Paciente para leitura e aceite digital.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Contrato de Prestação de Serviços</Label>
                <p className="text-xs text-slate-500">
                  Insira as cláusulas de atendimento, honorários e confidencialidade.
                </p>
                <Textarea
                  value={formData.texto_contrato}
                  onChange={(e) => setFormData({ ...formData, texto_contrato: e.target.value })}
                  className="min-h-[150px]"
                  placeholder="Termos e condições do tratamento psicológico..."
                />
              </div>
              <div className="space-y-2">
                <Label>Política de Cancelamento e Faltas</Label>
                <p className="text-xs text-slate-500">
                  Regras sobre remarcações, prazos e cobranças em caso de falta.
                </p>
                <Textarea
                  value={formData.politica_cancelamento}
                  onChange={(e) =>
                    setFormData({ ...formData, politica_cancelamento: e.target.value })
                  }
                  className="min-h-[100px]"
                  placeholder="Consultas desmarcadas com menos de 24h de antecedência..."
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="anamnese" className="p-6 m-0 space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900">Campos do Formulário Público</h3>
                <p className="text-sm text-slate-500">
                  Crie as perguntas que os pacientes responderão antes da consulta.
                </p>
              </div>
              <Button
                type="button"
                onClick={() =>
                  setQuestions([
                    ...questions,
                    { id: Date.now().toString(), label: '', type: 'text' },
                  ])
                }
                size="sm"
              >
                Adicionar Pergunta
              </Button>
            </div>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-slate-50 p-3 rounded-lg border border-slate-100"
                >
                  <div className="flex-1 w-full space-y-1">
                    <Label>Pergunta</Label>
                    <Input
                      value={q.label}
                      onChange={(e) => {
                        const n = [...questions]
                        n[idx].label = e.target.value
                        setQuestions(n)
                      }}
                    />
                  </div>
                  <div className="w-full sm:w-40 space-y-1">
                    <Label>Tipo</Label>
                    <Select
                      value={q.type}
                      onValueChange={(val) => {
                        const n = [...questions]
                        n[idx].type = val
                        setQuestions(n)
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto Curto</SelectItem>
                        <SelectItem value="textarea">Texto Longo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 bg-white"
                    onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="text-center p-6 text-slate-500 border border-dashed rounded-lg">
                  Nenhuma pergunta configurada.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lembretes" className="p-6 m-0 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <Label className="text-base">Lembretes Automáticos</Label>
                <p className="text-sm text-slate-500">
                  Envia WhatsApp 24h antes da consulta agendada.
                </p>
              </div>
              <Switch checked={lembreteAtivo} onCheckedChange={setLembreteAtivo} />
            </div>
            {lembreteAtivo && (
              <div className="space-y-2 pt-2">
                <Label>Mensagem do Lembrete</Label>
                <p className="text-xs text-slate-500">
                  Variáveis dinâmicas: [Nome], [hora], [data]
                </p>
                <Textarea
                  value={templateLembrete}
                  onChange={(e) => setTemplateLembrete(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </TabsContent>

          <div className="p-6 pt-0 border-t border-slate-100 flex flex-col sm:flex-row gap-4 mt-6">
            <Button type="submit" className="gap-2 flex-1 sm:flex-none" disabled={loading}>
              <Save className="w-4 h-4" /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 flex-1 sm:flex-none"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/agendar/${user?.id}`)
                toast({ title: 'Link copiado!' })
              }}
            >
              <Copy className="w-4 h-4" /> Link de Agendamento
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
