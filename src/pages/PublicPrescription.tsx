import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, FileText } from 'lucide-react'

export default function PublicPrescription() {
  const { hash } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!hash) return
      const { data: res, error } = await supabase.rpc('get_prescricao_publica', { p_hash: hash })
      if (!error && res && Object.keys(res).length > 0) setData(res)
      setLoading(false)
    }
    fetchData()
  }, [hash])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!data || !data.paciente_nome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full p-8 text-center text-slate-500 shadow-sm border border-slate-200">
          <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Documento Inválido</h2>
          <p>
            Não foi possível validar esta prescrição. O link pode estar incorreto ou o documento foi
            revogado.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex py-10 justify-center bg-slate-50 p-4 animate-fade-in">
      <Card className="w-full max-w-2xl shadow-xl border-emerald-200 border h-fit">
        <CardHeader className="text-center pb-6 border-b border-emerald-100 bg-emerald-50/50 rounded-t-lg">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ring-4 ring-white">
            <CheckCircle className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-900 tracking-tight">
            Prescrição Verificada
          </CardTitle>
          <CardDescription className="text-base mt-2 text-slate-600">
            Este documento foi emitido e assinado digitalmente de forma autêntica.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Paciente
              </p>
              <p className="font-semibold text-slate-900 text-lg">{data.paciente_nome}</p>
              {data.paciente_cpf && (
                <p className="text-sm text-slate-500 mt-0.5">CPF: {data.paciente_cpf}</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Data de Emissão
              </p>
              <p className="font-semibold text-slate-900 text-lg">
                {new Date(data.data_emissao).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                {new Date(data.data_emissao).toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <div className="col-span-1 sm:col-span-2 pt-3 border-t border-slate-100 mt-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Profissional / Clínica
              </p>
              <p className="font-semibold text-slate-900 text-lg">{data.medico_nome}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-emerald-600" /> Pedidos e Medicamentos
            </h3>
            <div className="space-y-5 pl-2">
              {data.conteudo.map((item: any, i: number) => (
                <div
                  key={i}
                  className="relative pl-5 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-400 before:rounded-full"
                >
                  <p className="font-bold text-slate-900 text-lg">{item.nome}</p>
                  {item.instrucoes && (
                    <p className="text-base text-slate-600 mt-1 leading-relaxed">
                      {item.instrucoes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
