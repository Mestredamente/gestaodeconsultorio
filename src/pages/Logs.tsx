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
import { ShieldAlert, Eye } from 'lucide-react'

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

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Logs do Sistema</h1>
          <p className="text-slate-500 mt-1">
            Trilha de auditoria e registros de segurança de dados críticos.
          </p>
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
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
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
          <div className="bg-slate-950 p-4 rounded-md overflow-auto max-h-[60vh] mt-4 shadow-inner">
            <pre className="text-emerald-400 text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(selectedLog?.detalhes, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
