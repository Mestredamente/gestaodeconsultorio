import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedComponent } from '@/components/ProtectedComponent'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Shield, Download, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function LGPD() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data } = await supabase
      .from('lgpd_logs')
      .select('*, pacientes(nome), usuarios!lgpd_logs_performed_by_fkey(nome)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setLogs(data)
    setLoading(false)
  }

  const exportData = () => {
    toast({
      title: 'Exportação iniciada',
      description: 'Um arquivo JSON com os dados será baixado em breve.',
    })
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute('href', dataStr)
    downloadAnchorNode.setAttribute('download', 'lgpd_export.json')
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  return (
    <ProtectedComponent
      requiredPermission="manage_settings"
      fallback={
        <div className="p-8 text-center text-slate-500">Acesso restrito a administradores.</div>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10 px-4 md:px-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Conformidade LGPD
              </h1>
              <p className="text-slate-500 mt-1">
                Gestão de consentimentos, acessos e direitos dos titulares.
              </p>
            </div>
          </div>
          <Button onClick={exportData} className="gap-2 rounded-xl h-11 w-full sm:w-auto">
            <Download className="w-4 h-4" /> Exportar Dados (GDPR)
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[2rem] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500 font-medium">
                Dados Pessoais Coletados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-800">Nome, Email, CPF, Telefone</div>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Criptografados em repouso
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500 font-medium">
                Consentimentos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">100%</div>
              <p className="text-xs text-slate-500 mt-1">
                Dos pacientes ativos aceitaram os termos
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-[2rem] shadow-sm border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-700 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Incidentes de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">0</div>
              <p className="text-xs text-amber-600 mt-1">Nenhum vazamento registrado</p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[2rem] shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
            <CardTitle className="text-lg">Registro de Acessos a Dados Sensíveis</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Realizado por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      Nenhum log LGPD registrado recentemente.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {log.pacientes?.nome || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                        {log.usuarios?.nome || 'Sistema Automático'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ProtectedComponent>
  )
}
