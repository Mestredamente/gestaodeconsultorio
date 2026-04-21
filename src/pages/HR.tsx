import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import {
  Briefcase,
  Clock,
  FileText,
  Users,
  ShieldAlert,
  FileUp,
  CheckCircle,
  XCircle,
  Search,
  FileDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProtectedComponent } from '@/components/ProtectedComponent'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

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

  const [uploadingAtestado, setUploadingAtestado] = useState(false)

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

    if (userRole === 'admin' || userRole === 'superadmin' || userRole === 'secretaria') {
      const { data: teamData } = await supabase
        .from('usuarios')
        .select('id, email, role, nome_consultorio, nome, cpf, portal_settings')
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setUploadingAtestado(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `atestado-${user.id}-${Date.now()}.${fileExt}`
      const filePath = `rh/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documentos-propostas')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('documentos-propostas').getPublicUrl(filePath)
      setNovaSolicitacao((prev) => ({ ...prev, anexo_url: data.publicUrl }))
      toast({ title: 'Arquivo anexado com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro ao anexar arquivo', description: err.message, variant: 'destructive' })
    } finally {
      setUploadingAtestado(false)
    }
  }

  const enviarSolicitacao = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!novaSolicitacao.data_inicio || !novaSolicitacao.data_fim) {
      toast({ title: 'Preencha as datas', variant: 'destructive' })
      return
    }
    const { error } = await supabase.from('solicitacoes_rh').insert({
      usuario_id: user.id,
      ...novaSolicitacao,
    })
    if (!error) {
      toast({ title: 'Solicitação enviada com sucesso!' })
      setNovaSolicitacao({ tipo: 'atestado', data_inicio: '', data_fim: '', anexo_url: '' })
      fetchData(role, parentId || user.id)
    } else {
      toast({ title: 'Erro ao enviar', description: error.message, variant: 'destructive' })
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
    <ProtectedComponent
      requiredPermission="manage_settings"
      fallback={<div className="p-8 text-center text-slate-500">Acesso negado. Área restrita.</div>}
    >
      <div className="space-y-6 animate-fade-in pb-10 max-w-6xl mx-auto px-4 md:px-0 mt-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">RH & Pessoal</h1>
            <p className="text-slate-500 text-sm mt-1">
              Ponto eletrônico, atestados e dados da equipe.
            </p>
          </div>
        </div>

        <Tabs defaultValue="ponto" className="w-full">
          <TabsList className="bg-slate-100/50 border border-slate-200 h-auto p-1.5 rounded-xl flex flex-wrap justify-start">
            <TabsTrigger value="ponto" className="gap-2 py-2.5 rounded-lg font-medium">
              <Clock className="w-4 h-4" /> Ponto Eletrônico
            </TabsTrigger>
            <TabsTrigger value="solicitacoes" className="gap-2 py-2.5 rounded-lg font-medium">
              <FileText className="w-4 h-4" /> Atestados e Solicitações
            </TabsTrigger>
            {(role === 'admin' || role === 'superadmin' || role === 'secretaria') && (
              <TabsTrigger value="equipe" className="gap-2 py-2.5 rounded-lg font-medium">
                <Users className="w-4 h-4" /> Gestão da Equipe
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="ponto" className="space-y-6 mt-6">
            <Card className="shadow-sm border-slate-200 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-xl">Registro de Ponto - Hoje</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                    <p className="text-sm font-bold uppercase text-slate-500 mb-3 tracking-wider">
                      Entrada
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mb-4">
                      {hojePonto?.entrada || '--:--'}
                    </p>
                    <Button
                      variant={hojePonto?.entrada ? 'secondary' : 'default'}
                      className="w-full rounded-xl h-12 font-bold"
                      disabled={!!hojePonto?.entrada}
                      onClick={() => baterPonto('entrada')}
                    >
                      {hojePonto?.entrada ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <Clock className="w-4 h-4 mr-2" />
                      )}
                      Registrar
                    </Button>
                  </div>
                  <div className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                    <p className="text-sm font-bold uppercase text-slate-500 mb-3 tracking-wider">
                      Saída Almoço
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mb-4">
                      {hojePonto?.saida_almoco || '--:--'}
                    </p>
                    <Button
                      variant={hojePonto?.saida_almoco ? 'secondary' : 'outline'}
                      className="w-full rounded-xl h-12 font-bold"
                      disabled={!hojePonto?.entrada || !!hojePonto?.saida_almoco}
                      onClick={() => baterPonto('saida_almoco')}
                    >
                      {hojePonto?.saida_almoco ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        'Registrar'
                      )}
                    </Button>
                  </div>
                  <div className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                    <p className="text-sm font-bold uppercase text-slate-500 mb-3 tracking-wider">
                      Retorno
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mb-4">
                      {hojePonto?.retorno_almoco || '--:--'}
                    </p>
                    <Button
                      variant={hojePonto?.retorno_almoco ? 'secondary' : 'outline'}
                      className="w-full rounded-xl h-12 font-bold"
                      disabled={!hojePonto?.saida_almoco || !!hojePonto?.retorno_almoco}
                      onClick={() => baterPonto('retorno_almoco')}
                    >
                      {hojePonto?.retorno_almoco ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        'Registrar'
                      )}
                    </Button>
                  </div>
                  <div className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                    <p className="text-sm font-bold uppercase text-slate-500 mb-3 tracking-wider">
                      Saída Final
                    </p>
                    <p className="text-3xl font-bold text-slate-800 mb-4">
                      {hojePonto?.saida || '--:--'}
                    </p>
                    <Button
                      variant={hojePonto?.saida ? 'secondary' : 'destructive'}
                      className="w-full rounded-xl h-12 font-bold"
                      disabled={!hojePonto?.entrada || !!hojePonto?.saida}
                      onClick={() => baterPonto('saida')}
                    >
                      {hojePonto?.saida ? <CheckCircle className="w-4 h-4 mr-2" /> : 'Encerrar Dia'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm rounded-[2rem] overflow-hidden border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-lg">Meu Histórico Recente</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="font-bold">Data</TableHead>
                      <TableHead className="font-bold">Entrada</TableHead>
                      <TableHead className="font-bold">Almoço</TableHead>
                      <TableHead className="font-bold">Retorno</TableHead>
                      <TableHead className="font-bold">Saída</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pontos.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-slate-700">
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
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                          Nenhum registro encontrado. Comece a bater o ponto para ver o histórico.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="solicitacoes" className="space-y-6 mt-6">
            <Card className="shadow-sm rounded-[2rem] border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                <CardTitle className="text-lg">Nova Solicitação (Atestado / Férias)</CardTitle>
                <CardDescription>
                  Envie atestados médicos ou solicite férias para análise.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={enviarSolicitacao} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Tipo de Solicitação</Label>
                      <Select
                        value={novaSolicitacao.tipo}
                        onValueChange={(v) => setNovaSolicitacao({ ...novaSolicitacao, tipo: v })}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="atestado">Atestado Médico</SelectItem>
                          <SelectItem value="ferias">Férias</SelectItem>
                          <SelectItem value="ausencia">Ausência Justificada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Data de Início</Label>
                      <Input
                        type="date"
                        required
                        value={novaSolicitacao.data_inicio}
                        onChange={(e) =>
                          setNovaSolicitacao({ ...novaSolicitacao, data_inicio: e.target.value })
                        }
                        className="h-12 rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Data de Retorno/Fim</Label>
                      <Input
                        type="date"
                        required
                        value={novaSolicitacao.data_fim}
                        onChange={(e) =>
                          setNovaSolicitacao({ ...novaSolicitacao, data_fim: e.target.value })
                        }
                        className="h-12 rounded-xl bg-white"
                      />
                    </div>
                    <div className="space-y-2 flex flex-col justify-end h-full">
                      <Label className="font-bold text-slate-700 mb-2">Anexar Documento</Label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={handleFileUpload}
                          disabled={uploadingAtestado}
                          className="h-12 rounded-xl bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer pt-2"
                        />
                        {uploadingAtestado && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      {novaSolicitacao.anexo_url && (
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                          <CheckCircle className="w-3 h-3" /> Arquivo anexado
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-slate-100 pt-6">
                    <Button type="submit" className="h-12 px-8 rounded-xl font-bold">
                      Enviar Solicitação
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-sm rounded-[2rem] border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-bold">Tipo</TableHead>
                    <TableHead className="font-bold">Período</TableHead>
                    <TableHead className="font-bold">Enviado em</TableHead>
                    <TableHead className="font-bold">Anexo</TableHead>
                    <TableHead className="font-bold text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoes.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="capitalize font-medium text-slate-800">
                        {s.tipo}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(s.data_inicio).toLocaleDateString('pt-BR')} até{' '}
                        {new Date(s.data_fim).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(s.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {s.anexo_url ? (
                          <a
                            href={s.anexo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium"
                          >
                            <FileDown className="w-4 h-4" /> Visualizar
                          </a>
                        ) : (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            s.status === 'aprovado'
                              ? 'default'
                              : s.status === 'rejeitado'
                                ? 'destructive'
                                : 'outline'
                          }
                          className={`capitalize px-3 py-1 ${s.status === 'aprovado' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                        >
                          {s.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {solicitacoes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        Nenhuma solicitação enviada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {(role === 'admin' || role === 'superadmin' || role === 'secretaria') && (
            <TabsContent value="equipe" className="space-y-6 mt-6">
              <Card className="shadow-sm border-slate-200 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-indigo-500" /> Gestão Centralizada da
                        Equipe
                      </CardTitle>
                      <CardDescription>
                        Acesse os dados de contratação, conselho, PIS, CPF e detalhes de cada
                        membro.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {equipe.map((e) => (
                      <Dialog key={e.id}>
                        <DialogTrigger asChild>
                          <div className="p-5 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white group flex flex-col h-full">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-lg uppercase group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                {e.nome?.charAt(0) || e.email.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-lg leading-tight line-clamp-1">
                                  {e.nome || 'Usuário'}
                                </p>
                                <p className="text-sm text-slate-500 line-clamp-1">{e.email}</p>
                              </div>
                            </div>
                            <div className="mt-auto space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Perfil:</span>
                                <Badge
                                  variant="outline"
                                  className="uppercase text-[10px] font-bold bg-slate-50"
                                >
                                  {e.role === 'professional' ? 'Profissional' : e.role}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">CPF:</span>
                                <span className="font-mono text-slate-700">
                                  {e.cpf || 'Não informado'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden">
                          <div className="bg-indigo-600 p-6 text-white flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center font-bold text-2xl uppercase">
                              {e.nome?.charAt(0) || e.email.charAt(0)}
                            </div>
                            <div>
                              <DialogTitle className="text-2xl font-bold">
                                {e.nome || 'Usuário Sem Nome'}
                              </DialogTitle>
                              <p className="text-indigo-100 opacity-90">{e.email}</p>
                              <Badge className="mt-2 bg-white/20 hover:bg-white/30 text-white uppercase text-[10px] border-none">
                                {e.role === 'professional' ? 'Profissional' : e.role}
                              </Badge>
                            </div>
                          </div>
                          <ScrollArea className="max-h-[60vh]">
                            <div className="p-6 space-y-6">
                              <div>
                                <h4 className="font-bold text-slate-800 text-base mb-3 border-b border-slate-100 pb-2">
                                  Dados Pessoais e Profissionais
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="block text-slate-500 mb-1">CPF</span>
                                    <span className="font-medium text-slate-800">
                                      {e.cpf || 'Não informado'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-slate-500 mb-1">PIS</span>
                                    <span className="font-medium text-slate-800">
                                      {e.portal_settings?.pis || 'Não informado'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-slate-500 mb-1">
                                      Conselho (CRP/CRM)
                                    </span>
                                    <span className="font-medium text-slate-800">
                                      {e.portal_settings?.conselho || 'Não informado'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-slate-500 mb-1">
                                      Telefone Pessoal
                                    </span>
                                    <span className="font-medium text-slate-800">
                                      {e.portal_settings?.telefone_pessoal || 'Não informado'}
                                    </span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="block text-slate-500 mb-1">
                                      Endereço Pessoal
                                    </span>
                                    <span className="font-medium text-slate-800">
                                      {e.portal_settings?.endereco_pessoal || 'Não informado'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-sm text-slate-600">
                                  <strong>Nota:</strong> Para visualizar os atestados, histórico de
                                  ponto ou aprovar solicitações deste colaborador, a funcionalidade
                                  de "Painel do Colaborador" será expandida em breve. Por hora, você
                                  visualiza os dados cadastrais completos.
                                </p>
                              </div>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    ))}
                    {equipe.length === 0 && (
                      <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">Sua equipe está vazia.</p>
                        <p className="text-slate-400 text-sm mt-1">
                          Convide membros na aba de Configurações para gerenciar o RH.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ProtectedComponent>
  )
}
