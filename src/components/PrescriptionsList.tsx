import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, Plus, Printer, Trash2, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export function PrescriptionsList({ pacienteId, clinicInfo, patientName }: any) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [printData, setPrintData] = useState<any>(null)

  const [items, setItems] = useState([{ nome: '', instrucoes: '' }])

  const fetchPrescriptions = async () => {
    const { data } = await supabase
      .from('prescricoes')
      .select('*')
      .eq('paciente_id', pacienteId)
      .order('data_emissao', { ascending: false })
    if (data) setPrescriptions(data)
  }

  useEffect(() => {
    fetchPrescriptions()
  }, [pacienteId])

  const handleSave = async () => {
    const validItems = items.filter((i) => i.nome.trim())
    if (!validItems.length) {
      toast({ title: 'Adicione ao menos um item', variant: 'destructive' })
      return
    }
    await supabase.from('prescricoes').insert({
      usuario_id: user?.id,
      paciente_id: pacienteId,
      conteudo_json: validItems,
    })
    setOpen(false)
    setItems([{ nome: '', instrucoes: '' }])
    fetchPrescriptions()
    toast({ title: 'Prescrição emitida com sucesso!' })
  }

  const handleDelete = async (id: string) => {
    await supabase.from('prescricoes').delete().eq('id', id)
    fetchPrescriptions()
    toast({ title: 'Prescrição removida' })
  }

  const handlePrint = (p: any) => {
    setPrintData(p)
    setTimeout(() => window.print(), 300)
  }

  return (
    <div className="space-y-6 animate-fade-in print:hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
        <div>
          <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Prescrições e Pedidos Digitais
          </h3>
          <p className="text-sm text-emerald-700 mt-1">
            Crie receitas com validação por QR Code nativa.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4" /> Nova Prescrição
        </Button>
      </div>

      {prescriptions.length === 0 ? (
        <div className="text-center p-10 border border-dashed border-slate-300 rounded-xl bg-white shadow-sm">
          <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhuma prescrição digital emitida.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((p) => (
            <Card
              key={p.id}
              className="shadow-sm border-slate-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      Emissão: {new Date(p.data_emissao).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">
                      {p.conteudo_json.length} item(s) prescrito(s)
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="gap-2 flex-1 sm:flex-none text-slate-700"
                    onClick={() => handlePrint(p)}
                  >
                    <Printer className="w-4 h-4" /> Imprimir PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Emitir Prescrição</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-3 items-start bg-slate-50 p-4 rounded-lg border border-slate-200 relative group"
              >
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider">
                      Medicamento ou Exame
                    </Label>
                    <Input
                      placeholder="Ex: Amoxicilina 500mg"
                      className="bg-white font-medium"
                      value={item.nome}
                      onChange={(e) => {
                        const n = [...items]
                        n[idx].nome = e.target.value
                        setItems(n)
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-500 uppercase tracking-wider">
                      Instruções de Uso (Opcional)
                    </Label>
                    <Input
                      placeholder="Ex: Tomar 1 comprimido de 8 em 8 horas..."
                      className="bg-white"
                      value={item.instrucoes}
                      onChange={(e) => {
                        const n = [...items]
                        n[idx].instrucoes = e.target.value
                        setItems(n)
                      }}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-primary"
              onClick={() => setItems([...items, { nome: '', instrucoes: '' }])}
            >
              <Plus className="w-4 h-4 mr-2" /> Adicionar Item
            </Button>
            <Button
              className="w-full h-12 text-base shadow-sm mt-4 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSave}
            >
              Assinar e Emitir Documento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print View Layer */}
      {printData && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-16 font-sans text-black overflow-hidden">
          <div className="border-b-2 border-slate-800 pb-8 mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900">
                {clinicInfo?.nome_consultorio || 'Consultório Clínico'}
              </h1>
              <p className="text-lg text-slate-600 font-medium mt-1">Receituário Digital</p>
            </div>
            <ShieldCheck className="w-12 h-12 text-slate-300" />
          </div>

          <div className="mb-12 flex justify-between items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Paciente</p>
              <p className="text-2xl font-bold text-slate-900">{patientName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Data de Emissão
              </p>
              <p className="text-xl font-bold text-slate-900">
                {new Date(printData.data_emissao).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="space-y-8 min-h-[500px]">
            {printData.conteudo_json.map((item: any, i: number) => (
              <div key={i} className="pl-6 border-l-4 border-slate-300">
                <p className="text-2xl font-bold text-slate-900 leading-tight">{item.nome}</p>
                {item.instrucoes && (
                  <p className="text-xl text-slate-700 mt-2 leading-relaxed">
                    <strong>Uso:</strong> {item.instrucoes}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="absolute bottom-16 left-16 right-16 pt-8 border-t-2 border-slate-300 flex justify-between items-end">
            <div className="text-center">
              <p className="font-bold text-xl uppercase text-slate-900">
                {clinicInfo?.nome_consultorio}
              </p>
              <p className="text-base text-slate-500 mt-1">Assinatura Eletrônica</p>
            </div>
            <div className="text-center flex flex-col items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/validar-prescricao/' + printData.hash_verificacao)}`}
                alt="QR Code"
                className="w-28 h-28 mb-3 shadow-sm border border-slate-200 p-1 rounded-md"
              />
              <p className="text-xs font-bold text-slate-500 max-w-[180px] uppercase">
                Escaneie para validar a autenticidade
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
