import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShieldAlert, Activity } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { ProtectedComponent } from '@/components/ProtectedComponent'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('audit_log')
        .select('*, usuarios(nome, email)')
        .order('timestamp', { ascending: false })
        .limit(100)

      if (data) setLogs(data)
      setLoading(false)

      if (user) {
        supabase.functions.invoke('audit_logger', {
          body: { user_id: user.id, action: 'view', table_name: 'audit_log' },
        })
      }
    }
    fetchLogs()
  }, [user])

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('excluir'))
      return 'bg-red-50 text-red-700 border-red-200'
    if (action.includes('create') || action.includes('invite'))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (action.includes('update')) return 'bg-blue-50 text-blue-700 border-blue-200'
    return 'bg-slate-50 text-slate-700'
  }

  return (
    <ProtectedComponent
      requiredPermission="view_audit_logs"
      fallback={
        <div className="p-8 text-center text-slate-500">
          Acesso negado. Você não tem permissão para visualizar logs de auditoria.
        </div>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-3 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-amber-700" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Logs de Auditoria
            </h1>
            <p className="text-slate-500 mt-1">
              Monitore atividades sensíveis e acessos no sistema.
            </p>
          </div>
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-500" /> Registro de Atividades (Últimos 100)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center p-12 text-slate-500">Nenhum log registrado.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Tabela</TableHead>
                      <TableHead>IP / Dispositivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-slate-50/50">
                        <TableCell className="whitespace-nowrap text-sm text-slate-600">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-slate-800">
                            {log.usuarios?.nome || 'Sistema'}
                          </p>
                          <p className="text-xs text-slate-500">{log.usuarios?.email}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getActionColor(log.action)}>
                            {log.action.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-600">
                          {log.table_name || '-'}
                        </TableCell>
                        <TableCell
                          className="text-xs text-slate-500 max-w-[200px] truncate"
                          title={log.user_agent}
                        >
                          <p className="font-mono bg-slate-100 px-1 py-0.5 rounded inline-block mb-1">
                            {log.ip_address}
                          </p>
                          <p className="truncate">{log.user_agent}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedComponent>
  )
}
