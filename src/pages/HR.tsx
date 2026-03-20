import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Briefcase, Clock, FileText, Users, Check, X, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function HR() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [role, setRole] = useState('profissional')
  const [parentId, setParentId] = useState<string | null>(null)

  const [pontos, setPontos] = useState<any[]>([])
  const [solicitacoes, setSolicitacoes] = useState<any[]>([])
  const [equipe, setEquipe] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [hojePonto, setHojePonto] = useState<any>(null)
  const todayStr = new Date().toISOString().split('T')[0]

  const [novaSolicitacao, setNovaSolicitacao] = useState({
    tipo: 'atestado',
    data_inicio: '',
    data_fim: '',
    anexo_url: '',
  })

  useEffect(() => {
    if (user) {
      supabase
        .from('usuarios')
        .select('role, parent_id')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setRole(data.role || 'profissional')
            setParentId(data.parent_id || user.id)
            fetchData(data.role || 'profissional', data.parent_id || user.id)
          }
        })
    }
  }, [user])

  const fetchData = async (userRole: string, pId: string) => {
    setLoading(true)

    // Fetch user's own timecards and requests
    const { data: meusPontos } = await supabase
      .from('pontos_eletronicos')
      .select('*')
      .eq('usuario_id', user!.id)
      .order('data', { ascending: false })
      .limit(30)
    if (meusPontos) setPontos(meusPontos)

    const hoje = meusPontos?.find((p) => p.data === todayStr)
    if (hoje) setHojePonto(hoje)

    const { data: minhasSolic } = await supabase
      .from('solicitacoes_rh')
      .select('*')
      .eq('usuario_id', user!.id)
      .order('created_at', { ascending: false })
    if (minhasSolic) setSolicitacoes(minhasSolic)

    if (userRole === 'admin') {
      const { data: teamData } = await supabase
        .from('usuarios')
        .select('id, email, role, nome_consultorio')
        .eq('parent_id', pId)
      if (teamData) setEquipe(teamData)
    }

    setLoading(false)
  }

  const baterPonto = async (tipo: 'entrada' | 'saida_almoco' | 'retorno_almoco' | 'saida') => {
    if (!user) return
    const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    if (hojePonto) {
      const { data, error } = await supabase
        .from('pontos_eletronicos')
        .update({ [tipo]: agora })
        .eq('id', hojePonto.id)
        .select()
        .single()
      if (!error && data) {
        setHojePonto(data)
        setPontos((prev) => prev.map((p) => (p.id === data.id ? data : p)))
        toast({
          title: 'Ponto registrado',
          description: `Marcação de ${tipo.replace('_', ' ')} às ${agora}`,
        })
      }
    } else {
      const payload = { usuario_id: user.id, data: todayStr, [tipo]: agora }
      const { data, error } = await supabase
        .from('pontos_eletronicos')
        .insert(payload as any)
        .select()
        .single()
      if (!error && data) {
        setHojePonto(data)
        setPontos([data, ...pontos])
        toast({ title: 'Ponto registrado', description: `Entrada iniciada às ${agora}` })
      }
    }
  }

  const enviarSolicitacao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const { error } = await supabase.from('solicitacoes_rh').insert({
      usuario_id: user.id,
      ...novaSolicitacao,
    })
    if (!error) {
      toast({ title: 'Solicitação enviada' })
      setNovaSolicitacao({ tipo: 'atestado', data_inicio: '', data_fim: '', anexo_url: '' })
      fetchData(role, parentId || user.id)
    } else {
      toast({ title: 'Erro ao enviar', variant: 'destructive' })
    }
  }

  const updateSolicStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('solicitacoes_rh').update({ status }).eq('id', id)
    if (!error) {
      toast({ title: `Solicitação ${status}` })
      fetchData(role, parentId || user!.id)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-xl">
          <Briefcase className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">RH & Gestão</h1>
          <p className="text-slate-500 text-sm mt-1">Ponto eletrônico, atestados e equipe.</p>
        </div>
      </div>

      <Tabs defaultValue="ponto" className="w-full">
        <TabsList className="bg-slate-100/50 border border-slate-200 h-auto p-1">
          <TabsTrigger value="ponto" className="gap-2 py-2">
            <Clock className="w-4 h-4" /> Ponto Eletrônico
          </TabsTrigger>
          <TabsTrigger value="solicitacoes" className="gap-2 py-2">
            <FileText className="w-4 h-4" /> Atestados e Férias
          </TabsTrigger>
          {role === 'admin' && (
            <TabsTrigger value="equipe" className="gap-2 py-2">
              <Users className="w-4 h-4" /> Equipe (Admin)
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="ponto" className="space-y-6 mt-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg">
                Meu Ponto Hoje - {new Date().toLocaleDateString('pt-BR')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 border rounded-lg bg-slate-50">
                  <p className="text-xs font-bold uppercase text-slate-500 mb-2">Entrada</p>
                  <p className="text-xl font-medium">{hojePonto?.entrada || '--:--'}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full"
                    disabled={!!hojePonto?.entrada}
                    onClick={() => baterPonto('entrada')}
                  >
                    Registrar
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <p className="text-xs font-bold uppercase text-slate-500 mb-2">Saída Almoço</p>
                  <p className="text-xl font-medium">{hojePonto?.saida_almoco || '--:--'}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full"
                    disabled={!hojePonto?.entrada || !!hojePonto?.saida_almoco}
                    onClick={() => baterPonto('saida_almoco')}
                  >
                    Registrar
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <p className="text-xs font-bold uppercase text-slate-500 mb-2">Retorno Almoço</p>
                  <p className="text-xl font-medium">{hojePonto?.retorno_almoco || '--:--'}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full"
                    disabled={!hojePonto?.saida_almoco || !!hojePonto?.retorno_almoco}
                    onClick={() => baterPonto('retorno_almoco')}
                  >
                    Registrar
                  </Button>
                </div>
                <div className="p-4 border rounded-lg bg-slate-50">
                  <p className="text-xs font-bold uppercase text-slate-500 mb-2">Saída</p>
                  <p className="text-xl font-medium">{hojePonto?.saida || '--:--'}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full text-red-600 border-red-200 hover:bg-red-50"
                    disabled={!hojePonto?.entrada || !!hojePonto?.saida}
                    onClick={() => baterPonto('saida')}
                  >
                    Encerrar Dia
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Histórico Recente</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Almoço</TableHead>
                  <TableHead>Retorno</TableHead>
                  <TableHead>Saída</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pontos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {new Date(p.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{p.entrada || '-'}</TableCell>
                    <TableCell>{p.saida_almoco || '-'}</TableCell>
                    <TableCell>{p.retorno_almoco || '-'}</TableCell>
                    <TableCell>{p.saida || '-'}</TableCell>
                  </TableRow>
                ))}
                {pontos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="solicitacoes" className="space-y-6 mt-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg">Nova Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={enviarSolicitacao} className="flex gap-4 items-end flex-wrap">
                <div className="space-y-1">
                  <Label>Tipo</Label>
                  <Select
                    value={novaSolicitacao.tipo}
                    onValueChange={(v) => setNovaSolicitacao({ ...novaSolicitacao, tipo: v })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="atestado">Atestado</SelectItem>
                      <SelectItem value="ferias">Férias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Início</Label>
                  <Input
                    type="date"
                    required
                    value={novaSolicitacao.data_inicio}
                    onChange={(e) =>
                      setNovaSolicitacao({ ...novaSolicitacao, data_inicio: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fim</Label>
                  <Input
                    type="date"
                    required
                    value={novaSolicitacao.data_fim}
                    onChange={(e) =>
                      setNovaSolicitacao({ ...novaSolicitacao, data_fim: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1 flex-1 min-w-[200px]">
                  <Label>Anexo (URL do documento)</Label>
                  <Input
                    placeholder="https://..."
                    value={novaSolicitacao.anexo_url}
                    onChange={(e) =>
                      setNovaSolicitacao({ ...novaSolicitacao, anexo_url: e.target.value })
                    }
                  />
                </div>
                <Button type="submit">Enviar Solicitação</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitacoes.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="capitalize font-medium">{s.tipo}</TableCell>
                    <TableCell>
                      {new Date(s.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                      {new Date(s.data_fim).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{new Date(s.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.status === 'aprovado'
                            ? 'secondary'
                            : s.status === 'rejeitado'
                              ? 'destructive'
                              : 'outline'
                        }
                        className="capitalize"
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {solicitacoes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                      Nenhuma solicitação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {role === 'admin' && (
          <TabsContent value="equipe" className="space-y-6 mt-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" /> Gestão Centralizada
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 mb-6">
                  Aqui você pode visualizar as aprovações pendentes de sua equipe. As configurações
                  de permissões de acesso estão na aba Configurações.
                </p>

                <h3 className="font-bold text-slate-800 mb-3">Membros da Equipe</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {equipe.map((e) => (
                    <div key={e.id} className="p-4 border border-slate-200 rounded-lg shadow-sm">
                      <p className="font-semibold text-slate-800">{e.email}</p>
                      <Badge variant="outline" className="mt-1 uppercase text-[10px]">
                        {e.role}
                      </Badge>
                    </div>
                  ))}
                  {equipe.length === 0 && (
                    <p className="text-slate-500 text-sm">
                      Sua equipe está vazia. Convide membros nas Configurações.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
