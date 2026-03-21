import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Shield,
  Landmark,
  User,
  Key,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Palette,
  Image as ImageIcon,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const SECRETS_LIST = [
  {
    key: 'STRIPE_SECRET_KEY',
    desc: 'Pagamentos via Cartão de Crédito',
    doc: 'https://stripe.com/docs/keys',
  },
  {
    key: 'MERCADO_PAGO_TOKEN',
    desc: 'Pagamentos via PIX e Cartão',
    doc: 'https://www.mercadopago.com.br/developers/pt/guides',
  },
  {
    key: 'PAGSEGURO_TOKEN',
    desc: 'Pagamentos via Boleto',
    doc: 'https://dev.pagseguro.uol.com.br/',
  },
  {
    key: 'WHATSAPP_API_KEY',
    desc: 'Envio automático de lembretes',
    doc: 'https://developers.facebook.com/docs/whatsapp',
  },
  {
    key: 'GEMINI_API_KEY',
    desc: 'Inteligência Artificial para Agenda',
    doc: 'https://ai.google.dev/',
  },
  {
    key: 'ZOOM_CLIENT_ID',
    desc: 'Geração de links de videoconferência',
    doc: 'https://developers.zoom.us/',
  },
]

const THEMES = [
  { id: 'theme-indigo', name: 'Roxo (Padrão)', color: 'bg-[#8b5cf6]' },
  { id: 'theme-blue', name: 'Azul', color: 'bg-[#3b82f6]' },
  { id: 'theme-emerald', name: 'Esmeralda', color: 'bg-[#10b981]' },
  { id: 'theme-rose', name: 'Rosé', color: 'bg-[#f43f5e]' },
  { id: 'theme-slate', name: 'Grafite', color: 'bg-[#64748b]' },
  { id: 'theme-pink', name: 'Rosa', color: 'bg-[#ec4899]' },
  { id: 'theme-diamond', name: 'Diamante', color: 'bg-[#06b6d4]' },
  { id: 'theme-ruby', name: 'Rubi', color: 'bg-[#e11d48]' },
]

export default function Settings() {
  const { user, updatePassword } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passData, setPassData] = useState({ newPass: '', confirm: '' })

  const [formData, setFormData] = useState({
    nome_consultorio: '',
    email: '',
    telefone_consultorio: '',
    endereco_consultorio: '',
    chave_pix: '',
    logo_url: '',
    preferencias_dashboard: {} as any,
  })

  // Local state for visually tracking which secrets the user claims they configured
  const [configuredSecrets, setConfiguredSecrets] = useState<Record<string, boolean>>({})

  const [bankInfo, setBankInfo] = useState({
    banco: '',
    agencia: '',
    conta: '',
    tipo: 'corrente',
  })

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return
      const { data, error } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
      if (data) {
        setFormData({
          nome_consultorio: data.nome_consultorio || '',
          email: data.email || '',
          telefone_consultorio: data.telefone_consultorio || '',
          endereco_consultorio: data.endereco_consultorio || '',
          chave_pix: data.chave_pix || '',
          logo_url: data.logo_url || '',
          preferencias_dashboard: data.preferencias_dashboard || {},
        })
        if (data.preferencias_dashboard?.bankInfo) {
          setBankInfo(data.preferencias_dashboard.bankInfo)
        }
        if (data.preferencias_dashboard?.configuredSecrets) {
          setConfiguredSecrets(data.preferencias_dashboard.configuredSecrets)
        }
      }
      setLoading(false)
    }
    fetchUser()
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    const prefs = {
      ...formData.preferencias_dashboard,
      bankInfo,
      configuredSecrets,
    }

    const { error } = await supabase
      .from('usuarios')
      .update({
        nome_consultorio: formData.nome_consultorio,
        telefone_consultorio: formData.telefone_consultorio,
        endereco_consultorio: formData.endereco_consultorio,
        chave_pix: formData.chave_pix,
        logo_url: formData.logo_url,
        preferencias_dashboard: prefs,
      })
      .eq('id', user.id)

    setSaving(false)
    if (error)
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    else toast({ title: 'Configurações salvas com sucesso!' })
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passData.newPass !== passData.confirm) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' })
      return
    }
    setSaving(true)
    const { error } = await updatePassword(passData.newPass)
    setSaving(false)
    if (error)
      toast({
        title: 'Erro ao atualizar senha',
        description: error.message,
        variant: 'destructive',
      })
    else {
      toast({ title: 'Senha atualizada com sucesso!' })
      setPassData({ newPass: '', confirm: '' })
    }
  }

  const handleToggleSecret = (key: string, checked: boolean) => {
    setConfiguredSecrets((prev) => ({ ...prev, [key]: checked }))
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Configurações Gerais
        </h1>
        <p className="text-slate-500 mt-1 text-base">
          Gerencie seu perfil, conta bancária e integrações do sistema.
        </p>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="bg-slate-100/80 p-1.5 rounded-2xl mb-8 flex overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <TabsTrigger value="perfil" className="rounded-xl px-6 py-2.5 font-semibold gap-2">
            <User className="w-4 h-4" /> Perfil & Clínica
          </TabsTrigger>
          <TabsTrigger value="aparencia" className="rounded-xl px-6 py-2.5 font-semibold gap-2">
            <Palette className="w-4 h-4" /> Aparência
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="rounded-xl px-6 py-2.5 font-semibold gap-2">
            <Landmark className="w-4 h-4" /> Financeiro
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="rounded-xl px-6 py-2.5 font-semibold gap-2">
            <Shield className="w-4 h-4" /> Segurança
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="rounded-xl px-6 py-2.5 font-semibold gap-2">
            <Key className="w-4 h-4" /> Integrações (Secrets)
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSaveProfile}>
          <TabsContent value="perfil" className="space-y-6">
            <Card className="rounded-[2rem] shadow-sm border-slate-100">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl">Identidade do Profissional</CardTitle>
                <CardDescription>Informações que aparecem para seus pacientes.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Nome do Profissional / Clínica</Label>
                    <Input
                      value={formData.nome_consultorio}
                      onChange={(e) =>
                        setFormData({ ...formData, nome_consultorio: e.target.value })
                      }
                      className="bg-slate-50/50 rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail de Contato</Label>
                    <Input
                      value={formData.email}
                      disabled
                      className="bg-slate-100 rounded-xl h-11 cursor-not-allowed opacity-70"
                      title="Não é possível alterar o e-mail de login por aqui"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone Principal</Label>
                    <Input
                      value={formData.telefone_consultorio}
                      onChange={(e) =>
                        setFormData({ ...formData, telefone_consultorio: e.target.value })
                      }
                      className="bg-slate-50/50 rounded-xl h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Endereço Completo</Label>
                  <Textarea
                    value={formData.endereco_consultorio}
                    onChange={(e) =>
                      setFormData({ ...formData, endereco_consultorio: e.target.value })
                    }
                    className="bg-slate-50/50 rounded-xl min-h-[100px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aparencia" className="space-y-6">
            <Card className="rounded-[2rem] shadow-sm border-slate-100">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl">Identidade Visual</CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema com a sua marca e cores.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Logo e Nome
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-2">
                      <Label>Nome do Aplicativo / Clínica</Label>
                      <Input
                        value={formData.nome_consultorio}
                        onChange={(e) =>
                          setFormData({ ...formData, nome_consultorio: e.target.value })
                        }
                        className="bg-white rounded-xl h-11"
                      />
                      <p className="text-xs text-slate-500">
                        Este nome aparecerá no menu lateral e nos portais.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>URL do Logo</Label>
                      <Input
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://sua-imagem.com/logo.png"
                        className="bg-white rounded-xl h-11"
                      />
                      <p className="text-xs text-slate-500">
                        Insira um link direto para a imagem do seu logo.
                      </p>
                      {formData.logo_url && (
                        <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 inline-block h-20 flex items-center justify-center">
                          <img
                            src={formData.logo_url}
                            alt="Logo"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Tema de Cores
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            preferencias_dashboard: {
                              ...formData.preferencias_dashboard,
                              theme: theme.id,
                            },
                          })
                          document.documentElement.classList.remove(
                            'theme-indigo',
                            'theme-blue',
                            'theme-emerald',
                            'theme-rose',
                            'theme-slate',
                            'theme-pink',
                            'theme-diamond',
                            'theme-ruby',
                          )
                          document.documentElement.classList.add(theme.id)
                        }}
                        className={cn(
                          'w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all',
                          formData.preferencias_dashboard?.theme === theme.id
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300',
                        )}
                      >
                        <div className={cn('w-8 h-8 rounded-full shadow-sm', theme.color)} />
                        <span className="text-xs font-semibold text-slate-700">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-6">
            <Card className="rounded-[2rem] shadow-sm border-slate-100">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl">Dados de Recebimento</CardTitle>
                <CardDescription>
                  Configure suas contas para receber pagamentos e emitir cobranças.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Key className="w-4 h-4" /> Chave PIX Principal
                  </h3>
                  <div className="max-w-md space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <Label>Chave PIX (Aparecerá nas cobranças manuais)</Label>
                    <Input
                      value={formData.chave_pix}
                      onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                      placeholder="CPF, E-mail, Telefone ou Aleatória"
                      className="bg-white rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Landmark className="w-4 h-4" /> Dados Bancários
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-2">
                      <Label>Banco</Label>
                      <Input
                        value={bankInfo.banco}
                        onChange={(e) => setBankInfo({ ...bankInfo, banco: e.target.value })}
                        placeholder="Ex: Nubank, Itaú"
                        className="bg-white rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Agência</Label>
                      <Input
                        value={bankInfo.agencia}
                        onChange={(e) => setBankInfo({ ...bankInfo, agencia: e.target.value })}
                        placeholder="Ex: 0001"
                        className="bg-white rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Conta</Label>
                      <Input
                        value={bankInfo.conta}
                        onChange={(e) => setBankInfo({ ...bankInfo, conta: e.target.value })}
                        placeholder="Ex: 12345-6"
                        className="bg-white rounded-xl h-11"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integracoes" className="space-y-6">
            <Card className="rounded-[2rem] shadow-sm border-slate-100">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl">Gerenciamento de Secrets</CardTitle>
                <CardDescription>
                  Para habilitar as integrações avançadas (Gateways de Pagamento, WhatsApp, IA),
                  você deve cadastrar as chaves oficiais no painel{' '}
                  <strong>Edge Functions &gt; Secrets</strong> do seu banco de dados Supabase. Use
                  este checklist visual para acompanhar o que já foi configurado.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {SECRETS_LIST.map((s) => (
                    <div
                      key={s.key}
                      className={cn(
                        'flex items-start gap-4 p-5 rounded-2xl border transition-colors',
                        configuredSecrets[s.key]
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-white border-slate-200',
                      )}
                    >
                      <div className="pt-1">
                        <Checkbox
                          checked={configuredSecrets[s.key] || false}
                          onCheckedChange={(val) => handleToggleSecret(s.key, !!val)}
                          className={cn(
                            'w-5 h-5 rounded-md',
                            configuredSecrets[s.key] &&
                              'data-[state=checked]:bg-emerald-500 border-emerald-500',
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold font-mono text-sm text-slate-800 break-all">
                            {s.key}
                          </p>
                          {configuredSecrets[s.key] && (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[10px] px-2 py-0">
                              Ativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1 mb-3">{s.desc}</p>
                        <a
                          href={s.doc}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Acessar Documentação
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sticky Save Button for Profile/Finance/Integrations */}
          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl h-12 px-10 text-base shadow-md"
            >
              {saving ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </form>

        <TabsContent value="seguranca" className="space-y-6">
          <Card className="rounded-[2rem] shadow-sm border-slate-100">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl">Atualizar Senha</CardTitle>
              <CardDescription>Escolha uma senha forte para proteger seus dados.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
                <div className="space-y-2">
                  <Label>Nova Senha</Label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={passData.newPass}
                    onChange={(e) => setPassData({ ...passData, newPass: e.target.value })}
                    className="bg-slate-50/50 rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar Nova Senha</Label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={passData.confirm}
                    onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                    className="bg-slate-50/50 rounded-xl h-11"
                  />
                </div>
                <Button type="submit" disabled={saving} className="rounded-xl h-12 w-full mt-2">
                  {saving ? 'Atualizando...' : 'Alterar Senha'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
