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
import {
  Save,
  Loader2,
  Building2,
  MessageCircle,
  Link as LinkIcon,
  Shield,
  Send,
} from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingWhatsApp, setTestingWhatsApp] = useState(false)
  const [testPhone, setTestPhone] = useState('')

  const [settings, setSettings] = useState({
    nome_consultorio: '',
    endereco_consultorio: '',
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
  })

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return
      const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
      if (data) {
        setSettings({
          nome_consultorio: data.nome_consultorio || '',
          endereco_consultorio: data.endereco_consultorio || '',
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
        })
      }
      setLoading(false)
    }
    fetchSettings()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const payload = { ...settings }
      if (payload.whatsapp_tipo === 'personal') payload.whatsapp_tipo = 'padrao'
      const { error } = await supabase.from('usuarios').update(payload).eq('id', user.id)
      if (error) throw error
      toast({ title: 'Configurações salvas com sucesso!' })
      setSettings(payload)
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
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
      if (cleanPhone.length < 10) throw new Error('Número inválido. Use DDD + Número.')

      const { error } = await supabase.functions.invoke('enviar_mensagem_whatsapp', {
        body: {
          tipo_whatsapp: settings.whatsapp_tipo,
          telefone: cleanPhone,
          mensagem: 'Olá! Este é um teste de integração do seu CRM de Gestão de Consultório.',
          usuario_id: user?.id,
        },
      })
      if (error) throw error

      await supabase.from('log_whatsapp').insert({
        telefone: cleanPhone,
        mensagem: 'Teste de Integração CRM',
        status: 'sucesso',
        usuario_id: user?.id,
      })

      toast({ title: 'Sucesso!', description: 'Mensagem de teste enviada.' })
    } catch (err: any) {
      toast({ title: 'Falha no teste', description: err.message, variant: 'destructive' })
      await supabase
        .from('log_whatsapp')
        .insert({
          telefone: testPhone,
          mensagem: 'Teste de Integração CRM',
          status: 'erro',
          erro: err.message,
          usuario_id: user?.id,
        })
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Configurações</h1>
          <p className="text-slate-500 mt-1">Personalize o comportamento do seu sistema</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-14 md:h-11 px-6 rounded-xl gap-2 font-bold w-full sm:w-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{' '}
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="mb-6 flex w-full justify-start overflow-x-auto h-auto bg-slate-100/50 p-1.5 rounded-2xl scrollbar-hide border border-slate-100">
          <TabsTrigger
            value="geral"
            className="px-5 py-3 md:py-2.5 rounded-xl font-bold flex gap-2"
          >
            <Building2 className="w-4 h-4" /> Perfil
          </TabsTrigger>
          <TabsTrigger
            value="comunicacao"
            className="px-5 py-3 md:py-2.5 rounded-xl font-bold flex gap-2"
          >
            <MessageCircle className="w-4 h-4" /> Mensagens
          </TabsTrigger>
          <TabsTrigger
            value="portal"
            className="px-5 py-3 md:py-2.5 rounded-xl font-bold flex gap-2"
          >
            <LinkIcon className="w-4 h-4" /> Portal
          </TabsTrigger>
          <TabsTrigger
            value="legal"
            className="px-5 py-3 md:py-2.5 rounded-xl font-bold flex gap-2"
          >
            <Shield className="w-4 h-4" /> Legal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Nome do Consultório</Label>
                  <Input
                    value={settings.nome_consultorio}
                    onChange={(e) => setSettings({ ...settings, nome_consultorio: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    inputMode="tel"
                    value={settings.telefone_consultorio}
                    onChange={(e) =>
                      setSettings({ ...settings, telefone_consultorio: e.target.value })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    value={settings.endereco_consultorio}
                    onChange={(e) =>
                      setSettings({ ...settings, endereco_consultorio: e.target.value })
                    }
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chave PIX</Label>
                  <Input
                    value={settings.chave_pix}
                    onChange={(e) => setSettings({ ...settings, chave_pix: e.target.value })}
                    className="h-12 rounded-xl font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicacao" className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
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
                <div className="flex gap-2">
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
                    className="h-12 rounded-xl gap-2"
                  >
                    {testingWhatsApp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}{' '}
                    Enviar Teste
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Automações</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-bold">Lembrete de Sessão (24h)</Label>
                  </div>
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
              <div className="space-y-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-bold">Confirmação de Agendamento</Label>
                  </div>
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
            <CardContent className="p-6 space-y-6 pt-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <Label className="font-bold">Agendamento Público</Label>
                </div>
                <Switch
                  checked={settings.agendamento_publico_ativo}
                  onCheckedChange={(c) =>
                    setSettings({ ...settings, agendamento_publico_ativo: c })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="legal">
          <Card className="rounded-[2rem] border-slate-200 shadow-sm">
            <CardContent className="p-6 space-y-6 pt-6">
              <div className="space-y-3">
                <Label className="font-bold">Contrato de Prestação</Label>
                <Textarea
                  value={settings.texto_contrato}
                  onChange={(e) => setSettings({ ...settings, texto_contrato: e.target.value })}
                  className="min-h-[250px] rounded-xl font-mono"
                />
              </div>
              <div className="space-y-3">
                <Label className="font-bold">Política de Cancelamento</Label>
                <Textarea
                  value={settings.politica_cancelamento}
                  onChange={(e) =>
                    setSettings({ ...settings, politica_cancelamento: e.target.value })
                  }
                  className="min-h-[100px] rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
