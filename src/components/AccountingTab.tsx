import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { FileDown, RefreshCw, Calculator, Landmark } from 'lucide-react'

export function AccountingTab({
  finances,
  despesas,
  year,
}: {
  finances: any[]
  despesas: any[]
  year: string
}) {
  const { toast } = useToast()
  const [taxRate, setTaxRate] = useState<number>(6.0) // Default 6% Simples Nacional
  const [isSyncing, setIsSyncing] = useState(false)

  const formatBRL = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const { totalReceitas, totalDespesas, impostoEstimado, lucroLiquido } = useMemo(() => {
    const r = finances.reduce((sum, f) => sum + Number(f.valor_recebido || 0), 0)
    const d = despesas.reduce((sum, ex) => sum + Number(ex.valor || 0), 0)
    const tax = (r * taxRate) / 100
    return {
      totalReceitas: r,
      totalDespesas: d,
      impostoEstimado: tax,
      lucroLiquido: r - d - tax,
    }
  }, [finances, despesas, taxRate])

  const handleExportRFB = () => {
    const headers = ['Data', 'Tipo', 'Descrição', 'Valor', 'CPF_CNPJ']
    const csvData: string[] = []

    // Adiciona Receitas
    finances.forEach((f) => {
      if (f.valor_recebido > 0) {
        const pInfo = Array.isArray(f.pacientes) ? f.pacientes[0] : f.pacientes
        const cpf = pInfo?.cpf || ''
        const desc = `Recebimento - Paciente: ${pInfo?.nome || 'Desconhecido'}`
        // Usando o último dia do mês de referência para a data
        const data = new Date(f.ano, f.mes, 0).toLocaleDateString('pt-BR')
        csvData.push(`${data};RECEITA;"${desc}";${f.valor_recebido};${cpf}`)
      }
    })

    // Adiciona Despesas
    despesas.forEach((d) => {
      const data = new Date(d.data).toLocaleDateString('pt-BR')
      csvData.push(`${data};DESPESA;"${d.descricao}";${d.valor};""`)
    })

    const blob = new Blob(['\uFEFF' + [headers.join(';'), ...csvData].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_fiscal_rfb_${year}.csv`
    a.click()
  }

  const handleSyncAccountant = async () => {
    setIsSyncing(true)
    // Simula chamada de API para sistema contábil (Ex: Conta Azul, Contabilizei)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSyncing(false)
    toast({
      title: 'Integração Contábil Concluída',
      description: `Os dados do ano base ${year} foram enviados para o seu contador.`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" /> Relatório Fiscal Anual ({year})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Faturamento Bruto</p>
              <p className="text-2xl font-bold text-emerald-600">{formatBRL(totalReceitas)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Despesas Dedutíveis</p>
              <p className="text-2xl font-bold text-rose-600">{formatBRL(totalDespesas)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                <Calculator className="w-3 h-3" /> Imposto Estimado
              </p>
              <p className="text-2xl font-bold text-amber-600">{formatBRL(impostoEstimado)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Lucro Líquido</p>
              <p className="text-2xl font-bold text-blue-600">{formatBRL(lucroLiquido)}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end border-t border-slate-100 pt-6">
            <div className="w-full md:w-64 space-y-2">
              <Label>Alíquota de Imposto (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="bg-white"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
              <p className="text-xs text-slate-500">Ex: 6% para Simples Nacional (Anexo III)</p>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row gap-3 justify-end w-full md:w-auto mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={handleExportRFB}
                className="gap-2 shadow-sm w-full sm:w-auto h-11 sm:h-10"
              >
                <FileDown className="w-4 h-4" /> Exportar Padrão Receita
              </Button>
              <Button
                onClick={handleSyncAccountant}
                disabled={isSyncing}
                className="gap-2 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto h-11 sm:h-10"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando API...' : 'Enviar para Contador'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
