import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { maskPhone, maskCEP, fetchAddressByCEP } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Save,
  Loader2,
  Building2,
  MessageCircle,
  Link as LinkIcon,
  Shield,
  Send,
  Users,
  Palette,
  Trash2,
  Plus,
  MapPin,
  Image as ImageIcon,
  Copy,
  Upload,
} from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetchingCep, setFetchingCep] = useState(false)

  const [team, setTeam] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteNome, setInviteNome] = useState('')
  const [inviteRole, setInviteRole] = useState('profissional')
  const [inviting, setInviting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [testingWhatsApp, setTestingWhatsApp] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [settings, setSettings] = useState({
    nome_consultorio: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    telefone_consultorio: '',
    chave_pix: '',
    lembrete_whatsapp_ativo: false,
    template_lembrete: '',
    whatsapp_confirmacao_ativa: false,
    template_confirmacao: '',
    pre_consulta_ativa: false,
    template_pre_consulta: '',
    agendamento_publico_ativo: false,
    politica_cancelamento: '',
    texto_contrato: '',
    whatsapp_tipo: 'padrao',
    whatsapp_api_key: '',
    whatsapp_business_phone_id: '',
    whatsapp_business_account_id: '',
    logo_url: '',
  })

  const [preferences, setPreferences] = useState<any>({ theme_color: 'indigo' })

  const fetchSettings = async () => {
    if (!user) return
    const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
    if (data) {
      setSettings({
        nome_consultorio: data.nome_consultorio || '',
        cep: data.cep || '',
        rua: data.rua || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cidade: data.cidade || '',
        estado: data.estado || '',
        telefone_consultorio: data.telefone_consultorio || '',
        chave_pix: data.chave_pix || '',
        lembrete_whatsapp_ativo: data.lembrete_whatsapp_ativo || false,
        template_lembrete: data.template_lembrete || '',
        whatsapp_confirmacao_ativa: data.whatsapp_confirmacao_ativa || false,
        template_confirmacao: data.template_confirmacao || '',
        pre_consulta_ativa: data.pre_consulta_ativa || false,
        template_pre_consulta: data.template_pre_consulta || '',
        agendamento_publico_ativo: data.agendamento_publico_ativo || false,
        politica_cancelamento: data.politica_cancelamento || '',
        texto_contrato: data.texto_contrato || '',
        whatsapp_tipo:
          data.whatsapp_tipo === 'personal' ? 'padrao' : data.whatsapp_tipo || 'padrao',
        whatsapp_api_key: data.whatsapp_api_key || '',
        whatsapp_business_phone_id: data.whatsapp_business_phone_id || '',
        whatsapp_business_account_id: data.whatsapp_business_account_id || '',
        logo_url: data.logo_url || '',
      })
      if (data.preferencias_dashboard) {
        setPreferences(data.preferencias_dashboard)
      }
    }

    const { data: teamData } = await supabase
      .from('usuarios')
      .select('id, nome, email, role')
      .eq('parent_id', user.id)
    if (teamData) setTeam(teamData)

    setLoading(false)
  }

  useEffect(() => {
    fetchSettings()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const payload = { ...settings, preferencias_dashboard: preferences }
      if (payload.whatsapp_tipo === 'personal') payload.whatsapp_tipo = 'padrao'

      const { error } = await supabase.from('usuarios').update(payload).eq('id', user.id)
      if (error) throw error

      toast({ title: 'Configurações salvas com sucesso!' })

      if (preferences.theme_color) {
        document.documentElement.className = `theme-${preferences.theme_color}`
      }
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value)
    setSettings({ ...settings, cep: masked })

    if (masked.length === 9) {
      setFetchingCep(true)
      try {
        const address = await fetchAddressByCEP(masked)
        if (address) {
          setSettings((prev) => ({
            ...prev,
            rua: address.rua,
            bairro: address.bairro,
            cidade: address.cidade,
            estado: address.estado,
          }))
          toast({ title: 'Endereço encontrado!' })
        }
      } catch (err) {
        toast({ title: 'Erro ao buscar CEP', variant: 'destructive' })
      } finally {
        setFetchingCep(false)
      }
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail || !inviteNome) {
      toast({ title: 'Preencha o e-mail e o nome', variant: 'destructive' })
      return
    }
    setInviting(true)
    try {
      const { data, error } = await supabase.functions.invoke('convidar_usuario', {
        body: { email: inviteEmail, nome: inviteNome, role: inviteRole },
      })
      if (error || data?.error) throw new Error(error?.message || data?.error)
      toast({ title: 'Convite enviado com sucesso!' })
      setInviteEmail('')
      setInviteNome('')
      fetchSettings()
    } catch (err: any) {
      toast({ title: 'Erro ao convidar', description: err.message, variant: 'destructive' })
    } finally {
      setInviting(false)
    }
  }

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este membro definitivamente?')) return
    setDeletingId(id)
    try {
      const { data, error } = await supabase.functions.invoke('excluir_usuario', {
        body: { usuario_id: id },
      })
      if (error || data?.error) throw new Error(error?.message || data?.error)
      toast({ title: 'Membro excluído com sucesso!' })
      fetchSettings()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'A imagem deve ter no máximo 5MB', variant: 'destructive' })
      return
    }

    try {
      setUploadingLogo(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${user.id}-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documentos-propostas')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('documentos-propostas').getPublicUrl(filePath)

      setSettings((prev) => ({ ...prev, logo_url: data.publicUrl }))
      toast({ title: 'Logo anexada com sucesso! Lembre-se de salvar as alterações.' })
    } catch (err: any) {
      toast({
        title: 'Erro ao fazer upload do logo',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setUploadingLogo(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleTestWhatsApp = async () => {
    if (!testPhone.trim()) {
      toast({
        title: 'Atenção',
        description: 'Digite um número de telefone.',
        variant: 'destructive',
      })
      return
    }
    setTestingWhatsApp(true)
    try {
      const cleanPhone = testPhone.replace(/\D/g, '')
      const { data, error } = await supabase.functions.invoke('enviar_mensagem_whatsapp', {
        body: {
          tipo_whatsapp: settings.whatsapp_tipo,
          telefone: cleanPhone,
          mensagem: 'Olá! Este é um teste de integração do seu CRM de Gestão.',
          usuario_id: user?.id,
        },
      })

      if (error || data?.error) throw new Error(error?.message || data?.error)
      toast({ title: 'Sucesso!', description: 'Mensagem de teste processada com sucesso.' })
    } catch (err: any) {
      toast({ title: 'Falha no teste', description: err.message, variant: 'destructive' })
    } finally {
      setTestingWhatsApp(false)
    }
  }

  if (loading)
    return (
      <div className="flex h-64 justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  const colors = [
    { id: 'indigo', name: 'Índigo', class: 'bg-indigo-500' },
    { id: 'emerald', name: 'Esmeralda', class: 'bg-emerald-500' },
    { id: 'rose', name: 'Rosa', class: 'bg-rose-500' },
    { id: 'blue', name: 'Azul', class: 'bg-blue-500' },
    { id: 'slate', name: 'Grafite', class: 'bg-slate-500' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 sm:pt-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Configurações</h1>
          <p className="text-slate-500 mt-1">Personalize o comportamento e a equipe</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-14 md:h-11 px-6 rounded-xl gap-2 font-bold w-full sm:w-auto shadow-md"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="mb-6 flex w-full justify-start overflow-x-auto h-auto bg-slate-100/50 p-1.5 rounded-2xl scrollbar-hide border border-slate-100">
          <TabsTrigger
            value="geral"
            className="px-5 py-3 md:py-2.5 rounded-xl font-bold flex gap-2 shrink-0"
          >
            <Building2 className="w-4 h-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger
            value="equipe"
            className="px-5 py-3 md:py-2.5 rounded-xl font-bold flex gap-2 shrink-0"
          >
            <Users className="w-4 h-4" /> Equipe
          </TabsTrigger>
          <TabsTrigger
            value="aparencia"
            className="px-5 py-3 md:py-2.5 rounded-xl font-bold flex gap-2 shrink-0"
          >
            <Palette className="w-4 h-4" /> Aparência
          </TabsTrigger>
          <TabsTrigger
            value="comunicacao"
            className="px-5 py-3 md:py-2.5 rounded-xl font-bold flex gap-2 shrink-0"
          >
            <MessageCircle className="w-4 h-4" /> Mensagens
          </TabsTrigger>
          <TabsTrigger
            value="portal"
            className="px-5 py-3 md:py-2.5 rounded-xl font-bold flex gap-2 shrink-0"
          >
            <LinkIcon className="w-4 h-4" /> Portal
          </TabsTrigger>
          <TabsTrigger
            value="legal"
            className="px-5 py-3 md:py-2.5 rounded-xl font-bold flex gap-2 shrink-0"
          >
            <Shield className="w-4 h-4" /> Legal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 rounded-t-[2rem]">
              <CardTitle className="text-lg">Dados Principais</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <Label>Nome do Consultório / Profissional</Label>
                  <Input
                    value={settings.nome_consultorio}
                    onChange={(e) => setSettings({ ...settings, nome_consultorio: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone (WhatsApp)</Label>
                  <Input
                    inputMode="tel"
                    placeholder="(00) 00000-0000"
                    value={settings.telefone_consultorio}
                    onChange={(e) =>
                      setSettings({ ...settings, telefone_consultorio: maskPhone(e.target.value) })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chave PIX (Padrão para Recebimentos)</Label>
                  <Input
                    value={settings.chave_pix}
                    onChange={(e) => setSettings({ ...settings, chave_pix: e.target.value })}
                    className="h-12 rounded-xl font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 rounded-t-[2rem]">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 relative">
                  <Label>CEP</Label>
                  <Input
                    value={settings.cep}
                    inputMode="numeric"
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    className="h-12 rounded-xl pr-10"
                  />
                  {fetchingCep && (
                    <Loader2 className="absolute right-3 top-9 w-4 h-4 text-slate-400 animate-spin" />
                  )}
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Rua / Logradouro</Label>
                  <Input
                    value={settings.rua}
                    onChange={(e) => setSettings({ ...settings, rua: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    value={settings.numero}
                    onChange={(e) => setSettings({ ...settings, numero: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    value={settings.complemento}
                    onChange={(e) => setSettings({ ...settings, complemento: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Bairro</Label>
                  <Input
                    value={settings.bairro}
                    onChange={(e) => setSettings({ ...settings, bairro: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Cidade</Label>
                  <Input
                    value={settings.cidade}
                    onChange={(e) => setSettings({ ...settings, cidade: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Estado</Label>
                  <Input
                    value={settings.estado}
                    onChange={(e) => setSettings({ ...settings, estado: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipe" className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 rounded-t-[2rem]">
              <CardTitle className="text-lg">Gestão de Acessos</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                <h3 className="font-bold text-indigo-900 mb-4">Adicionar Colaborador</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>E-mail do Colaborador</Label>
                    <Input
                      placeholder="email@exemplo.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      placeholder="Nome"
                      value={inviteNome}
                      onChange={(e) => setInviteNome(e.target.value)}
                      className="bg-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Perfil</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="bg-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profissional">Profissional</SelectItem>
                        <SelectItem value="secretaria">Secretária</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleInvite}
                    disabled={inviting}
                    className="sm:col-span-4 h-12 rounded-xl gap-2 font-bold bg-indigo-600 hover:bg-indigo-700"
                  >
                    {inviting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Enviar Convite
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Membros da Equipe</h3>
                {team.length === 0 ? (
                  <p className="text-slate-500 text-sm">Nenhum membro adicionado ainda.</p>
                ) : (
                  <div className="space-y-3">
                    {team.map((member) => (
                      <div
                        key={member.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {member.nome || 'Usuário Pendente'}
                          </p>
                          <p className="text-sm text-slate-500">{member.email}</p>
                          <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md uppercase">
                            {member.role || 'Profissional'}
                          </span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-lg gap-2"
                          onClick={() => handleDeleteMember(member.id)}
                          disabled={deletingId === member.id}
                        >
                          {deletingId === member.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}{' '}
                          Excluir
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 rounded-t-[2rem]">
              <CardTitle className="text-lg">Personalização Visual</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-4">
                <Label className="text-base font-bold">Logotipo do Consultório</Label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative group">
                    {settings.logo_url ? (
                      <img
                        src={settings.logo_url}
                        alt="Logo"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      title="Fazer upload de logo"
                    />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <Input
                      placeholder="https://exemplo.com/logo.png"
                      value={settings.logo_url}
                      onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-500">
                        Faça upload clicando no quadro ao lado ou cole o link (URL) direto.
                      </p>
                      {uploadingLogo && (
                        <p className="text-xs text-indigo-600 animate-pulse flex items-center gap-1 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" /> Enviando...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <Label className="text-base font-bold">Paleta de Cores (Tema)</Label>
                <div className="flex flex-wrap gap-4">
                  {colors.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setPreferences({ ...preferences, theme_color: c.id })}
                      className={`w-14 h-14 rounded-full ${c.class} shadow-sm ring-offset-2 transition-all hover:scale-110 ${preferences.theme_color === c.id ? 'ring-4 ring-slate-800 scale-110' : ''}`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicacao" className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 rounded-t-[2rem]">
              <CardTitle className="text-lg">Integração WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Label>Tipo de Integração</Label>
                <RadioGroup
                  value={settings.whatsapp_tipo}
                  onValueChange={(v) => setSettings({ ...settings, whatsapp_tipo: v })}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="padrao" id="wp" />
                    <Label htmlFor="wp">WhatsApp Padrão</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="wb" />
                    <Label htmlFor="wb">WhatsApp Business API</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                <div className="space-y-2 md:col-span-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={settings.whatsapp_api_key}
                    onChange={(e) => setSettings({ ...settings, whatsapp_api_key: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                {settings.whatsapp_tipo === 'business' && (
                  <>
                    <div className="space-y-2">
                      <Label>Phone ID</Label>
                      <Input
                        value={settings.whatsapp_business_phone_id}
                        onChange={(e) =>
                          setSettings({ ...settings, whatsapp_business_phone_id: e.target.value })
                        }
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account ID</Label>
                      <Input
                        value={settings.whatsapp_business_account_id}
                        onChange={(e) =>
                          setSettings({ ...settings, whatsapp_business_account_id: e.target.value })
                        }
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="pt-6 border-t border-slate-100">
                <h4 className="font-bold mb-3">Testar Conexão</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="5511999999999"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="h-12 rounded-xl max-w-xs"
                    inputMode="tel"
                  />
                  <Button
                    onClick={handleTestWhatsApp}
                    disabled={testingWhatsApp}
                    className="h-12 rounded-xl gap-2 w-full sm:w-auto"
                  >
                    {testingWhatsApp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Enviar Teste
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 rounded-t-[2rem]">
              <CardTitle className="text-lg">Automações</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-base">Lembrete de Sessão (24h)</Label>
                  <Switch
                    checked={settings.lembrete_whatsapp_ativo}
                    onCheckedChange={(c) =>
                      setSettings({ ...settings, lembrete_whatsapp_ativo: c })
                    }
                  />
                </div>
                {settings.lembrete_whatsapp_ativo && (
                  <Textarea
                    value={settings.template_lembrete}
                    onChange={(e) =>
                      setSettings({ ...settings, template_lembrete: e.target.value })
                    }
                    className="min-h-[100px] rounded-xl"
                  />
                )}
              </div>
              <div className="space-y-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-base">Confirmação de Agendamento</Label>
                  <Switch
                    checked={settings.whatsapp_confirmacao_ativa}
                    onCheckedChange={(c) =>
                      setSettings({ ...settings, whatsapp_confirmacao_ativa: c })
                    }
                  />
                </div>
                {settings.whatsapp_confirmacao_ativa && (
                  <Textarea
                    value={settings.template_confirmacao}
                    onChange={(e) =>
                      setSettings({ ...settings, template_confirmacao: e.target.value })
                    }
                    className="min-h-[100px] rounded-xl"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal">
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardContent className="p-6 pt-6 space-y-6">
              <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50">
                <div>
                  <Label className="font-bold text-base">
                    Agendamento Público (Página da Clínica)
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">
                    Permitir que novos pacientes realizem agendamentos online via link público.
                  </p>
                </div>
                <Switch
                  checked={settings.agendamento_publico_ativo}
                  onCheckedChange={(c) =>
                    setSettings({ ...settings, agendamento_publico_ativo: c })
                  }
                />
              </div>

              {settings.agendamento_publico_ativo && (
                <div className="space-y-3 p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50">
                  <Label className="font-bold text-indigo-900">
                    Link de Agendamento (Novo Paciente)
                  </Label>
                  <p className="text-sm text-indigo-700">
                    Compartilhe este link no seu Instagram, WhatsApp ou site para que os pacientes
                    realizem o auto-cadastro e agendamento.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/agendar/${user?.id}`}
                      className="bg-white border-indigo-200 font-mono text-sm h-12 rounded-xl text-slate-600"
                    />
                    <Button
                      variant="outline"
                      className="h-12 rounded-xl border-indigo-200 hover:bg-indigo-100 shrink-0 gap-2 text-indigo-700 font-semibold"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/agendar/${user?.id}`,
                        )
                        toast({ title: 'Link copiado para a área de transferência!' })
                      }}
                    >
                      <Copy className="w-4 h-4" /> Copiar Link
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-6 pt-6">
              <div className="space-y-3">
                <Label className="font-bold text-base">Contrato de Prestação de Serviços</Label>
                <Textarea
                  value={settings.texto_contrato}
                  onChange={(e) => setSettings({ ...settings, texto_contrato: e.target.value })}
                  className="min-h-[250px] rounded-xl font-mono text-sm leading-relaxed"
                />
              </div>
              <div className="space-y-3">
                <Label className="font-bold text-base">Política de Cancelamento</Label>
                <Textarea
                  value={settings.politica_cancelamento}
                  onChange={(e) =>
                    setSettings({ ...settings, politica_cancelamento: e.target.value })
                  }
                  className="min-h-[120px] rounded-xl text-sm leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
