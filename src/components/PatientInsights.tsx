import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BrainCircuit, Lightbulb, AlertTriangle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Insights {
  padroes: string[]
  recomendacoes: string[]
  alertas: string[]
}

export function PatientInsights({
  historico,
  pacienteId,
}: {
  historico: any[]
  pacienteId: string
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [insights, setInsights] = useState<Insights | null>(null)

  const handleGenerateInsights = async () => {
    if (!historico || historico.length === 0) {
      toast({
        title: 'Histórico vazio',
        description: 'Adicione anotações de sessões para gerar insights.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('gerar_insights_paciente', {
        body: { paciente_id: pacienteId, historico },
      })

      if (error) throw error

      if (data && data.insights) {
        setInsights(data.insights)
        toast({ title: 'Insights gerados com sucesso!' })
      } else {
        throw new Error('Formato de resposta inválido')
      }
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro ao gerar insights',
        description: err.message || 'Falha ao comunicar com a IA.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500" /> IA Clínica (Gemini)
          </h3>
          <p className="text-sm text-slate-500">
            Analise o histórico de sessões para identificar padrões e riscos.
          </p>
        </div>
        <Button
          onClick={handleGenerateInsights}
          disabled={loading || historico.length === 0}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <BrainCircuit className="w-4 h-4" />
          )}
          {loading ? 'Analisando...' : 'Gerar Insights'}
        </Button>
      </div>

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up">
          <Card className="border-indigo-100 bg-indigo-50/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-indigo-800 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" /> Padrões Clínicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                {insights.padroes.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
                {insights.padroes.length === 0 && <li>Nenhum padrão detectado.</li>}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                {insights.recomendacoes.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
                {insights.recomendacoes.length === 0 && <li>Nenhuma recomendação específica.</li>}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-rose-100 bg-rose-50/30 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Alertas de Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                {insights.alertas.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
                {insights.alertas.length === 0 && <li>Nenhum risco aparente detectado.</li>}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
