import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Download, FileText, Package, DollarSign, ArrowDownCircle } from 'lucide-react'
import { formatBRL } from '@/lib/utils'

export function ConsumptionExpensesTab({
  month,
  year,
  clinicName,
}: {
  month: string
  year: string
  clinicName: string
}) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<any[]>([])
  const [consumption, setConsumption] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const m = parseInt(month)
    const y = parseInt(year)
    const startDate = new Date(y, m - 1, 1).toISOString()
    const endDate = new Date(y, m, 1).toISOString()

    Promise.all([
      supabase
        .from('despesas')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('data', startDate)
        .lt('data', endDate)
        .order('data', { ascending: false }),
      supabase
        .from('movimentacao_estoque')
        .select('*, estoque(nome_item)')
        .eq('usuario_id', user.id)
        .eq('tipo', 'saida')
        .gte('data_movimentacao', startDate)
        .lt('data_movimentacao', endDate)
        .order('data_movimentacao', { ascending: false }),
    ]).then(([exp, cons]) => {
      setExpenses(exp.data || [])
      setConsumption(cons.data || [])
      setLoading(false)
    })
  }, [user, month, year])

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.valor), 0)
  const totalConsumed = consumption.reduce((sum, c) => sum + Number(c.quantidade_mudanca), 0)

  const topItems = Object.entries(
    consumption.reduce(
      (acc, c) => {
        const name = c.estoque?.nome_item || 'Item Removido'
        acc[name] = (acc[name] || 0) + Number(c.quantidade_mudanca)
        return acc
      },
      {} as Record<string, number>,
    ),
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const handleExportCSV = () => {
    const lines = [
      'Relatório de Consumo e Despesas',
      `Clínica: ${clinicName}`,
      `Período: ${month}/${year}`,
      '',
      'TIPO;DATA;DESCRICAO/ITEM;VALOR/QUANTIDADE',
    ]

    expenses.forEach((e) => {
      const valDespesaStr = Number(e.valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      lines.push(
        `Despesa;${new Date(e.data).toLocaleDateString('pt-BR')};${e.descricao};R$ ${valDespesaStr}`,
      )
    })

    consumption.forEach((c) => {
      lines.push(
        `Consumo;${new Date(c.data_movimentacao).toLocaleDateString('pt-BR')};${c.estoque?.nome_item || 'Item Excluído'};${c.quantidade_mudanca}`,
      )
    })

    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_consumo_${month}_${year}.csv`
    a.click()
  }

  const handleExportPDF = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <style media="print">{`
        body * { visibility: hidden; }
        #print-consumo, #print-consumo * { visibility: visible; }
        #print-consumo { display: block !important; position: absolute; left: 0; top: 0; width: 100%; background: white; margin: 0; padding: 20px; }
        @page { size: auto; margin: 20mm; }
      `}</style>
      <div className="space-y-6 animate-fade-in-up print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">Resumo do Período</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="gap-2 shadow-sm w-full sm:w-auto h-11 sm:h-10"
            >
              <FileText className="w-4 h-4" /> Exportar PDF
            </Button>
            <Button
              onClick={handleExportCSV}
              className="gap-2 shadow-sm w-full sm:w-auto h-11 sm:h-10"
            >
              <Download className="w-4 h-4" /> Exportar Excel
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-sm border-rose-200 bg-rose-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-rose-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Total de Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-800 break-words">
                {formatBRL(totalExpenses)}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-indigo-200 bg-indigo-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
                <Package className="w-4 h-4" /> Itens Consumidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-800 break-words">
                {totalConsumed} unid.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4 text-rose-500" /> Despesas Lançadas
              </CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-slate-500">
                      Nenhuma despesa registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-slate-600 whitespace-nowrap">
                        {new Date(e.data).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">{e.descricao}</TableCell>
                      <TableCell className="text-right font-semibold text-rose-600 whitespace-nowrap">
                        {formatBRL(e.valor)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          <Card className="shadow-sm border-slate-200 overflow-hidden h-fit">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-500" /> Top Itens Consumidos
              </CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantidade (Saída)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-slate-500">
                      Nenhum consumo registrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  topItems.map(([name, qtd], i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-slate-800">{name}</TableCell>
                      <TableCell className="text-right font-semibold text-indigo-600 whitespace-nowrap">
                        {qtd} unid.
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      <div id="print-consumo" className="hidden print:block font-sans text-black">
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider">{clinicName}</h1>
          <p className="text-lg font-medium text-slate-600">
            Relatório de Consumo e Despesas - {month}/{year}
          </p>
        </div>

        <div className="flex gap-8 mb-8">
          <div className="p-4 bg-slate-100 rounded-lg flex-1 border border-slate-300">
            <p className="text-sm text-slate-600 uppercase font-bold">Total de Despesas</p>
            <p className="text-2xl font-bold mt-1">{formatBRL(totalExpenses)}</p>
          </div>
          <div className="p-4 bg-slate-100 rounded-lg flex-1 border border-slate-300">
            <p className="text-sm text-slate-600 uppercase font-bold">Total de Itens Consumidos</p>
            <p className="text-2xl font-bold mt-1">{totalConsumed} unid.</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold border-b border-slate-300 mb-3 pb-1 uppercase">
            Detalhamento de Despesas
          </h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="py-2 px-2">Data</th>
                <th className="py-2 px-2">Descrição</th>
                <th className="py-2 px-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-slate-200">
                  <td className="py-2 px-2">{new Date(e.data).toLocaleDateString('pt-BR')}</td>
                  <td className="py-2 px-2">{e.descricao}</td>
                  <td className="py-2 px-2 text-right">{formatBRL(e.valor)}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center italic text-slate-500">
                    Nenhuma despesa no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-lg font-bold border-b border-slate-300 mb-3 pb-1 uppercase">
            Movimentação de Estoque (Saídas)
          </h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300">
                <th className="py-2 px-2">Data</th>
                <th className="py-2 px-2">Item</th>
                <th className="py-2 px-2 text-right">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {consumption.map((c) => (
                <tr key={c.id} className="border-b border-slate-200">
                  <td className="py-2 px-2">
                    {new Date(c.data_movimentacao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-2 px-2">{c.estoque?.nome_item || 'Item Removido'}</td>
                  <td className="py-2 px-2 text-right">{c.quantidade_mudanca} unid.</td>
                </tr>
              ))}
              {consumption.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center italic text-slate-500">
                    Nenhuma consumo no período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
