import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle, FileText, Printer } from 'lucide-react'

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
    <div className="min-h-screen flex py-10 justify-center bg-slate-50 p-4 animate-fade-in print:bg-white print:p-0 print:py-0 print:m-0">
      <Card className="w-full max-w-3xl shadow-xl border-emerald-200 border h-fit print:shadow-none print:border-none print:w-full">
        {/* Print & Branded Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white print:flex">
          <div className="flex items-center gap-4">
            {data.logo_url ? (
              <img src={data.logo_url} alt="Logo da Clínica" className="h-16 w-16 object-contain" />
            ) : (
              <div className="h-16 w-16 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 font-bold text-xl">
                {data.medico_nome?.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="font-bold text-xl text-slate-900">{data.medico_nome}</h1>
              {data.endereco_consultorio && (
                <p className="text-sm text-slate-500">{data.endereco_consultorio}</p>
              )}
              {data.telefone_consultorio && (
                <p className="text-sm text-slate-500">{data.telefone_consultorio}</p>
              )}
            </div>
          </div>
          <Button variant="outline" className="print:hidden gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Imprimir Documento
          </Button>
        </div>

        <CardHeader className="text-center pb-6 border-b border-emerald-100 bg-emerald-50/50 rounded-none print:bg-transparent print:border-none print:pt-10">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ring-4 ring-white print:hidden">
            <CheckCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-900 tracking-tight print:text-slate-900">
            {data.conteudo && data.conteudo[0]?.tipo === 'laudo'
              ? 'Laudo / Atestado'
              : 'Prescrição Médica'}
          </CardTitle>
          <CardDescription className="text-base mt-2 text-slate-600 print:hidden">
            Documento emitido e assinado digitalmente de forma autêntica.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 space-y-8 print:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300 print:rounded-none">
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
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-emerald-600 print:text-slate-800" /> Descrição
            </h3>
            <div className="space-y-5 pl-2">
              {data.conteudo.map((item: any, i: number) => (
                <div
                  key={i}
                  className="relative pl-5 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-400 before:rounded-full print:before:bg-slate-400"
                >
                  <p className="font-bold text-slate-900 text-lg">{item.nome}</p>
                  {item.instrucoes && (
                    <p className="text-base text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">
                      {item.instrucoes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-slate-200 text-center">
            <div className="w-64 border-b border-slate-400 mx-auto mb-2"></div>
            <p className="font-bold text-slate-800">{data.medico_nome}</p>
            <p className="text-sm text-slate-500">Assinatura Digital - Validado por Clínica.io</p>
            <p className="text-xs text-slate-400 mt-4 break-all">Hash: {hash}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
