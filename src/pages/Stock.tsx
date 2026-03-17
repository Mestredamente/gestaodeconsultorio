import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Package, Download, FileText, Edit2, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function Stock() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newItemName, setNewItemName] = useState('')
  const [newItemQty, setNewItemQty] = useState('')
  const [newMinQty, setNewMinQty] = useState('0')
  const [editItem, setEditItem] = useState<any>(null)

  useEffect(() => {
    if (user) {
      setLoading(true)
      Promise.all([
        supabase.from('estoque').select('*').eq('usuario_id', user.id).order('nome_item'),
        supabase
          .from('movimentacao_estoque')
          .select('*, estoque(nome_item)')
          .eq('usuario_id', user.id)
          .eq('tipo', 'saida'),
      ]).then(([stock, rep]) => {
        if (stock.data) setItems(stock.data)
        if (rep.data) setReports(rep.data)
        setLoading(false)
      })
    }
  }, [user])

  const chartData = useMemo(() => {
    const dataByItem: Record<string, number> = {}
    reports.forEach((r) => {
      const name = r.estoque?.nome_item || 'Item Removido'
      dataByItem[name] = (dataByItem[name] || 0) + r.quantidade_mudanca
    })
    return Object.entries(dataByItem).map(([name, qtd]) => ({ name, quantidade: qtd }))
  }, [reports])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newItemName || !newItemQty) return
    const { data, error } = await supabase
      .from('estoque')
      .insert({
        usuario_id: user.id,
        nome_item: newItemName,
        quantidade: parseInt(newItemQty),
        quantidade_minima: parseInt(newMinQty || '0'),
      })
      .select()
      .single()
    if (!error && data) {
      setItems((prev) => [...prev, data].sort((a, b) => a.nome_item.localeCompare(b.nome_item)))
      setNewItemName('')
      setNewItemQty('')
      setNewMinQty('0')
      toast({ title: 'Item adicionado' })
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('estoque').delete().eq('id', id)
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleUpdateItem = async () => {
    if (!editItem) return
    const { error } = await supabase
      .from('estoque')
      .update({
        nome_item: editItem.nome_item,
        quantidade: parseInt(editItem.quantidade),
        quantidade_minima: parseInt(editItem.quantidade_minima || '0'),
      })
      .eq('id', editItem.id)

    if (!error) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editItem.id
            ? {
                ...editItem,
                quantidade: parseInt(editItem.quantidade),
                quantidade_minima: parseInt(editItem.quantidade_minima || '0'),
              }
            : i,
        ),
      )
      setEditItem(null)
      toast({ title: 'Item atualizado' })
    }
  }

  const handleExportCSV = () => {
    const headers = ['Item', 'Quantidade', 'Nivel Critico', 'Última Atualização']
    const csvData = items.map((i) =>
      [
        i.nome_item,
        i.quantidade,
        i.quantidade_minima || 0,
        new Date(i.data_atualizacao).toLocaleDateString('pt-BR'),
      ].join(';'),
    )
    const blob = new Blob(['\uFEFF' + [headers.join(';'), ...csvData].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'estoque_relatorio.csv'
    a.click()
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 print:hidden">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Controle de Estoque</h1>
            <p className="text-slate-500">Gerencie suprimentos e alertas.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <FileText className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="estoque">
        <TabsList className="mb-4">
          <TabsTrigger value="estoque">Estoque Atual</TabsTrigger>
          <TabsTrigger value="relatorios">Consumo</TabsTrigger>
        </TabsList>
        <TabsContent value="estoque" className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Nome do Item</label>
                  <Input
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <label className="text-sm font-medium">Qtd</label>
                  <Input
                    type="number"
                    required
                    min="0"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <label className="text-sm font-medium text-slate-500">Qtd Mínima</label>
                  <Input
                    type="number"
                    min="0"
                    value={newMinQty}
                    onChange={(e) => setNewMinQty(e.target.value)}
                  />
                </div>
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qtd Atual / Min</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const isCritical = item.quantidade <= (item.quantidade_minima || 0)
                    return (
                      <TableRow
                        key={item.id}
                        className={isCritical ? 'bg-red-50/50 hover:bg-red-50' : ''}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.nome_item}
                            {isCritical && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="w-3 h-3" /> Alerta
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          <span className={isCritical ? 'text-red-700' : ''}>
                            {item.quantidade}
                          </span>{' '}
                          <span className="text-xs text-slate-400 font-normal">
                            / {item.quantidade_minima || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditItem(item)}
                            className="text-slate-500"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="relatorios">
          <Card className="shadow-sm h-[400px]">
            <CardContent className="pt-6 h-full">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-500">
                  Nenhum consumo registrado.
                </div>
              ) : (
                <ChartContainer
                  config={{ quantidade: { label: 'Saída', color: '#3b82f6' } }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="quantidade"
                        fill="var(--color-quantidade)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Item de Estoque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Item</label>
              <Input
                value={editItem?.nome_item || ''}
                onChange={(e) => setEditItem({ ...editItem, nome_item: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Quantidade Atual</label>
                <Input
                  type="number"
                  value={editItem?.quantidade || 0}
                  onChange={(e) => setEditItem({ ...editItem, quantidade: e.target.value })}
                />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-red-600">Nível Crítico (Alerta)</label>
                <Input
                  type="number"
                  value={editItem?.quantidade_minima || 0}
                  onChange={(e) => setEditItem({ ...editItem, quantidade_minima: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleUpdateItem} className="w-full mt-4 h-11">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
