import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Megaphone, RefreshCw, Send, History, FileText } from 'lucide-react'
import { measurePerformance } from '@/lib/performance'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TemplatesManager } from '@/components/TemplatesManager'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function Marketing() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [marketingTemplates, setMarketingTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [formData, setFormData] = useState({ titulo: '', conteudo: '', tipo: 'newsletter' })
  const [sending, setSending] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

  const fetchCampaignsAndTemplates = useCallback(async () => {
    if (!user) return
    setError(false)
    setLoading(true)

    try {
      await measurePerformance('fetchMarketing', async () => {
        const [campsRes, tmplRes] = await Promise.all([
          supabase
            .from('comunicacoes_campanhas')
            .select('*')
            .eq('usuario_id', user.id)
            .order('data_envio', { ascending: false }),
          supabase
            .from('templates_documentos')
            .select('*')
            .eq('usuario_id', user.id)
            .eq('tipo', 'email_marketing')
            .order('data_criacao', { ascending: false }),
        ])

        if (campsRes.error) throw campsRes.error
        setCampaigns(campsRes.data || [])
        setMarketingTemplates(tmplRes.data || [])
      })
    } catch (e) {
      console.error(e)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCampaignsAndTemplates()
  }, [fetchCampaignsAndTemplates])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const { data, error } = await supabase.functions.invoke('enviar_comunicado_massa', {
        body: formData,
      })
      if (error) throw error
      toast({
        title: 'Campanha enviada com sucesso!',
        description: `Processado para ${data.count} paciente(s).`,
      })
      setFormData({ titulo: '', conteudo: '', tipo: 'newsletter' })
      fetchCampaignsAndTemplates()
    } catch (e: any) {
      toast({ title: 'Erro ao enviar', description: e.message, variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  if (error && campaigns.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-10 text-center">
          <p className="text-slate-500 mb-4">Falha ao carregar dados.</p>
          <Button onClick={fetchCampaignsAndTemplates}>
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" /> Marketing e Comunicados
        </h1>
        <p className="text-slate-500 mt-1">
          Envie newsletters e avisos importantes para toda a sua base de pacientes.
        </p>
      </div>

      <Tabs defaultValue="nova" className="w-full">
        <TabsList className="mb-4 h-auto flex-wrap p-1">
          <TabsTrigger value="nova" className="gap-2 py-2">
            <Send className="w-4 h-4" /> Nova Campanha
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2 py-2">
            <History className="w-4 h-4" /> Histórico de Envios
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2 py-2">
            <FileText className="w-4 h-4" /> Modelos de Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nova">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg">Criar Comunicado</CardTitle>
              <CardDescription>
                O email será enviado para todos os pacientes com endereço de email válido.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-2">
                  <Label>Assunto do Email</Label>
                  <Input
                    required
                    placeholder="Ex: Atualizações sobre a clínica ou Novo formato de atendimento"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <Label>Conteúdo da Mensagem</Label>
                    <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-8">
                          Carregar Template
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Selecionar Modelo</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto pr-1">
                          {marketingTemplates.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">
                              Nenhum template encontrado.
                            </p>
                          )}
                          {marketingTemplates.map((t) => (
                            <Card
                              key={t.id}
                              className="cursor-pointer hover:border-primary hover:shadow-sm transition-all"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  conteudo: t.conteudo,
                                  titulo: t.titulo,
                                })
                                setIsTemplateModalOpen(false)
                              }}
                            >
                              <CardContent className="p-4">
                                <p className="font-semibold text-slate-800">{t.titulo}</p>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {t.conteudo}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Textarea
                    required
                    placeholder="Escreva sua mensagem aqui..."
                    className="min-h-[250px] resize-y"
                    value={formData.conteudo}
                    onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={sending} className="w-full sm:w-auto h-11 gap-2">
                  {sending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Enviar para Todos
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card className="shadow-sm border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                      Nenhum envio realizado.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-slate-600">
                        {new Date(c.data_envio).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{c.titulo}</TableCell>
                      <TableCell className="capitalize text-slate-500">{c.tipo}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesManager
            defaultTipo="email_marketing"
            title="Modelos de Email"
            description="Crie layouts padrão para suas campanhas de marketing e comunicados."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
