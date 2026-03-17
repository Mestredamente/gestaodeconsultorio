import { useEffect, useState, useMemo } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, FileBarChart } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

const months = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

interface ReportRow {
  patientId: string
  patientName: string
  totalSessions: number
  faltas: number
  desmarcacoes: number
  valorRecebido: number
  valorAReceber: number
  attendanceRate: number
}

const formatBRL = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

export default function Reports() {
  const { user } = useAuth()
  const currentDate = new Date()
  const [month, setMonth] = useState<string>(String(currentDate.getMonth() + 1))
  const [year, setYear] = useState<string>(String(currentDate.getFullYear()))
  const [data, setData] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)

  const years = useMemo(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => current - 2 + i)
  }, [])

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user) return
      setLoading(true)

      const yearNum = parseInt(year)
      const monthNum = parseInt(month)

      // Start and end dates for appointments in the selected month
      const startDate = new Date(yearNum, monthNum - 1, 1).toISOString()
      const endDate = new Date(yearNum, monthNum, 1).toISOString()

      try {
        const [patientsRes, appointmentsRes, financeRes] = await Promise.all([
          supabase.from('pacientes').select('id, nome').eq('usuario_id', user.id),
          supabase
            .from('agendamentos')
            .select('paciente_id, status')
            .eq('usuario_id', user.id)
            .gte('data_hora', startDate)
            .lt('data_hora', endDate),
          supabase
            .from('financeiro')
            .select('paciente_id, valor_recebido, valor_a_receber')
            .eq('usuario_id', user.id)
            .eq('mes', monthNum)
            .eq('ano', yearNum),
        ])

        if (patientsRes.data) {
          const reportData: ReportRow[] = patientsRes.data.map((p) => {
            const patientApps = appointmentsRes.data?.filter((a) => a.paciente_id === p.id) || []
            const totalSessions = patientApps.length
            const faltas = patientApps.filter((a) => a.status === 'faltou').length
            const desmarcacoes = patientApps.filter((a) => a.status === 'desmarcou').length
            const compareceu = patientApps.filter((a) => a.status === 'compareceu').length

            const fin = financeRes.data?.find((f) => f.paciente_id === p.id)
            const valorRecebido = Number(fin?.valor_recebido || 0)
            const valorAReceber = Number(fin?.valor_a_receber || 0)

            const attendanceBase = compareceu + faltas
            const attendanceRate = attendanceBase > 0 ? (compareceu / attendanceBase) * 100 : 0

            return {
              patientId: p.id,
              patientName: p.nome,
              totalSessions,
              faltas,
              desmarcacoes,
              valorRecebido,
              valorAReceber,
              attendanceRate,
            }
          })

          // Filter out patients with no activity or financial pending for the selected period
          const activeRows = reportData.filter(
            (r) => r.totalSessions > 0 || r.valorRecebido > 0 || r.valorAReceber > 0,
          )

          setData(activeRows.sort((a, b) => a.patientName.localeCompare(b.patientName)))
        }
      } catch (error) {
        console.error('Error fetching report data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [user, month, year])

  const handleExportCSV = () => {
    const headers = [
      'Paciente',
      'Total de Sessões (mês)',
      'Faltas',
      'Desmarcações',
      'Valor Recebido',
      'Valor a Receber',
      'Taxa de Comparecimento (%)',
    ]

    const csvData = data.map((row) => {
      return [
        `"${row.patientName}"`,
        row.totalSessions,
        row.faltas,
        row.desmarcacoes,
        row.valorRecebido.toFixed(2).replace('.', ','),
        row.valorAReceber.toFixed(2).replace('.', ','),
        row.attendanceRate.toFixed(1).replace('.', ','),
      ].join(';')
    })

    // \uFEFF is the BOM to force Excel to read UTF-8 properly
    const csvContent = '\uFEFF' + [headers.join(';'), ...csvData].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    const monthLabel = months.find((m) => m.value === month)?.label
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_${monthLabel?.toLowerCase()}_${year}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-primary" /> Relatórios
          </h1>
          <p className="text-slate-500 mt-1">
            Acompanhe métricas e exporte dados para contabilidade
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={data.length === 0 || loading} className="gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
          <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Filtros do Período
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 max-w-md">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Mês</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Ano</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm overflow-hidden border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Paciente</TableHead>
              <TableHead className="text-center font-semibold text-slate-600">Sessões</TableHead>
              <TableHead className="text-center font-semibold text-slate-600">Faltas</TableHead>
              <TableHead className="text-center font-semibold text-slate-600">Desmarc.</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Recebido</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">A Receber</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Taxa Comp.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-12">
                  Nenhum dado encontrado para o período selecionado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.patientId} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{row.patientName}</TableCell>
                  <TableCell className="text-center text-slate-600">{row.totalSessions}</TableCell>
                  <TableCell className="text-center text-red-600 font-medium">
                    {row.faltas}
                  </TableCell>
                  <TableCell className="text-center text-amber-600 font-medium">
                    {row.desmarcacoes}
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">
                    {formatBRL(row.valorRecebido)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-amber-600">
                    {formatBRL(row.valorAReceber)}
                  </TableCell>
                  <TableCell className="text-right text-slate-600">
                    {row.attendanceRate.toFixed(1)}%
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
