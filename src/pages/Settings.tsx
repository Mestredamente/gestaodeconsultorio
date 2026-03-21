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
import { Save, Loader2, Building2, MessageCircle, Link as LinkIcon, Shield } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
      const { error } = await supabase.from('usuarios').update(settings).eq('id', user.id)
      if (error) throw error
      toast({ title: 'Configurações salvas com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
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
          className="h-11 px-6 rounded-xl gap-2 shadow-sm w-full sm:w-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="mb-6 flex w-full justify-start overflow-x-auto h-auto bg-slate-100/50 p-1.5 rounded-2xl [&::-webkit-scrollbar]:hidden scroll-smooth">
          <TabsTrigger
            value="geral"
            className="px-6 py-3 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-bold flex-shrink-0 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" /> Perfil e Clínica
          </TabsTrigger>
          <TabsTrigger
            value="comunicacao"
            className="px-6 py-3 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-bold flex-shrink-0 flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp & Avisos
          </TabsTrigger>
          <TabsTrigger
            value="portal"
            className="px-6 py-3 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-bold flex-shrink-0 flex items-center gap-2"
          >
            <LinkIcon className="w-4 h-4" /> Portal do Paciente
          </TabsTrigger>
          <TabsTrigger
            value="legal"
            className="px-6 py-3 whitespace-nowrap rounded-xl data-[state=active]:shadow-sm text-sm font-bold flex-shrink-0 flex items-center gap-2"
          >
            <Shield className="w-4 h-4" /> Documentos Legais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <Card className="rounded-[2rem] shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Dados Principais</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Nome do Consultório / Profissional</Label>
                  <Input
                    value={settings.nome_consultorio}
                    onChange={(e) => setSettings({ ...settings, nome_consultorio: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone Principal</Label>
                  <Input
                    value={settings.telefone_consultorio}
                    onChange={(e) =>
                      setSettings({ ...settings, telefone_consultorio: e.target.value })
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Endereço Completo</Label>
                  <Input
                    value={settings.endereco_consultorio}
                    onChange={(e) =>
                      setSettings({ ...settings, endereco_consultorio: e.target.value })
                    }
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chave PIX (Para cobranças)</Label>
                  <Input
                    value={settings.chave_pix}
                    onChange={(e) => setSettings({ ...settings, chave_pix: e.target.value })}
                    className="h-11 rounded-xl font-mono text-sm"
                    placeholder="CPF, Email ou Telefone"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comunicacao" className="space-y-6">
          <Card className="rounded-[2rem] shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Integração WhatsApp</CardTitle>
              <CardDescription>
                Configure as credenciais para envio de mensagens automáticas.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <Label>Tipo de Integração</Label>
                <RadioGroup
                  value={settings.whatsapp_tipo === 'personal' ? 'padrao' : settings.whatsapp_tipo}
                  onValueChange={(v) => setSettings({ ...settings, whatsapp_tipo: v })}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="padrao" id="config_padrao" />
                    <Label
                      htmlFor="config_padrao"
                      className="font-normal cursor-pointer text-slate-700"
                    >
                      WhatsApp Padrão
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="config_business" />
                    <Label
                      htmlFor="config_business"
                      className="font-normal cursor-pointer text-slate-700"
                    >
                      WhatsApp Business
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                <div className="space-y-2 md:col-span-2">
                  <Label>API Key</Label>
                  <Input
                    value={settings.whatsapp_api_key}
                    onChange={(e) => setSettings({ ...settings, whatsapp_api_key: e.target.value })}
                    className="h-11 rounded-xl"
                    placeholder="Token de Acesso (API Key)"
                    type="password"
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
                        className="h-11 rounded-xl"
                        placeholder="Ex: 10492839281"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account ID</Label>
                      <Input
                        value={settings.whatsapp_business_account_id}
                        onChange={(e) =>
                          setSettings({ ...settings, whatsapp_business_account_id: e.target.value })
                        }
                        className="h-11 rounded-xl"
                        placeholder="Ex: 192837465"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Automações de WhatsApp</CardTitle>
              <CardDescription>
                O sistema enviará mensagens formatadas baseadas nestes templates.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Lembrete 24h */}
              <div className="space-y-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-bold text-slate-800">
                      Lembrete de Sessão (24h antes)
                    </Label>
                    <p className="text-sm text-slate-500">
                      Enviado automaticamente para agendamentos futuros.
                    </p>
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
                    className="min-h-[100px] rounded-xl text-sm"
                    placeholder="Ex: Olá [Nome], lembrando da nossa sessão [data] às [hora]."
                  />
                )}
              </div>

              {/* Confirmação Imediata */}
              <div className="space-y-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-bold text-slate-800">
                      Confirmação de Agendamento
                    </Label>
                    <p className="text-sm text-slate-500">
                      Enviado no momento que você agenda o paciente.
                    </p>
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
                    className="min-h-[100px] rounded-xl text-sm"
                  />
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100">
                <strong>Variáveis disponíveis:</strong> [Nome], [data], [hora], [TipoSessao],
                [link_portal]
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal" className="space-y-6">
          <Card className="rounded-[2rem] shadow-sm border-slate-200">
            <CardContent className="p-6 space-y-6 pt-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <Label className="text-base font-bold text-slate-800">Agendamento Público</Label>
                  <p className="text-sm text-slate-500 mt-1">
                    Permitir que pacientes novos agendem horários pelo seu link público.
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
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-medium flex justify-between items-center border border-emerald-100">
                  <span>Seu link de agendamento:</span>
                  <a
                    href={`/agendar/${user?.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold hover:text-emerald-900"
                  >
                    Acessar Link
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-6">
          <Card className="rounded-[2rem] shadow-sm border-slate-200">
            <CardContent className="p-6 space-y-6 pt-6">
              <div className="space-y-3">
                <Label className="text-base font-bold">
                  Termos de Contrato de Prestação de Serviço
                </Label>
                <p className="text-sm text-slate-500">
                  Este texto será exibido no Portal do Paciente para aceite digital (Validade
                  Jurídica).
                </p>
                <Textarea
                  value={settings.texto_contrato}
                  onChange={(e) => setSettings({ ...settings, texto_contrato: e.target.value })}
                  className="min-h-[250px] rounded-xl text-sm font-mono"
                  placeholder="Insira as cláusulas do seu contrato terapêutico..."
                />
              </div>
              <div className="space-y-3">
                <Label className="text-base font-bold">Política de Cancelamento</Label>
                <p className="text-sm text-slate-500">
                  Regras para faltas e remarcações (ex: antecedência mínima de 24h).
                </p>
                <Textarea
                  value={settings.politica_cancelamento}
                  onChange={(e) =>
                    setSettings({ ...settings, politica_cancelamento: e.target.value })
                  }
                  className="min-h-[100px] rounded-xl text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
