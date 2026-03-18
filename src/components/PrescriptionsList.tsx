import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, ExternalLink, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import PrescriptionForm from './PrescriptionForm'

export function PrescriptionsList({
  pacienteId,
  clinicInfo,
  patientName,
}: {
  pacienteId: string
  clinicInfo: any
  patientName: string
}) {
  const { toast } = useToast()
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const fetchPrescriptions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('prescricoes')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('data_emissao', { ascending: false })
    if (data) setPrescriptions(data)
    setLoading(false)
  }

  useEffect(() => {
    if (pacienteId) fetchPrescriptions()
  }, [pacienteId])

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('prescricoes').delete().eq('id', id)
    if (!error) {
      toast({ title: 'Documento excluído' })
      fetchPrescriptions()
    }
  }

  if (isCreating) {
    return (
      <PrescriptionForm
        pacienteId={pacienteId}
        onCancel={() => setIsCreating(false)}
        onSuccess={() => {
          setIsCreating(false)
          fetchPrescriptions()
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800">Laudos e Prescrições</h3>
          <p className="text-sm text-slate-500">
            Documentos assinados digitalmente e rastreáveis via Portal do Paciente.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Documento
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : prescriptions.length === 0 ? (
        <Card className="border-dashed shadow-none bg-transparent">
          <CardContent className="p-10 text-center text-slate-500">
            Nenhum documento emitido para este paciente.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {prescriptions.map((doc) => (
            <Card key={doc.id} className="shadow-sm border-slate-200">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {doc.conteudo_json && doc.conteudo_json[0]?.tipo === 'laudo'
                        ? 'Laudo / Relatório'
                        : 'Prescrição Médica'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Emitido em {new Date(doc.data_emissao).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      window.open(
                        `${window.location.origin}/validar-prescricao/${doc.hash_verificacao}`,
                        '_blank',
                      )
                    }
                  >
                    <ExternalLink className="w-3 h-3" /> Ver
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
