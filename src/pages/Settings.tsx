import { useEffect, useState, useRef } from 'react'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import {
  Save,
  Copy,
  Upload,
  ImageIcon,
  Trash2,
  Plus,
  Scale,
  Calendar,
  UserRound,
  MessageCircle,
  Building2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TemplatesManager } from '@/components/TemplatesManager'

const predefinedApproaches = [
  'Terapia Cognitivo-Comportamental (TCC)',
  'Psicanálise',
  'Gestalt-terapia',
  'Fenomenologia',
  'Psicodrama',
  'Abordagem Centrada na Pessoa (ACP)',
  'Terapia Analítico-Comportamental (TAC)',
  'Psicologia Junguiana',
  'Terapia Sistêmica',
  'Neuropsicologia',
]

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [formData, setFormData] = useState({
    nome_consultorio: '',
    email: '',
    chave_pix: '',
    template_cobranca: '',
    logo_url: '',
    texto_contrato: '',
    politica_cancelamento: '',
    agendamento_publico_ativo: false,
    whatsapp_confirmacao_ativa: false,
    template_confirmacao: 'Olá [Nome], sua consulta foi agendada para [data] às [hora].',
    whatsapp_tipo: 'personal',
  })

  const [questions, setQuestions] = useState<any[]>([])
  const [lembreteAtivo, setLembreteAtivo] = useState(false)
  const [templateLembrete, setTemplateLembrete] = useState(
    'Olá [Nome], você tem uma consulta marcada conosco para [data] às [hora]. Confirme presena clicando aqui: [link_confirmacao]',
  )
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [novaEspecialidade, setNovaEspecialidade] = useState('')
  const [metaConsultas, setMetaConsultas] = useState(50)
  const [syncCals, setSyncCals] = useState({ google: false, outlook: false })
  const [userTemplates, setUserTemplates] = useState<any[]>([])

  const [convenios, setConvenios] = useState<any[]>([])
  const [novoConvenio, setNewConvenio] = useState({ nome: '', registro_ans: '', contato: '' })

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
              agendamento_publico_ativo: data.agendamento_publico_ativo || false,
              whatsapp_confirmacao_ativa: (data as any).whatsapp_confirmacao_ativa || false,
              template_confirmacao:
                (data as any).template_confirmacao ||
                'Olá [Nome], sua consulta foi agendada para [data] às [hora].',
              whatsapp_tipo: (data as any).whatsapp_tipo || 'personal',
            })
            setQuestions(data.anamnese_template || [])
            setLembreteAtivo(data.lembrete_whatsapp_ativo || false)
            setTemplateLembrete(data.template_lembrete || 'Olá [Nome]...')
            setEspecialidades(data.especialidades_disponiveis || [])
            setMetaConsultas(data.meta_mensal_consultas || 50)
            if (data.sync_calendarios) setSyncCals(data.sync_calendarios as any)
          }
        })

      supabase
        .from('templates_documentos')
        .select('id, titulo, conteudo')
        .eq('usuario_id', user.id)
        .then(({ data }) => {
          if (data) setUserTemplates(data)
        })

      fetchConvenios()
    }
  }, [user])

  const fetchConvenios = async () => {
    if (!user) return
    const { data } = await supabase
      .from('convenios' as any)
      .select('*')
      .eq('usuario_id', user.id)
    if (data) setConvenios(data)
  }

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
      meta_mensal_consultas: metaConsultas,
      sync_calendarios: syncCals,
    }
    const { error } = await supabase.from('usuarios').upsert(payload as any)
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploadingLogo(true)
    try {
      const fileExt = file.name.split('.').pop()
      const path = `${user.id}/logo-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('logos').upload(path, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('logos').getPublicUrl(path)

      setFormData((prev) => ({ ...prev, logo_url: data.publicUrl }))
      await supabase.from('usuarios').update({ logo_url: data.publicUrl }).eq('id', user.id)

      toast({ title: 'Foto atualizada com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao enviar foto', description: err.message, variant: 'destructive' })
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddConvenio = async () => {
    if (!novoConvenio.nome.trim()) return
    const { error } = await supabase.from('convenios' as any).insert({
      usuario_id: user?.id,
      nome: novoConvenio.nome,
      registro_ans: novoConvenio.registro_ans,
      contato: novoConvenio.contato,
    })
    if (!error) {
      setNewConvenio({ nome: '', registro_ans: '', contato: '' })
      fetchConvenios()
      toast({ title: 'Convênio adicionado!' })
    } else {
      toast({ title: 'Erro ao adicionar convênio', variant: 'destructive' })
    }
  }

  const handleDeleteConvenio = async (id: string) => {
    await supabase
      .from('convenios' as any)
      .delete()
      .eq('id', id)
    fetchConvenios()
    toast({ title: 'Convênio removido!' })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações Gerais</h1>
      <form onSubmit={handleSave}>
        <Tabs
          defaultValue="perfil"
          className="w-full bg-white shadow-sm border-slate-200 border rounded-xl overflow-hidden"
        >
          <TabsList className="w-full flex flex-wrap justify-start rounded-none border-b border-slate-100 bg-slate-50/50 p-0 h-auto">
            <TabsTrigger
              value="perfil"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-2"
            >
              <UserRound className="w-4 h-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </TabsTrigger>
            <TabsTrigger
              value="convenios"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" /> Convênios
            </TabsTrigger>
            <TabsTrigger
              value="especialidades"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Especialidades
            </TabsTrigger>
            <TabsTrigger
              value="juridico"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Jurídico
            </TabsTrigger>
            <TabsTrigger
              value="modelos"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Modelos
            </TabsTrigger>
            <TabsTrigger
              value="integracoes"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Integrações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="p-6 m-0 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Informações do Profissional</h3>
              <p className="text-sm text-slate-500 mb-4">
                Esta foto e nome serão exibidos no seu perfil e portal do paciente.
              </p>

              <div className="flex flex-col sm:flex-row gap-8 items-start bg-slate-50/50 p-5 rounded-lg border border-slate-100">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="w-28 h-28 border-4 border-white shadow-sm">
                    <AvatarImage src={formData.logo_url} className="object-cover" />
                    <AvatarFallback className="bg-slate-100">
                      {uploadingLogo ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      ) : (
                        <ImageIcon className="w-10 h-10 text-slate-400" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={uploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingLogo ? 'Enviando...' : 'Alterar Foto'}
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <p className="text-[10px] text-slate-400 text-center">
                    JPG, PNG ou WebP. Máx 2MB.
                  </p>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Consultório / Profissional</Label>
                      <Input
                        value={formData.nome_consultorio}
                        onChange={(e) =>
                          setFormData({ ...formData, nome_consultorio: e.target.value })
                        }
                        required
                        placeholder="Dr. João Silva"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail de Contato</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Mensal de Atendimentos</Label>
                      <Input
                        type="number"
                        min="1"
                        value={metaConsultas}
                        onChange={(e) => setMetaConsultas(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Chave PIX (Cobrança)</Label>
                      <Input
                        value={formData.chave_pix}
                        onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                        placeholder="CPF, E-mail ou Celular"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="p-6 m-0 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-500" /> Integração WhatsApp e
                WhatsApp Business
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Configure as mensagens automáticas enviadas para os pacientes.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-4">
                <div>
                  <Label className="text-base font-semibold text-slate-800">Tipo de WhatsApp</Label>
                  <p className="text-sm text-slate-500 mb-3">
                    Selecione qual versão do aplicativo você utiliza para as mensagens.
                  </p>
                </div>
                <RadioGroup
                  value={formData.whatsapp_tipo}
                  onValueChange={(v) => setFormData({ ...formData, whatsapp_tipo: v })}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personal" id="settings-personal" />
                    <Label htmlFor="settings-personal" className="cursor-pointer">
                      WhatsApp Pessoal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="settings-business" />
                    <Label htmlFor="settings-business" className="cursor-pointer">
                      WhatsApp Business
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold text-slate-800">
                      Confirmação Automática de Agendamento
                    </Label>
                    <p className="text-sm text-slate-500">
                      Envia uma mensagem assim que a consulta é marcada.
                    </p>
                  </div>
                  <Switch
                    checked={formData.whatsapp_confirmacao_ativa}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, whatsapp_confirmacao_ativa: v })
                    }
                  />
                </div>
                {formData.whatsapp_confirmacao_ativa && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <Label>Template de Confirmação</Label>
                    <Textarea
                      value={formData.template_confirmacao}
                      onChange={(e) =>
                        setFormData({ ...formData, template_confirmacao: e.target.value })
                      }
                      rows={3}
                      className="bg-white"
                    />
                    <p className="text-xs text-slate-500">
                      Variáveis: [Nome], [data], [hora], [TipoSessao], [link_portal],
                      [link_confirmacao]
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold text-slate-800">
                      Lembretes de Sessões (24h antes)
                    </Label>
                    <p className="text-sm text-slate-500">
                      Envia um lembrete automático 1 dia antes da consulta.
                    </p>
                  </div>
                  <Switch checked={lembreteAtivo} onCheckedChange={setLembreteAtivo} />
                </div>
                {lembreteAtivo && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <Label>Template de Lembrete</Label>
                    <Textarea
                      value={templateLembrete}
                      onChange={(e) => setTemplateLembrete(e.target.value)}
                      rows={3}
                      className="bg-white"
                    />
                    <p className="text-xs text-slate-500">
                      Variáveis: [Nome], [data], [hora], [TipoSessao], [link_portal],
                      [link_confirmacao]
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-4">
                <div>
                  <Label className="text-base font-semibold text-slate-800">
                    Cobrança de Valores Pendentes
                  </Label>
                  <p className="text-sm text-slate-500 mb-3">
                    Template utilizado ao acionar a cobrança manual na aba do paciente.
                  </p>
                </div>
                <div className="space-y-2">
                  <Textarea
                    value={formData.template_cobranca}
                    onChange={(e) =>
                      setFormData({ ...formData, template_cobranca: e.target.value })
                    }
                    rows={3}
                    className="bg-white"
                  />
                  <p className="text-xs text-slate-500">
                    Variáveis: [Nome], [valor], [periodo], [chave_pix]
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="convenios" className="p-6 m-0 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Operadoras de Saúde e Convênios
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Cadastre os convênios aceitos na clínica para vinculá-los aos agendamentos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="space-y-1 w-full flex-1">
                <Label>Nome do Convênio</Label>
                <Input
                  value={novoConvenio.nome}
                  onChange={(e) => setNewConvenio({ ...novoConvenio, nome: e.target.value })}
                  placeholder="Ex: SulAmérica, Bradesco Saúde..."
                  className="bg-white"
                />
              </div>
              <div className="space-y-1 w-full sm:w-48">
                <Label>Registro ANS</Label>
                <Input
                  value={novoConvenio.registro_ans}
                  onChange={(e) =>
                    setNewConvenio({ ...novoConvenio, registro_ans: e.target.value })
                  }
                  placeholder="Opcional"
                  className="bg-white"
                />
              </div>
              <div className="space-y-1 w-full sm:w-48">
                <Label>Contato/Portal</Label>
                <Input
                  value={novoConvenio.contato}
                  onChange={(e) => setNewConvenio({ ...novoConvenio, contato: e.target.value })}
                  placeholder="Telefone ou site"
                  className="bg-white"
                />
              </div>
              <Button type="button" onClick={handleAddConvenio} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {convenios.length === 0 && (
                <div className="text-center py-6 text-slate-500 border border-dashed rounded-lg">
                  Nenhum convênio cadastrado.
                </div>
              )}
              {convenios.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center bg-white px-4 py-3 rounded-md border border-slate-200 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{c.nome}</p>
                    <p className="text-xs text-slate-500">
                      {c.registro_ans && `ANS: ${c.registro_ans}`}
                      {c.registro_ans && c.contato && ' | '}
                      {c.contato && `Contato: ${c.contato}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteConvenio(c.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="especialidades" className="p-6 m-0 space-y-5">
            <div>
              <h3 className="font-semibold text-slate-900">Especialidades e Abordagens</h3>
              <p className="text-sm text-slate-500">
                Cadastre as abordagens psicológicas e serviços que ficarão disponíveis para
                agendamento.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={novaEspecialidade}
                onChange={(e) => setNovaEspecialidade(e.target.value)}
                placeholder="Ex: Terapia de Casal..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEspecialidade())}
              />
              <Button type="button" onClick={addEspecialidade} variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {predefinedApproaches.map((a) => (
                <Button
                  key={a}
                  variant="outline"
                  size="sm"
                  type="button"
                  className="text-xs"
                  onClick={() => {
                    if (!especialidades.includes(a)) setEspecialidades([...especialidades, a])
                  }}
                >
                  + {a}
                </Button>
              ))}
            </div>
            <div className="space-y-2 pt-4">
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
                Textos exibidos no Portal do Paciente para leitura e aceite digital.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <Label>Contrato de Prestação de Serviços</Label>
                  {userTemplates.length > 0 && (
                    <Select
                      onValueChange={(val) => {
                        const t = userTemplates.find((x) => x.id === val)
                        if (t) setFormData({ ...formData, texto_contrato: t.conteudo })
                      }}
                    >
                      <SelectTrigger className="w-[200px] h-8 text-xs bg-white border-slate-200">
                        <SelectValue placeholder="Carregar Template" />
                      </SelectTrigger>
                      <SelectContent>
                        {userTemplates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.titulo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Textarea
                  value={formData.texto_contrato}
                  onChange={(e) => setFormData({ ...formData, texto_contrato: e.target.value })}
                  className="min-h-[150px]"
                  placeholder="Termos do tratamento..."
                />
              </div>
              <div className="space-y-2">
                <Label>Política de Cancelamento</Label>
                <Textarea
                  value={formData.politica_cancelamento}
                  onChange={(e) =>
                    setFormData({ ...formData, politica_cancelamento: e.target.value })
                  }
                  className="min-h-[100px]"
                  placeholder="Regras sobre remarcações..."
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="modelos" className="p-6 m-0">
            <TemplatesManager />
          </TabsContent>

          <TabsContent value="integracoes" className="p-6 m-0 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Integração de Calendários
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Sincronize sua agenda com serviços externos para evitar conflitos.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-4">
                  <img
                    src="https://img.usecurling.com/i?q=google&color=multicolor"
                    alt="Google"
                    className="w-8 h-8 rounded"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">Google Calendar</p>
                    <p className="text-xs text-slate-500">
                      Sincronização bidirecional em tempo real.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={syncCals.google}
                  onCheckedChange={(v) => setSyncCals({ ...syncCals, google: v })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-4">
                  <img
                    src="https://img.usecurling.com/i?q=microsoft&color=multicolor"
                    alt="Outlook"
                    className="w-8 h-8 rounded"
                  />
                  <div>
                    <p className="font-semibold text-slate-800">Outlook Calendar</p>
                    <p className="text-xs text-slate-500">
                      Sincronização bidirecional em tempo real.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={syncCals.outlook}
                  onCheckedChange={(v) => setSyncCals({ ...syncCals, outlook: v })}
                />
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <Label className="text-base">Agendamento Público Online</Label>
                  <p className="text-sm text-slate-500">
                    Permite que pacientes agendem sozinhos pelos horários disponíveis na sua agenda.
                  </p>
                </div>
                <Switch
                  checked={formData.agendamento_publico_ativo}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, agendamento_publico_ativo: v })
                  }
                />
              </div>
            </div>
          </TabsContent>

          <div className="p-6 pt-0 flex flex-col sm:flex-row gap-4 mt-4">
            <Button type="submit" className="gap-2 flex-1 sm:flex-none" disabled={loading}>
              <Save className="w-4 h-4" /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 flex-1 sm:flex-none"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/agendar/${user?.id}`)
                toast({ title: 'Link de agendamento copiado!' })
              }}
            >
              <Copy className="w-4 h-4" /> Copiar Link de Agendamento Público
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
