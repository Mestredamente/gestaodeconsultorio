import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Package } from 'lucide-react'

type EstoqueItem = {
  id: string
  nome_item: string
  quantidade: number
}

export default function Stock() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<EstoqueItem[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDays, setFilterDays] = useState('30')

  const [newItemName, setNewItemName] = useState('')
  const [newItemQty, setNewItemQty] = useState('')

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      setLoading(true)
      const { data: stockData } = await supabase
        .from('estoque')
        .select('*')
        .eq('usuario_id', user.id)
        .order('nome_item')
      if (stockData) setItems(stockData)

      const { data: reportsData } = await supabase
        .from('movimentacao_estoque')
        .select('*, estoque(nome_item)')
        .eq('usuario_id', user.id)
        .eq('tipo', 'saida')
      if (reportsData) setReports(reportsData)

      setLoading(false)
    }
    fetchData()
  }, [user])

  const chartData = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - parseInt(filterDays))
    const filtered = reports.filter((r) => new Date(r.data_movimentacao) >= cutoff)

    const dataByItem: Record<string, number> = {}
    filtered.forEach((r) => {
      const name = r.estoque?.nome_item || 'Item Removido'
      if (!dataByItem[name]) dataByItem[name] = 0
      dataByItem[name] += r.quantidade_mudanca
    })

    return Object.entries(dataByItem).map(([name, qtd]) => ({ name, quantidade: qtd }))
  }, [reports, filterDays])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newItemName || !newItemQty) return

    const { data, error } = await supabase
      .from('estoque')
      .insert({
        usuario_id: user.id,
        nome_item: newItemName,
        quantidade: parseInt(newItemQty),
      })
      .select()
      .single()

    if (!error && data) {
      setItems((prev) => [...prev, data].sort((a, b) => a.nome_item.localeCompare(b.nome_item)))
      setNewItemName('')
      setNewItemQty('')
      toast({ title: 'Item adicionado' })
    } else {
      toast({ title: 'Erro ao adicionar', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('estoque').delete().eq('id', id)
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast({ title: 'Item removido' })
    }
  }

  const handleUpdateQty = async (id: string, newQty: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantidade: newQty } : i)))
    await supabase.from('estoque').update({ quantidade: newQty }).eq('id', id)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <Package className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Controle de Estoque</h1>
          <p className="text-slate-500 mt-1">
            Gerencie suprimentos e analise o histórico de consumo.
          </p>
        </div>
      </div>

      <Tabs defaultValue="estoque">
        <TabsList className="mb-4 bg-slate-200/50 p-1 rounded-lg">
          <TabsTrigger
            value="estoque"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Estoque Atual
          </TabsTrigger>
          <TabsTrigger
            value="relatorios"
            className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Relatórios de Consumo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Adicionar Novo Item</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:flex-1 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nome do Item</label>
                  <Input
                    required
                    placeholder="Ex: Copos, Testes Psicológicos..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-32 space-y-2">
                  <label className="text-sm font-medium text-slate-700">Quantidade</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto gap-2">
                  <Plus className="w-4 h-4" /> Adicionar
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-full">Nome do Item</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="animate-spin mx-auto rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                      Nenhum item no estoque.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome_item}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQty(item.id, Math.max(0, item.quantidade - 1))
                            }
                          >
                            -
                          </Button>
                          <span className="w-8 font-semibold">{item.quantidade}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQty(item.id, item.quantidade + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg">Volume de Saídas (Consumo)</CardTitle>
              <Select value={filterDays} onValueChange={setFilterDays}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                  <SelectItem value="180">Últimos 6 meses</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="pt-8 h-[350px]">
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Nenhum consumo registrado neste período.
                </div>
              ) : (
                <ChartContainer
                  config={{ quantidade: { label: 'Saída/Consumo', color: '#3b82f6' } }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="quantidade"
                        fill="var(--color-quantidade)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
