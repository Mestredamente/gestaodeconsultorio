import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function PublicConfirmation() {
  const { hash, appointmentId } = useParams()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    const confirmAppointment = async () => {
      if (!hash || !appointmentId) {
        setResult({ success: false, error: 'Link inválido.' })
        setLoading(false)
        return
      }

      const { data, error } = await supabase.rpc('confirm_appointment_portal', {
        p_hash: hash,
        p_agendamento_id: appointmentId,
      })

      if (error) {
        setResult({ success: false, error: 'Erro de comunicação com o servidor.' })
      } else {
        setResult(data)
      }
      setLoading(false)
    }

    confirmAppointment()
  }, [hash, appointmentId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Processando confirmação...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 animate-fade-in-up">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center pb-6 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
          {result?.success ? (
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
          )}
          <CardTitle className="text-2xl font-bold text-slate-900">
            {result?.success ? 'Consulta Confirmada!' : 'Aviso'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Profissional:{' '}
            <strong className="text-slate-800">{result?.consultorio || 'Clínica'}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 text-center space-y-4">
          {result?.success ? (
            <p className="text-slate-600 text-lg">
              Sua presença foi confirmada com sucesso. Nos vemos em breve!
            </p>
          ) : (
            <p className="text-slate-600 text-lg">
              {result?.error ||
                'Não foi possível confirmar esta consulta. Ela pode já ter sido confirmada ou desmarcada.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
