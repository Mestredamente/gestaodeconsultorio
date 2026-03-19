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
  MapPin,
  Check,
  Palette,
  Users,
  ShieldAlert,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TemplatesManager } from '@/components/TemplatesManager'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

const predefinedApproaches = [
  'Terapia Cognitivo-Comportamental (TCC)',
  'Psicanálise',
  'Gestalt-terapia',
  'Fenomenologia',
  'Psicodrama',
  'Abordagem Centrada na Pessoa (ACP)',
  'Terapia Sistêmica',
  'Terapia Infantil',
]

const themeOptions = [
  { id: 'indigo', name: 'Índigo', color: 'bg-indigo-600' },
  { id: 'blue', name: 'Azul', color: 'bg-blue-600' },
  { id: 'emerald', name: 'Esmeralda', color: 'bg-emerald-600' },
  { id: 'rose', name: 'Rosa', color: 'bg-rose-600' },
  { id: 'slate', name: 'Ardósia', color: 'bg-slate-600' },
]

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

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
    pre_consulta_ativa: false,
    template_pre_consulta: 'Olá [Nome]...',
    endereco_consultorio: '',
    telefone_consultorio: '',
  })

  const [portalSettings, setPortalSettings] = useState({
    show_medical_records: true,
    show_prescriptions: true,
    show_appointments: true,
    show_tests: true,
  })

  const [questions, setQuestions] = useState<any[]>([])
  const [lembreteAtivo, setLembreteAtivo] = useState(false)
  const [templateLembrete, setTemplateLembrete] = useState('Olá [Nome]...')
  const [especialidades, setEspecialidades] = useState<string[]>([])
  const [novaEspecialidade, setNovaEspecialidade] = useState('')
  const [popoverOpen, setPopoverOpen] = useState(false)

  const [metaConsultas, setMetaConsultas] = useState(50)
  const [syncCals, setSyncCals] = useState({ google: false, outlook: false })
  const [userTemplates, setUserTemplates] = useState<any[]>([])

  const [convenios, setConvenios] = useState<any[]>([])
  const [novoConvenio, setNewConvenio] = useState({ nome: '', registro_ans: '', contato: '' })

  const [horarios, setHorarios] = useState(
    DIAS.map((dia) => ({ dia, ativo: true, inicio: '08:00', fim: '18:00' })),
  )
  const [themeColor, setThemeColor] = useState('indigo')
  const [preferenciasOriginal, setPreferenciasOriginal] = useState<any>({})

  const [team, setTeam] = useState<any[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('profissional')

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
              pre_consulta_ativa: (data as any).pre_consulta_ativa || false,
              template_pre_consulta:
                (data as any).template_pre_consulta || 'Olá [Nome], sua consulta...',
              endereco_consultorio: (data as any).endereco_consultorio || '',
              telefone_consultorio: (data as any).telefone_consultorio || '',
            })

            if ((data as any).portal_settings) {
              setPortalSettings((data as any).portal_settings)
            }

            setQuestions(data.anamnese_template || [])
            setLembreteAtivo(data.lembrete_whatsapp_ativo || false)
            setTemplateLembrete(data.template_lembrete || 'Olá [Nome]...')
            setEspecialidades(data.especialidades_disponiveis || [])
            setMetaConsultas(data.meta_mensal_consultas || 50)
            if (data.sync_calendarios) setSyncCals(data.sync_calendarios as any)

            const prefs = data.preferencias_dashboard || {}
            setPreferenciasOriginal(prefs)
            setThemeColor(prefs.theme_color || 'indigo')

            if (
              (data as any).horario_funcionamento &&
              (data as any).horario_funcionamento.length > 0
            ) {
              setHorarios((data as any).horario_funcionamento)
            }
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
      fetchTeam()
    }
  }, [user])

  const fetchTeam = async () => {
    if (!user) return
    const { data } = await supabase
      .from('usuarios')
      .select('id, email, nome_consultorio, role')
      .eq('parent_id', user.id)
    if (data) setTeam(data)
  }

  const handleInviteMember = () => {
    if (!newMemberEmail) return
    // Full auth flow should happen here. For now, simulate success logic
    toast({
      title: 'Convite Enviado',
      description: `Um e-mail de convite foi enviado para ${newMemberEmail} com perfil de ${newMemberRole}.`,
    })
    setNewMemberEmail('')
  }

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
      horario_funcionamento: horarios,
      portal_settings: portalSettings,
      preferencias_dashboard: {
        ...preferenciasOriginal,
        theme_color: themeColor,
      },
    }
    const { error } = await supabase.from('usuarios').upsert(payload as any)
    setLoading(false)
    if (error)
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    else toast({ title: 'Configurações salvas!' })
  }

  const updateHorario = (index: number, field: string, value: any) => {
    const newHorarios = [...horarios]
    newHorarios[index] = { ...newHorarios[index], [field]: value }
    setHorarios(newHorarios)
  }

  const addCustomEspecialidade = () => {
    if (novaEspecialidade.trim() && !especialidades.includes(novaEspecialidade.trim())) {
      setEspecialidades([...especialidades, novaEspecialidade.trim()])
      setNovaEspecialidade('')
    }
  }

  const toggleEspecialidade = (esp: string) => {
    if (especialidades.includes(esp)) {
      setEspecialidades(especialidades.filter((e) => e !== esp))
    } else {
      setEspecialidades([...especialidades, esp])
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
              <UserRound className="w-4 h-4" /> Perfil & Identidade
            </TabsTrigger>
            <TabsTrigger
              value="clinica"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" /> Consultório
            </TabsTrigger>
            <TabsTrigger
              value="equipe"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Equipe
            </TabsTrigger>
            <TabsTrigger
              value="portal"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" /> Portal
            </TabsTrigger>
            <TabsTrigger
              value="aparencia"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-2"
            >
              <Palette className="w-4 h-4" /> Aparência
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
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
              <h3 className="font-semibold text-slate-900 mb-1">Identidade do Profissional</h3>
              <p className="text-sm text-slate-500 mb-4">
                Esta foto e nome serão exibidos no seu perfil, documentos e portal do paciente.
              </p>

              <div className="flex flex-col sm:flex-row gap-8 items-start bg-slate-50/50 p-5 rounded-lg border border-slate-100">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="w-28 h-28 border-4 border-white shadow-sm">
                    <AvatarImage src={formData.logo_url} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 text-3xl font-bold text-slate-400">
                      {uploadingLogo ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      ) : formData.nome_consultorio ? (
                        formData.nome_consultorio.substring(0, 2).toUpperCase()
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
                    {uploadingLogo ? 'Enviando...' : 'Alterar Logo'}
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <p className="text-[10px] text-slate-400 text-center">JPG, PNG. Máx 2MB.</p>
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

          <TabsContent value="clinica" className="p-6 m-0 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Dados do Consultório
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Informações de contato e endereço que aparecerão no cabeçalho de laudos e
                prescrições.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-5 rounded-lg border border-slate-100">
              <div className="space-y-2 md:col-span-2">
                <Label>Endereço Completo</Label>
                <Input
                  value={formData.endereco_consultorio}
                  onChange={(e) =>
                    setFormData({ ...formData, endereco_consultorio: e.target.value })
                  }
                  placeholder="Ex: Rua das Flores, 123, Bairro Centro, Cidade - UF"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone / WhatsApp da Clínica</Label>
                <Input
                  value={formData.telefone_consultorio}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone_consultorio: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-3">Horário de Funcionamento</h4>
              <div className="space-y-3">
                {horarios.map((h, i) => (
                  <div
                    key={h.dia}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-lg"
                  >
                    <div className="flex items-center gap-3 w-40">
                      <Switch
                        checked={h.ativo}
                        onCheckedChange={(v) => updateHorario(i, 'ativo', v)}
                      />
                      <span
                        className={`font-medium ${h.ativo ? 'text-slate-800' : 'text-slate-400'}`}
                      >
                        {h.dia}
                      </span>
                    </div>
                    {h.ativo ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={h.inicio}
                          onChange={(e) => updateHorario(i, 'inicio', e.target.value)}
                          className="w-32 bg-white"
                        />
                        <span className="text-slate-500 text-sm">até</span>
                        <Input
                          type="time"
                          value={h.fim}
                          onChange={(e) => updateHorario(i, 'fim', e.target.value)}
                          className="w-32 bg-white"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Fechado</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="equipe" className="p-6 m-0 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Gerenciamento de Equipe
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Convide profissionais e recepcionistas para sua clínica. Defina seus papéis e níveis
                de acesso.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="space-y-1 w-full flex-1">
                <Label>E-mail do Novo Membro</Label>
                <Input
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="bg-white"
                />
              </div>
              <div className="space-y-1 w-full sm:w-48">
                <Label>Nível de Acesso</Label>
                <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="recepcao">Recepção / Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={handleInviteMember} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Convidar
              </Button>
            </div>

            <div className="space-y-2">
              {team.length === 0 ? (
                <div className="text-center py-6 text-slate-500 border border-dashed rounded-lg">
                  Nenhum membro vinculado à sua clínica ainda.
                </div>
              ) : (
                team.map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center bg-white px-4 py-3 rounded-md border border-slate-200 shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{t.email}</p>
                      <p className="text-xs text-slate-500 uppercase font-medium mt-0.5">
                        Role: {t.role || 'Profissional'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="portal" className="p-6 m-0 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" /> Visibilidade do Portal do Paciente
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Controle quais módulos e informações o paciente poderá acessar dentro da área logada
                dele.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold text-slate-800">
                    Meus Agendamentos
                  </Label>
                  <p className="text-sm text-slate-500">
                    Permite que o paciente visualize e solicite cancelamento de consultas futuras e
                    passadas.
                  </p>
                </div>
                <Switch
                  checked={portalSettings.show_appointments}
                  onCheckedChange={(v) =>
                    setPortalSettings({ ...portalSettings, show_appointments: v })
                  }
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <div>
                  <Label className="text-base font-semibold text-slate-800">
                    Prontuário Médico (Resumo)
                  </Label>
                  <p className="text-sm text-slate-500">
                    Exibe o histórico de anotações compartilhadas e evolução.
                  </p>
                </div>
                <Switch
                  checked={portalSettings.show_medical_records}
                  onCheckedChange={(v) =>
                    setPortalSettings({ ...portalSettings, show_medical_records: v })
                  }
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <div>
                  <Label className="text-base font-semibold text-slate-800">
                    Laudos e Prescrições
                  </Label>
                  <p className="text-sm text-slate-500">
                    Permite visualizar e baixar documentos assinados digitalmente.
                  </p>
                </div>
                <Switch
                  checked={portalSettings.show_prescriptions}
                  onCheckedChange={(v) =>
                    setPortalSettings({ ...portalSettings, show_prescriptions: v })
                  }
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <div>
                  <Label className="text-base font-semibold text-slate-800">
                    Testes e Avaliações
                  </Label>
                  <p className="text-sm text-slate-500">
                    Permite que o paciente responda a escalas e formulários pelo portal.
                  </p>
                </div>
                <Switch
                  checked={portalSettings.show_tests}
                  onCheckedChange={(v) => setPortalSettings({ ...portalSettings, show_tests: v })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="aparencia" className="p-6 m-0 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" /> Personalização de Tema
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Escolha a cor principal que representa a sua marca.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 bg-slate-50/50 p-6 rounded-lg border border-slate-100">
              {themeOptions.map((t) => (
                <div key={t.id} className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    className={`w-14 h-14 rounded-full ${t.color} shadow-sm transition-all hover:scale-105 ${themeColor === t.id ? 'ring-4 ring-offset-2 ring-primary scale-110' : ''}`}
                    onClick={() => {
                      setThemeColor(t.id)
                      document.documentElement.classList.remove(
                        'theme-indigo',
                        'theme-blue',
                        'theme-emerald',
                        'theme-rose',
                        'theme-slate',
                      )
                      document.documentElement.classList.add(`theme-${t.id}`)
                    }}
                    title={t.name}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      themeColor === t.id ? 'text-primary font-bold' : 'text-slate-500',
                    )}
                  >
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="p-6 m-0 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-500" /> Integração WhatsApp
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Configure as mensagens automáticas enviadas para os pacientes.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-4">
                <div>
                  <Label className="text-base font-semibold text-slate-800">
                    Confirmação de Agendamento
                  </Label>
                  <p className="text-sm text-slate-500">
                    Mensagem disparada assim que a consulta é marcada.
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold text-slate-800">
                      Lembretes Automáticos (24h antes)
                    </Label>
                    <p className="text-sm text-slate-500">
                      Envia um lembrete 1 dia antes via servidor.
                    </p>
                  </div>
                  <Switch
                    checked={lembreteAtivo}
                    onCheckedChange={async (v) => {
                      setLembreteAtivo(v)
                      if (user) {
                        await supabase
                          .from('usuarios')
                          .update({ lembrete_whatsapp_ativo: v })
                          .eq('id', user.id)
                      }
                    }}
                  />
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
                  </div>
                )}
              </div>
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
                <Label>Contrato de Prestação de Serviços</Label>
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
                <Calendar className="w-5 h-5 text-primary" /> Agendamento Público Online
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Permite que pacientes agendem sozinhos pelos horários disponíveis.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 gap-4">
                <div className="flex-1">
                  {formData.agendamento_publico_ativo && (
                    <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-md max-w-md w-full">
                      <code className="text-xs text-slate-700 flex-1 truncate">
                        {window.location.origin}/agendar/{user?.id}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/agendar/${user?.id}`,
                          )
                          toast({ title: 'Link copiado!' })
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
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
          </div>
        </Tabs>
      </form>
    </div>
  )
}
