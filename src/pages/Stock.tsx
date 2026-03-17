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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Package, Download, FileText } from 'lucide-react'

export default function Stock() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newItemName, setNewItemName] = useState('')
  const [newItemQty, setNewItemQty] = useState('')

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
      .insert({ usuario_id: user.id, nome_item: newItemName, quantidade: parseInt(newItemQty) })
      .select()
      .single()
    if (!error && data) {
      setItems((prev) => [...prev, data].sort((a, b) => a.nome_item.localeCompare(b.nome_item)))
      setNewItemName('')
      setNewItemQty('')
      toast({ title: 'Item adicionado' })
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('estoque').delete().eq('id', id)
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const handleExportCSV = () => {
    const headers = ['Item', 'Quantidade', 'Última Atualização']
    const csvData = items.map((i) =>
      [i.nome_item, i.quantidade, new Date(i.data_atualizacao).toLocaleDateString('pt-BR')].join(
        ';',
      ),
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
            <p className="text-slate-500">Gerencie suprimentos do consultório.</p>
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
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
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
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome_item}</TableCell>
                      <TableCell className="text-center font-bold">{item.quantidade}</TableCell>
                      <TableCell className="text-right">
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
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="relatorios">
          <Card className="shadow-sm h-[400px]">
            <CardContent className="pt-6 h-full">
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center">Nenhum consumo.</div>
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

      {/* Print View */}
      <style>{`@media print { body * { visibility: hidden; } .print\\:block, .print\\:block * { visibility: visible !important; } }`}</style>
      <div className="hidden print:block absolute inset-0 bg-white p-8 z-[999]">
        <h1 className="text-2xl font-bold mb-6">Relatório de Estoque</h1>
        <table className="w-full text-sm text-left border-collapse border border-slate-200">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="py-2 px-4">Item</th>
              <th className="px-4">Quantidade Atual</th>
              <th className="px-4">Atualizado em</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="py-2 px-4 font-medium">{i.nome_item}</td>
                <td className="px-4">{i.quantidade}</td>
                <td className="px-4">{new Date(i.data_atualizacao).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
