import { useEffect, useState } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Package } from 'lucide-react'

type EstoqueItem = {
  id: string
  nome_item: string
  quantidade: number
  data_atualizacao: string
}

export default function Stock() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [items, setItems] = useState<EstoqueItem[]>([])
  const [loading, setLoading] = useState(true)

  const [newItemName, setNewItemName] = useState('')
  const [newItemQty, setNewItemQty] = useState('')

  useEffect(() => {
    const fetchStock = async () => {
      if (!user) return
      setLoading(true)
      const { data } = await supabase
        .from('estoque')
        .select('*')
        .eq('usuario_id', user.id)
        .order('nome_item')
      if (data) setItems(data)
      setLoading(false)
    }
    fetchStock()
  }, [user])

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
      toast({ title: 'Item adicionado ao estoque' })
    } else {
      toast({ title: 'Erro ao adicionar item', variant: 'destructive' })
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
    await supabase
      .from('estoque')
      .update({ quantidade: newQty, data_atualizacao: new Date().toISOString() })
      .eq('id', id)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <Package className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Controle de Estoque</h1>
          <p className="text-slate-500 mt-1">Gerencie os materiais e suprimentos da sua clínica.</p>
        </div>
      </div>

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
                placeholder="Ex: Papel Toalha, Copos, Testes Psicológicos..."
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
              <TableHead className="font-semibold text-slate-600 w-full">Nome do Item</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Quantidade</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Ações</TableHead>
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
                  <TableCell className="font-medium text-slate-900">{item.nome_item}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQty(item.id, Math.max(0, item.quantidade - 1))}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantidade}</span>
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
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
    </div>
  )
}
