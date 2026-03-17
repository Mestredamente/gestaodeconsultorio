import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { FileText, CheckCircle } from 'lucide-react'

export default function PublicAnamnesis() {
  const { hash } = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [data, setData] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      if (!hash) return
      const { data: res, error } = await supabase.rpc('get_anamnese_data', { p_hash: hash })
      if (!error && res && Object.keys(res).length > 0) {
        setData(res)
        if (res.anamnese) setAnswers(res.anamnese)
      }
      setLoading(false)
    }
    fetchData()
  }, [hash])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.rpc('update_anamnese', { p_hash: hash, p_anamnese: answers })
    setSaving(false)
    if (!error) {
      setSuccess(true)
      toast({ title: 'Formulário enviado com sucesso!' })
    } else {
      toast({ title: 'Erro ao enviar', description: error.message, variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        Link inválido ou expirado.
      </div>
    )

  return (
    <div className="min-h-screen flex py-10 justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-slate-200 h-fit animate-fade-in-up">
        {success ? (
          <CardContent className="pt-10 pb-10 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <CardTitle className="text-2xl font-bold text-slate-900">Obrigado!</CardTitle>
            <p className="text-slate-500">
              Seu formulário de pré-consulta foi recebido pelo profissional.
            </p>
          </CardContent>
        ) : (
          <>
            <CardHeader className="text-center pb-6 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                Anamnese Pré-Consulta
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Profissional: <strong className="text-slate-800">{data.consultorio}</strong>
                <br />
                Paciente: <strong className="text-slate-800">{data.paciente_nome}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {!data.template || data.template.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  Nenhum questionário configurado.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {data.template.map((q: any) => (
                    <div key={q.id} className="space-y-2">
                      <Label htmlFor={q.id} className="text-base font-semibold text-slate-800">
                        {q.label}
                      </Label>
                      {q.type === 'textarea' ? (
                        <Textarea
                          id={q.id}
                          className="bg-slate-50 min-h-[100px]"
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        />
                      ) : (
                        <Input
                          id={q.id}
                          className="bg-slate-50"
                          value={answers[q.id] || ''}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                  <Button type="submit" className="w-full h-12 text-base mt-4" disabled={saving}>
                    {saving ? 'Enviando...' : 'Enviar Formulário'}
                  </Button>
                </form>
              )}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}
