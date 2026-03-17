import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShieldAlert, Eye, FileText, Download } from 'lucide-react'

export default function Logs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<any>(null)

  useEffect(() => {
    if (user) {
      supabase
        .from('logs_auditoria')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false })
        .limit(100)
        .then(({ data }) => {
          if (data) setLogs(data)
          setLoading(false)
        })
    }
  }, [user])

  const handleExportCSV = () => {
    const headers = ['Data', 'Acao', 'Tabela', 'Detalhes']
    const csvData = logs.map((l) =>
      [
        new Date(l.data_criacao).toLocaleString('pt-BR'),
        l.acao,
        l.tabela_afetada,
        `"${JSON.stringify(l.detalhes).replace(/"/g, '""')}"`,
      ].join(';'),
    )
    const blob = new Blob(['\uFEFF' + [headers.join(';'), ...csvData].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'auditoria_logs.csv'
    a.click()
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10 print:hidden">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Logs do Sistema</h1>
            <p className="text-slate-500 mt-1">Trilha de auditoria e registros críticos.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <FileText className="w-4 h-4" /> Exportar PDF
          </Button>
          <Button className="gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" /> Exportar Excel
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Data / Hora</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Tabela</TableHead>
              <TableHead className="text-right">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  Nenhum log encontrado.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-slate-600">
                    {new Date(log.data_criacao).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${log.acao === 'INSERT' ? 'bg-emerald-100 text-emerald-700' : log.acao === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {log.acao}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-700">
                    {log.tabela_afetada}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="text-slate-600 hover:text-primary"
                    >
                      <Eye className="w-4 h-4 mr-2" /> Ver Mudanças
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Modificação</DialogTitle>
          </DialogHeader>
          <div className="bg-slate-950 p-4 rounded-md overflow-auto max-h-[60vh] mt-4">
            <pre className="text-emerald-400 text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(selectedLog?.detalhes, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print View */}
      <style>{`@media print { body * { visibility: hidden; } .print\\:block, .print\\:block * { visibility: visible !important; } }`}</style>
      <div className="hidden print:block absolute inset-0 bg-white p-8 z-[999]">
        <h1 className="text-2xl font-bold mb-6">Relatório de Auditoria</h1>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Data</th>
              <th>Ação</th>
              <th>Tabela</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="py-2">{new Date(l.data_criacao).toLocaleString('pt-BR')}</td>
                <td>{l.acao}</td>
                <td className="font-mono">{l.tabela_afetada}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
