import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Megaphone, RefreshCw, Send, History } from 'lucide-react'
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

export default function Marketing() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [formData, setFormData] = useState({ titulo: '', conteudo: '', tipo: 'newsletter' })
  const [sending, setSending] = useState(false)

  const fetchCampaigns = useCallback(async () => {
    if (!user) return
    setError(false)
    setLoading(true)

    const cacheKey = `marketing_${user.id}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) setCampaigns(JSON.parse(cached))

    try {
      await measurePerformance('fetchCampaigns', async () => {
        const { data, error } = await supabase
          .from('comunicacoes_campanhas')
          .select('*')
          .eq('usuario_id', user.id)
          .order('data_envio', { ascending: false })

        if (error) throw error
        setCampaigns(data || [])
        localStorage.setItem(cacheKey, JSON.stringify(data || []))
      })
    } catch (e) {
      console.error(e)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

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
      fetchCampaigns()
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
          <p className="text-slate-500 mb-4">Falha ao carregar campanhas.</p>
          <Button onClick={fetchCampaigns}>
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
        <TabsList className="mb-4">
          <TabsTrigger value="nova" className="gap-2">
            <Send className="w-4 h-4" /> Nova Campanha
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="w-4 h-4" /> Histórico de Envios
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
                  <Label>Conteúdo da Mensagem</Label>
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
      </Tabs>
    </div>
  )
}
