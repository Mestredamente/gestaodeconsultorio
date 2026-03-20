import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { maskCEP, fetchAddressByCEP, maskPhone } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Palette,
  Users,
  ShieldAlert,
  BrainCircuit,
  X,
  ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TemplatesManager } from '@/components/TemplatesManager'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'

const predefinedApproaches = [
  'Terapia Cognitivo-Comportamental (TCC)',
  'Psicanálise',
  'Gestalt-terapia',
  'Fenomenologia',
  'Psicodrama',
  'Abordagem Centrada na Pessoa (ACP)',
  'Terapia Sistêmica',
  'Terapia Infantil',
  'Terapia de Casal',
  'Neuropsicologia',
  'Psiquiatria',
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
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  })

  const [portalSettings, setPortalSettings] = useState({
    show_prescriptions: true,
    show_appointments: true,
    show_tests: true,
  })

  const [anamneseTemplates, setAnamneseTemplates] = useState<any[]>([])
  const [lembreteAtivo, setLembreteAtivo] = useState(false)
  const [templateLembrete, setTemplateLembrete] = useState('Olá [Nome]...')
  const [especialidades, setEspecialidades] = useState<string[]>([])

  const [metaConsultas, setMetaConsultas] = useState(50)
  const [syncCals, setSyncCals] = useState({ google: false, outlook: false })

  const [convenios, setConvenios] = useState<any[]>([])

  const [horarios, setHorarios] = useState(
    DIAS.map((dia) => ({
      dia,
      ativo: true,
      turnos: [
        { inicio: '08:00', fim: '12:00' },
        { inicio: '13:00', fim: '18:00' },
      ],
    })),
  )

  const [themeColor, setThemeColor] = useState('indigo')
  const [preferenciasOriginal, setPreferenciasOriginal] = useState<any>({})

  const [team, setTeam] = useState<any[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('profissional')

  const [rolePermissions, setRolePermissions] = useState({
    profissional: {
      agenda: true,
      pacientes: true,
      prontuarios: true,
      financeiro: false,
      relatorios: false,
    },
    recepcao: {
      agenda: true,
      pacientes: true,
      prontuarios: false,
      financeiro: false,
      relatorios: false,
    },
  })

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
              cep: (data as any).cep || '',
              rua: (data as any).rua || '',
              numero: (data as any).numero || '',
              complemento: (data as any).complemento || '',
              bairro: (data as any).bairro || '',
              cidade: (data as any).cidade || '',
              estado: (data as any).estado || '',
            })

            if ((data as any).portal_settings) setPortalSettings((data as any).portal_settings)

            setAnamneseTemplates(
              Array.isArray(data.anamnese_template) ? data.anamnese_template : [],
            )
            setLembreteAtivo(data.lembrete_whatsapp_ativo || false)
            setTemplateLembrete(data.template_lembrete || 'Olá [Nome]...')
            setEspecialidades(data.especialidades_disponiveis || [])
            setMetaConsultas(data.meta_mensal_consultas || 50)
            if (data.sync_calendarios) setSyncCals(data.sync_calendarios as any)

            const prefs = data.preferencias_dashboard || {}
            setPreferenciasOriginal(prefs)
            setThemeColor(prefs.theme_color || 'indigo')
            if (prefs.role_permissions) setRolePermissions(prefs.role_permissions)

            if (
              (data as any).horario_funcionamento &&
              (data as any).horario_funcionamento.length > 0
            ) {
              const mapped = (data as any).horario_funcionamento.map((h: any) => {
                if (h.turnos) return h
                return {
                  dia: h.dia,
                  ativo: h.ativo,
                  turnos: [{ inicio: h.inicio || '08:00', fim: h.fim || '18:00' }],
                }
              })
              setHorarios(mapped)
            }
          }
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
    try {
      const payload = {
        ...formData,
        id: user?.id,
        anamnese_template: anamneseTemplates,
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
          role_permissions: rolePermissions,
        },
      }
      const { error } = await supabase.from('usuarios').upsert(payload as any)
      if (error) throw error
      toast({ title: 'Configurações salvas!' })
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerReminders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('enviar_lembrete_consulta', {
        body: {},
      })
      if (error) throw error
      toast({
        title: 'Lembretes disparados',
        description: `Foram processados ${data.processed || 0} lembretes.`,
      })
    } catch (err: any) {
      toast({ title: 'Erro ao disparar', description: err.message, variant: 'destructive' })
    }
  }

  const updateHorarioAtivo = (index: number, ativo: boolean) => {
    const newHorarios = [...horarios]
    newHorarios[index].ativo = ativo
    setHorarios(newHorarios)
  }

  const addTurno = (index: number) => {
    const newHorarios = [...horarios]
    newHorarios[index].turnos.push({ inicio: '18:00', fim: '19:00' })
    setHorarios(newHorarios)
  }

  const removeTurno = (hIndex: number, tIndex: number) => {
    const newHorarios = [...horarios]
    newHorarios[hIndex].turnos.splice(tIndex, 1)
    setHorarios(newHorarios)
  }

  const updateTurno = (hIndex: number, tIndex: number, field: string, value: string) => {
    const newHorarios = [...horarios]
    newHorarios[hIndex].turnos[tIndex] = { ...newHorarios[hIndex].turnos[tIndex], [field]: value }
    setHorarios(newHorarios)
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

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value)
    setFormData((prev) => ({ ...prev, cep: masked }))
    if (masked.length === 9) {
      const addr = await fetchAddressByCEP(masked)
      if (addr) {
        setFormData((prev) => ({
          ...prev,
          rua: addr.rua,
          bairro: addr.bairro,
          cidade: addr.cidade,
          estado: addr.estado,
        }))
      }
    }
  }

  const addAnamneseTemplate = () => {
    setAnamneseTemplates([
      ...anamneseTemplates,
      {
        id: crypto.randomUUID(),
        titulo: 'Novo Modelo',
        especialidade: '',
        perguntas: ['Nova pergunta'],
      },
    ])
  }

  const updateAnamneseTemplate = (index: number, field: string, value: any) => {
    const newTpls = [...anamneseTemplates]
    newTpls[index] = { ...newTpls[index], [field]: value }
    setAnamneseTemplates(newTpls)
  }

  const updateAnamneseQuestion = (tplIndex: number, qIndex: number, value: string) => {
    const newTpls = [...anamneseTemplates]
    newTpls[tplIndex].perguntas[qIndex] = value
    setAnamneseTemplates(newTpls)
  }

  const addAnamneseQuestion = (tplIndex: number) => {
    const newTpls = [...anamneseTemplates]
    newTpls[tplIndex].perguntas.push('Nova pergunta')
    setAnamneseTemplates(newTpls)
  }

  const removeAnamneseQuestion = (tplIndex: number, qIndex: number) => {
    const newTpls = [...anamneseTemplates]
    newTpls[tplIndex].perguntas.splice(qIndex, 1)
    setAnamneseTemplates(newTpls)
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
              value="clinica"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" /> Consultório
            </TabsTrigger>
            <TabsTrigger
              value="equipe"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Equipe & Acessos
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
              value="anamnese"
              className="rounded-none py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none flex items-center gap-2"
            >
              <BrainCircuit className="w-4 h-4" /> Anamnese
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
                    <Upload className="w-4 h-4 mr-2" /> Alterar Logo
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
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
              <p className="text-sm text-slate-500 mt-1">Endereço e horários de atendimento.</p>
            </div>

            <div className="bg-slate-50/50 p-5 rounded-lg border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={formData.cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Rua / Logradouro</Label>
                  <Input
                    value={formData.rua}
                    onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Bairro</Label>
                  <Input
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Cidade</Label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Estado</Label>
                  <Input
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="bg-white"
                  />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="space-y-2 max-w-sm">
                  <Label>Telefone / WhatsApp da Clínica</Label>
                  <Input
                    value={formData.telefone_consultorio}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone_consultorio: maskPhone(e.target.value) })
                    }
                    placeholder="(00) 00000-0000"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <Label>Especialidades (Aparecem no Agendamento)</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-white">
                      {especialidades.length > 0
                        ? `${especialidades.length} selecionadas`
                        : 'Selecionar Especialidades'}
                      <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full sm:w-[300px]">
                    {predefinedApproaches.map((app) => (
                      <DropdownMenuCheckboxItem
                        key={app}
                        checked={especialidades.includes(app)}
                        onCheckedChange={(checked) => {
                          if (checked) setEspecialidades([...especialidades, app])
                          else setEspecialidades(especialidades.filter((e) => e !== app))
                        }}
                      >
                        {app}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex flex-wrap gap-2 mt-2">
                  {especialidades.map((esp, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 items-center">
                      {esp}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() =>
                          setEspecialidades(especialidades.filter((_, idx) => idx !== i))
                        }
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Meta Mensal de Consultas</Label>
                <Input
                  type="number"
                  min={1}
                  value={metaConsultas}
                  onChange={(e) => setMetaConsultas(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Horários de Atendimento
              </h4>
              <p className="text-sm text-slate-500 mb-4">
                Adicione turnos e intervalos para gerar os horários disponíveis automaticamente.
              </p>
              <div className="space-y-3">
                {horarios.map((h, i) => (
                  <div
                    key={h.dia}
                    className="flex flex-col gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Switch checked={h.ativo} onCheckedChange={(v) => updateHorarioAtivo(i, v)} />
                      <span
                        className={`font-medium ${h.ativo ? 'text-slate-800' : 'text-slate-400'}`}
                      >
                        {h.dia}
                      </span>
                    </div>
                    {h.ativo && (
                      <div className="space-y-3 pl-14">
                        {h.turnos.map((t, tIdx) => (
                          <div
                            key={tIdx}
                            className="flex items-center gap-2 flex-wrap sm:flex-nowrap"
                          >
                            <Input
                              type="time"
                              value={t.inicio}
                              onChange={(e) => updateTurno(i, tIdx, 'inicio', e.target.value)}
                              className="w-32 bg-white"
                            />
                            <span className="text-slate-500 text-sm">até</span>
                            <Input
                              type="time"
                              value={t.fim}
                              onChange={(e) => updateTurno(i, tIdx, 'fim', e.target.value)}
                              className="w-32 bg-white"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-50 shrink-0"
                              onClick={() => removeTurno(i, tIdx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs"
                          onClick={() => addTurno(i)}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Adicionar Intervalo/Turno
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="equipe" className="p-6 m-0 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Gerenciamento de Equipe e Acessos
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Convide profissionais e recepcionistas. Defina exatamente o que cada perfil pode
                acessar.
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

            <div className="pt-6 border-t border-slate-200 mt-6">
              <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" /> Permissões e LGPD
              </h4>
              <p className="text-sm text-slate-500 mb-4">
                Controle rigorosamente quais dados cada perfil visualiza no sistema.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <div className="space-y-4">
                  <h5 className="font-bold text-slate-700 border-b pb-2">Perfil: Profissional</h5>
                  {Object.keys(rolePermissions.profissional).map((module) => (
                    <div key={`prof-${module}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`prof-${module}`}
                        checked={(rolePermissions.profissional as any)[module]}
                        onCheckedChange={(v) =>
                          setRolePermissions((prev) => ({
                            ...prev,
                            profissional: { ...prev.profissional, [module]: !!v },
                          }))
                        }
                      />
                      <Label htmlFor={`prof-${module}`} className="capitalize">
                        {module}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h5 className="font-bold text-slate-700 border-b pb-2">Perfil: Recepção</h5>
                  {Object.keys(rolePermissions.recepcao).map((module) => (
                    <div key={`rec-${module}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`rec-${module}`}
                        checked={(rolePermissions.recepcao as any)[module]}
                        onCheckedChange={(v) =>
                          setRolePermissions((prev) => ({
                            ...prev,
                            recepcao: { ...prev.recepcao, [module]: !!v },
                          }))
                        }
                      />
                      <Label htmlFor={`rec-${module}`} className="capitalize">
                        {module}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
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
                    Permite que o paciente visualize e solicite cancelamento de consultas.
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
                <MessageCircle className="w-5 h-5 text-emerald-500" /> Integração WhatsApp &
                Notificações
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Configure os lembretes automáticos para evitar faltas e esquecimentos.
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold text-slate-800">
                      Lembretes Automáticos de Consulta
                    </Label>
                    <p className="text-sm text-slate-500">
                      Envia um lembrete no dia anterior à sessão (requer Edge Functions ativas).
                    </p>
                  </div>
                  <Switch checked={lembreteAtivo} onCheckedChange={setLembreteAtivo} />
                </div>
                {lembreteAtivo && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <Label>Template do Lembrete</Label>
                    <Textarea
                      value={templateLembrete}
                      onChange={(e) => setTemplateLembrete(e.target.value)}
                      rows={3}
                      className="bg-white"
                      placeholder="Olá [Nome], lembramos que sua consulta está marcada para [data] às [hora]."
                    />
                    <p className="text-xs text-slate-500">Variáveis: [Nome], [data], [hora]</p>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    onClick={handleTriggerReminders}
                    variant="outline"
                    className="gap-2 text-primary"
                  >
                    <MessageCircle className="w-4 h-4" /> Disparar Lembretes Agora
                  </Button>
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-4">
                <div>
                  <Label className="text-base font-semibold text-slate-800">
                    Confirmação de Agendamento
                  </Label>
                  <p className="text-sm text-slate-500">
                    Mensagem de texto para usar manualmente na hora de confirmar uma nova marcação.
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
            </div>
          </TabsContent>

          <TabsContent value="anamnese" className="p-6 m-0 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary" /> Anamnese Inteligente
                </h3>
              </div>
              <Button type="button" onClick={addAnamneseTemplate} className="gap-2">
                <Plus className="w-4 h-4" /> Novo Modelo
              </Button>
            </div>
            <div className="space-y-6">
              {anamneseTemplates.map((tpl, tplIndex) => (
                <div
                  key={tpl.id}
                  className="bg-slate-50 p-5 rounded-lg border border-slate-200 shadow-sm relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50"
                    onClick={() =>
                      setAnamneseTemplates(anamneseTemplates.filter((_, i) => i !== tplIndex))
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10">
                    <div className="space-y-1">
                      <Label>Título do Modelo</Label>
                      <Input
                        value={tpl.titulo}
                        onChange={(e) => updateAnamneseTemplate(tplIndex, 'titulo', e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Especialidade Vinculada</Label>
                      <Input
                        value={tpl.especialidade}
                        onChange={(e) =>
                          updateAnamneseTemplate(tplIndex, 'especialidade', e.target.value)
                        }
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <Label className="text-slate-700">Perguntas</Label>
                    {tpl.perguntas.map((q: string, qIndex: number) => (
                      <div key={qIndex} className="flex items-center gap-2">
                        <Input
                          value={q}
                          onChange={(e) => updateAnamneseQuestion(tplIndex, qIndex, e.target.value)}
                          className="bg-white flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAnamneseQuestion(tplIndex, qIndex)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAnamneseQuestion(tplIndex)}
                      className="mt-2 text-primary border-primary border-dashed"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Adicionar Pergunta
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="juridico" className="p-6 m-0 space-y-5">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" /> Textos Legais e Políticas
              </h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Contrato de Prestação de Serviços (Aceite Eletrônico)</Label>
                <Textarea
                  value={formData.texto_contrato}
                  onChange={(e) => setFormData({ ...formData, texto_contrato: e.target.value })}
                  className="min-h-[150px]"
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
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
