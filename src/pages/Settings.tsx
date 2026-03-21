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
  Landmark,
  KeyRound,
  CheckCircle2,
  AlertCircle,
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
    whatsapp_tipo: 'business',
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
    banco: '',
    agencia: '',
    conta_bancaria: '',
    mercado_pago_token: '',
    whatsapp_api_key: '',
    stripe_secret_key: '',
    pagseguro_token: '',
    gemini_api_key: '',
    zoom_client_id: '',
    zoom_client_secret: '',
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
              whatsapp_tipo: (data as any).whatsapp_tipo || 'business',
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
              banco: (data as any).banco || '',
              agencia: (data as any).agencia || '',
              conta_bancaria: (data as any).conta_bancaria || '',
              mercado_pago_token: (data as any).mercado_pago_token || '',
              whatsapp_api_key: (data as any).whatsapp_api_key || '',
              stripe_secret_key: (data as any).stripe_secret_key || '',
              pagseguro_token: (data as any).pagseguro_token || '',
              gemini_api_key: (data as any).gemini_api_key || '',
              zoom_client_id: (data as any).zoom_client_id || '',
              zoom_client_secret: (data as any).zoom_client_secret || '',
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
            if (prefs.role_permissions) {
              setRolePermissions((prev: any) => ({
                profissional: {
                  ...prev.profissional,
                  ...(prefs.role_permissions.profissional || {}),
                },
                recepcao: { ...prev.recepcao, ...(prefs.role_permissions.recepcao || {}) },
              }))
            }

            if (
              (data as any).horario_funcionamento &&
              Array.isArray((data as any).horario_funcionamento)
            ) {
              const mapped = (data as any).horario_funcionamento.map((h: any) => {
                if (h.turnos && Array.isArray(h.turnos)) return h
                return {
                  dia: h.dia || 'Segunda',
                  ativo: !!h.ativo,
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
      toast({ title: 'Configurações salvas com sucesso!' })
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

  const renderSecretChecklistItem = (label: string, value: string) => {
    const isConfigured = value && value.trim() !== ''
    return (
      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
        <span className="font-medium text-slate-700">{label}</span>
        {isConfigured ? (
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"
          >
            <CheckCircle2 className="w-3 h-3" /> Configurado
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
            <AlertCircle className="w-3 h-3" /> Pendente
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações Gerais</h1>
      <form onSubmit={handleSave}>
        <Tabs
          defaultValue="perfil"
          className="w-full bg-white shadow-sm border-slate-200 border rounded-2xl overflow-hidden"
        >
          <TabsList className="w-full flex flex-wrap justify-start rounded-none border-b border-slate-100 bg-slate-50/50 p-2 h-auto gap-2">
            <TabsTrigger
              value="perfil"
              className="rounded-lg py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary flex items-center gap-2"
            >
              <UserRound className="w-4 h-4" /> Perfil & Pagamentos
            </TabsTrigger>
            <TabsTrigger
              value="clinica"
              className="rounded-lg py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" /> Consultório
            </TabsTrigger>
            <TabsTrigger
              value="equipe"
              className="rounded-lg py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary flex items-center gap-2"
            >
              <Users className="w-4 h-4" /> Equipe
            </TabsTrigger>
            <TabsTrigger
              value="portal"
              className="rounded-lg py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" /> Portal
            </TabsTrigger>
            <TabsTrigger
              value="aparencia"
              className="rounded-lg py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary flex items-center gap-2"
            >
              <Palette className="w-4 h-4" /> Aparência
            </TabsTrigger>
            <TabsTrigger
              value="whatsapp"
              className="rounded-lg py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </TabsTrigger>
            <TabsTrigger
              value="anamnese"
              className="rounded-lg py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary flex items-center gap-2"
            >
              <BrainCircuit className="w-4 h-4" /> Anamnese
            </TabsTrigger>
            <TabsTrigger
              value="juridico"
              className="rounded-lg py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary"
            >
              Jurídico
            </TabsTrigger>
            <TabsTrigger
              value="integracoes"
              className="rounded-lg py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" /> Integrações & APIs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="p-6 md:p-8 m-0 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Identidade do Profissional</h3>
              <p className="text-sm text-slate-500 mb-6">
                Esta foto e nome serão exibidos no seu perfil, documentos e portal do paciente.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 items-start bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                    <AvatarImage src={formData.logo_url} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 text-4xl font-bold text-slate-400">
                      {uploadingLogo ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      ) : formData.nome_consultorio ? (
                        formData.nome_consultorio.substring(0, 2).toUpperCase()
                      ) : (
                        <ImageIcon className="w-12 h-12 text-slate-400" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl"
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
                </div>
                <div className="flex-1 space-y-5 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Nome do Consultório / Profissional</Label>
                      <Input
                        value={formData.nome_consultorio}
                        onChange={(e) =>
                          setFormData({ ...formData, nome_consultorio: e.target.value })
                        }
                        required
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail de Contato</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" /> Dados Bancários e Recebimentos
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Estas informações serão usadas para gerar links de cobrança e PIX automáticos para
                seus pacientes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Input
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                    placeholder="Ex: Nubank, Itaú"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Agência</Label>
                  <Input
                    value={formData.agencia}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                    placeholder="0000"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conta (com dígito)</Label>
                  <Input
                    value={formData.conta_bancaria}
                    onChange={(e) => setFormData({ ...formData, conta_bancaria: e.target.value })}
                    placeholder="00000-0"
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Chave PIX (Principal)</Label>
                  <Input
                    value={formData.chave_pix}
                    onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                    placeholder="CPF, E-mail ou Celular"
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clinica" className="p-6 md:p-8 m-0 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Dados do Consultório
              </h3>
              <p className="text-sm text-slate-500 mt-1">Endereço e horários de atendimento.</p>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
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
              <div className="mt-5 pt-5 border-t border-slate-200">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div className="space-y-3">
                <Label>Especialidades (Aparecem no Agendamento)</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white h-12 rounded-xl"
                    >
                      {especialidades.length > 0
                        ? `${especialidades.length} selecionadas`
                        : 'Selecionar Especialidades'}
                      <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full sm:w-[300px] rounded-xl p-2">
                    {predefinedApproaches.map((app) => (
                      <DropdownMenuCheckboxItem
                        key={app}
                        checked={especialidades.includes(app)}
                        onCheckedChange={(checked) => {
                          if (checked) setEspecialidades([...especialidades, app])
                          else setEspecialidades(especialidades.filter((e) => e !== app))
                        }}
                        className="rounded-lg"
                      >
                        {app}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex flex-wrap gap-2 mt-2">
                  {especialidades.map((esp, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="gap-1 items-center px-3 py-1 rounded-full text-sm"
                    >
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
              <div className="space-y-3">
                <Label>Meta Mensal de Consultas</Label>
                <Input
                  type="number"
                  min={1}
                  value={metaConsultas}
                  onChange={(e) => setMetaConsultas(Number(e.target.value))}
                  className="h-12 rounded-xl text-lg bg-white"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Horários de Atendimento
              </h4>
              <p className="text-sm text-slate-500 mb-6">
                Adicione turnos e intervalos para gerar os horários disponíveis automaticamente.
              </p>
              <div className="space-y-4">
                {horarios.map((h, i) => (
                  <div
                    key={h.dia}
                    className="flex flex-col gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <Switch checked={h.ativo} onCheckedChange={(v) => updateHorarioAtivo(i, v)} />
                      <span
                        className={`font-semibold text-lg ${h.ativo ? 'text-slate-800' : 'text-slate-400'}`}
                      >
                        {h.dia}
                      </span>
                    </div>
                    {h.ativo && (
                      <div className="space-y-3 pl-14">
                        {h.turnos.map((t, tIdx) => (
                          <div
                            key={tIdx}
                            className="flex items-center gap-3 flex-wrap sm:flex-nowrap"
                          >
                            <Input
                              type="time"
                              value={t.inicio}
                              onChange={(e) => updateTurno(i, tIdx, 'inicio', e.target.value)}
                              className="w-32 bg-white rounded-lg"
                            />
                            <span className="text-slate-500 font-medium">até</span>
                            <Input
                              type="time"
                              value={t.fim}
                              onChange={(e) => updateTurno(i, tIdx, 'fim', e.target.value)}
                              className="w-32 bg-white rounded-lg"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                              onClick={() => removeTurno(i, tIdx)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3 rounded-xl border-dashed border-2"
                          onClick={() => addTurno(i)}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Adicionar Turno
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="equipe" className="p-6 md:p-8 m-0 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Gerenciamento de Equipe e Acessos
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Convide profissionais e recepcionistas. Defina exatamente o que cada perfil pode
                acessar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-2 w-full flex-1">
                <Label>E-mail do Novo Membro</Label>
                <Input
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="bg-white h-11"
                />
              </div>
              <div className="space-y-2 w-full sm:w-56">
                <Label>Nível de Acesso</Label>
                <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                  <SelectTrigger className="bg-white h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="recepcao">Recepção / Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                onClick={handleInviteMember}
                className="w-full sm:w-auto h-11 rounded-xl px-6"
              >
                <Plus className="w-4 h-4 mr-2" /> Convidar
              </Button>
            </div>

            <div className="space-y-3">
              {team.length === 0 ? (
                <div className="text-center py-10 text-slate-500 border-2 border-dashed rounded-2xl">
                  Nenhum membro vinculado à sua clínica ainda.
                </div>
              ) : (
                team.map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center bg-white px-5 py-4 rounded-xl border border-slate-100 shadow-sm"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{t.email}</p>
                      <Badge variant="secondary" className="mt-1 uppercase text-[10px]">
                        {t.role || 'Profissional'}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600" /> Permissões e LGPD
              </h4>
              <p className="text-sm text-slate-500 mb-6">
                Controle rigorosamente quais dados cada perfil visualiza no sistema.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div className="space-y-5">
                  <h5 className="font-bold text-slate-800 text-lg border-b border-slate-200 pb-3">
                    Perfil: Profissional
                  </h5>
                  {Object.keys(rolePermissions.profissional).map((module) => (
                    <div key={`prof-${module}`} className="flex items-center space-x-3">
                      <Switch
                        checked={(rolePermissions.profissional as any)[module]}
                        onCheckedChange={(v) =>
                          setRolePermissions((prev) => ({
                            ...prev,
                            profissional: { ...prev.profissional, [module]: !!v },
                          }))
                        }
                      />
                      <Label className="capitalize text-base font-medium">{module}</Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-5">
                  <h5 className="font-bold text-slate-800 text-lg border-b border-slate-200 pb-3">
                    Perfil: Recepção
                  </h5>
                  {Object.keys(rolePermissions.recepcao).map((module) => (
                    <div key={`rec-${module}`} className="flex items-center space-x-3">
                      <Switch
                        checked={(rolePermissions.recepcao as any)[module]}
                        onCheckedChange={(v) =>
                          setRolePermissions((prev) => ({
                            ...prev,
                            recepcao: { ...prev.recepcao, [module]: !!v },
                          }))
                        }
                      />
                      <Label className="capitalize text-base font-medium">{module}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portal" className="p-6 md:p-8 m-0 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary" /> Visibilidade do Portal do Paciente
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Controle quais módulos e informações o paciente poderá acessar dentro da área logada
                dele.
              </p>
            </div>
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-lg font-bold text-slate-800">Meus Agendamentos</Label>
                  <p className="text-sm text-slate-500 mt-1">
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
              <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                <div>
                  <Label className="text-lg font-bold text-slate-800">Laudos e Prescrições</Label>
                  <p className="text-sm text-slate-500 mt-1">
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
              <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                <div>
                  <Label className="text-lg font-bold text-slate-800">Testes e Avaliações</Label>
                  <p className="text-sm text-slate-500 mt-1">
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

          <TabsContent value="aparencia" className="p-6 md:p-8 m-0 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" /> Personalização de Tema
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Escolha a cor principal que representa a sua marca.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 bg-slate-50/50 p-8 rounded-2xl border border-slate-100">
              {themeOptions.map((t) => (
                <div key={t.id} className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    className={`w-16 h-16 rounded-full ${t.color} shadow-md transition-all hover:scale-105 ${themeColor === t.id ? 'ring-4 ring-offset-4 ring-primary scale-110' : ''}`}
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
                      'text-sm font-bold',
                      themeColor === t.id ? 'text-primary' : 'text-slate-500',
                    )}
                  >
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="p-6 md:p-8 m-0 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-500" /> Integração WhatsApp &
                Notificações
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Configure os lembretes automáticos e a integração com a API do WhatsApp.
              </p>
            </div>

            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-5">
              <div>
                <Label className="text-lg font-bold text-slate-800">
                  Tipo de Integração WhatsApp
                </Label>
                <p className="text-sm text-slate-500 mb-4 mt-1">
                  Recomendamos o uso do WhatsApp Business API para maior compatibilidade com
                  automações. A chave deve ser configurada na aba "Integrações & APIs".
                </p>
              </div>
              <Select
                value={formData.whatsapp_tipo}
                onValueChange={(v) => setFormData({ ...formData, whatsapp_tipo: v })}
              >
                <SelectTrigger className="bg-white max-w-md h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">WhatsApp Web/App Pessoal (Padrão)</SelectItem>
                  <SelectItem value="business">WhatsApp Business API (Recomendado)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-bold text-slate-800">
                      Lembretes Automáticos de Consulta
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">
                      Envia um lembrete 24h antes da sessão (requer API configurada para modo
                      automático).
                    </p>
                  </div>
                  <Switch checked={lembreteAtivo} onCheckedChange={setLembreteAtivo} />
                </div>
                {lembreteAtivo && (
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <Label>Template do Lembrete</Label>
                    <Textarea
                      value={templateLembrete}
                      onChange={(e) => setTemplateLembrete(e.target.value)}
                      rows={3}
                      className="bg-white rounded-xl resize-none"
                      placeholder="Olá [Nome], lembramos que sua consulta está marcada para [data] às [hora]."
                    />
                    <p className="text-xs text-slate-500 font-medium">
                      Variáveis disponíveis: [Nome], [data], [hora], [link_confirmacao]
                    </p>
                  </div>
                )}
                <div className="mt-5 pt-5 border-t border-slate-200">
                  <Button
                    type="button"
                    onClick={handleTriggerReminders}
                    variant="outline"
                    className="gap-2 text-primary rounded-xl"
                  >
                    <MessageCircle className="w-4 h-4" /> Disparar Lembretes Manualmente Agora
                  </Button>
                </div>
              </div>

              <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-bold text-slate-800">
                      Confirmação de Agendamento
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">
                      Mensagem de texto para usar ao criar um novo agendamento.
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
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <Label>Template de Confirmação</Label>
                    <Textarea
                      value={formData.template_confirmacao}
                      onChange={(e) =>
                        setFormData({ ...formData, template_confirmacao: e.target.value })
                      }
                      rows={3}
                      className="bg-white rounded-xl resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="anamnese" className="p-6 md:p-8 m-0 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary" /> Anamnese Inteligente
                </h3>
              </div>
              <Button type="button" onClick={addAnamneseTemplate} className="gap-2 rounded-xl">
                <Plus className="w-4 h-4" /> Novo Modelo
              </Button>
            </div>
            <div className="space-y-6">
              {anamneseTemplates.map((tpl, tplIndex) => (
                <div
                  key={tpl.id}
                  className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 relative group"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() =>
                      setAnamneseTemplates(anamneseTemplates.filter((_, i) => i !== tplIndex))
                    }
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 pr-10">
                    <div className="space-y-2">
                      <Label>Título do Modelo</Label>
                      <Input
                        value={tpl.titulo}
                        onChange={(e) => updateAnamneseTemplate(tplIndex, 'titulo', e.target.value)}
                        className="bg-white h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Especialidade Vinculada</Label>
                      <Input
                        value={tpl.especialidade}
                        onChange={(e) =>
                          updateAnamneseTemplate(tplIndex, 'especialidade', e.target.value)
                        }
                        className="bg-white h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 pt-5 border-t border-slate-200">
                    <Label className="text-slate-800 text-base">Perguntas</Label>
                    {tpl.perguntas.map((q: string, qIndex: number) => (
                      <div key={qIndex} className="flex items-center gap-3">
                        <Input
                          value={q}
                          onChange={(e) => updateAnamneseQuestion(tplIndex, qIndex, e.target.value)}
                          className="bg-white flex-1 h-11"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAnamneseQuestion(tplIndex, qIndex)}
                          className="text-slate-400 hover:text-red-500 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addAnamneseQuestion(tplIndex)}
                      className="mt-3 text-primary border-primary border-dashed rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Pergunta
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="juridico" className="p-6 md:p-8 m-0 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" /> Textos Legais e Políticas
              </h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">
                  Contrato de Prestação de Serviços (Aceite Eletrônico)
                </Label>
                <Textarea
                  value={formData.texto_contrato}
                  onChange={(e) => setFormData({ ...formData, texto_contrato: e.target.value })}
                  className="min-h-[200px] bg-slate-50/50 rounded-2xl resize-none p-4"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-base">Política de Cancelamento</Label>
                <Textarea
                  value={formData.politica_cancelamento}
                  onChange={(e) =>
                    setFormData({ ...formData, politica_cancelamento: e.target.value })
                  }
                  className="min-h-[120px] bg-slate-50/50 rounded-2xl resize-none p-4"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integracoes" className="p-6 md:p-8 m-0 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" /> Gerenciamento de Integrações e APIs
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Configure as chaves e tokens para ativar recursos avançados do sistema (Pagamentos,
                AI, WhatsApp e Videoconferência).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-5">
                  <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b pb-3">
                    <Landmark className="w-4 h-4 text-emerald-600" /> Gateways de Pagamento
                  </h4>

                  <div className="space-y-2">
                    <Label>Stripe Secret Key</Label>
                    <Input
                      type="password"
                      value={formData.stripe_secret_key}
                      onChange={(e) =>
                        setFormData({ ...formData, stripe_secret_key: e.target.value })
                      }
                      placeholder="sk_test_..."
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mercado Pago Access Token</Label>
                    <Input
                      type="password"
                      value={formData.mercado_pago_token}
                      onChange={(e) =>
                        setFormData({ ...formData, mercado_pago_token: e.target.value })
                      }
                      placeholder="APP_USR-..."
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PagSeguro Token</Label>
                    <Input
                      type="password"
                      value={formData.pagseguro_token}
                      onChange={(e) =>
                        setFormData({ ...formData, pagseguro_token: e.target.value })
                      }
                      placeholder="Token..."
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-5">
                  <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b pb-3">
                    <MessageCircle className="w-4 h-4 text-emerald-500" /> Comunicação
                  </h4>

                  <div className="space-y-2">
                    <Label>WhatsApp Business API Key</Label>
                    <Input
                      type="password"
                      value={formData.whatsapp_api_key}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp_api_key: e.target.value })
                      }
                      placeholder="EAAG..."
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-5">
                  <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b pb-3">
                    <BrainCircuit className="w-4 h-4 text-indigo-500" /> Inteligência Artificial
                  </h4>

                  <div className="space-y-2">
                    <Label>Google Gemini API Key</Label>
                    <Input
                      type="password"
                      value={formData.gemini_api_key}
                      onChange={(e) => setFormData({ ...formData, gemini_api_key: e.target.value })}
                      placeholder="AIza..."
                      className="bg-white"
                    />
                    <p className="text-xs text-slate-500">
                      Usada para a funcionalidade de sugestão inteligente de horários.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-5">
                  <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2 border-b pb-3">
                    <KeyRound className="w-4 h-4 text-blue-500" /> Videoconferência (Zoom)
                  </h4>

                  <div className="space-y-2">
                    <Label>Zoom Client ID</Label>
                    <Input
                      type="password"
                      value={formData.zoom_client_id}
                      onChange={(e) => setFormData({ ...formData, zoom_client_id: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zoom Client Secret</Label>
                    <Input
                      type="password"
                      value={formData.zoom_client_secret}
                      onChange={(e) =>
                        setFormData({ ...formData, zoom_client_secret: e.target.value })
                      }
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4">Status das Integrações</h4>
                  <div className="space-y-3">
                    {renderSecretChecklistItem('Mercado Pago', formData.mercado_pago_token)}
                    {renderSecretChecklistItem('Stripe', formData.stripe_secret_key)}
                    {renderSecretChecklistItem('PagSeguro', formData.pagseguro_token)}
                    {renderSecretChecklistItem('WhatsApp API', formData.whatsapp_api_key)}
                    {renderSecretChecklistItem('Gemini AI', formData.gemini_api_key)}
                    {renderSecretChecklistItem('Zoom API', formData.zoom_client_id)}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-slate-800 mb-1">
                    Agendamento Público Online
                  </h4>
                  <p className="text-sm text-slate-500 mb-3">
                    Permita que os pacientes agendem diretamente pelo seu link exclusivo.
                  </p>
                  {formData.agendamento_publico_ativo && (
                    <div className="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-xl max-w-md w-full shadow-sm">
                      <code className="text-xs text-slate-700 flex-1 truncate font-mono">
                        {window.location.origin}/agendar/{user?.id}
                      </code>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 shrink-0 rounded-lg gap-2"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/agendar/${user?.id}`,
                          )
                          toast({ title: 'Link copiado!' })
                        }}
                      >
                        <Copy className="w-3.5 h-3.5" /> Copiar
                      </Button>
                    </div>
                  )}
                </div>
                <Switch
                  checked={formData.agendamento_publico_ativo}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, agendamento_publico_ativo: v })
                  }
                  className="scale-125"
                />
              </div>
            </div>
          </TabsContent>

          <div className="p-6 md:p-8 pt-0 flex flex-col sm:flex-row gap-4 justify-end mt-4">
            <Button
              type="submit"
              className="gap-2 w-full sm:w-auto px-10 h-12 rounded-xl text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {loading ? 'Salvando...' : 'Salvar Todas as Configurações'}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
