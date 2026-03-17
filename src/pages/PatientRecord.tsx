import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, FileText } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { mockProntuarios } from '@/lib/mock-data'
import { useToast } from '@/hooks/use-toast'

export default function PatientRecord() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: 'Anotação salva com sucesso!',
      description: 'O registro foi adicionado ao prontuário.',
      variant: 'default',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(`/pacientes/${id}`)}
            className="gap-2 -ml-4 text-slate-500 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Detalhes
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Prontuário Médico
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Registro clínico e acompanhamento das sessões
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">
            Nova Anotação de Evolução
          </h3>
          <Textarea
            placeholder="Descreva as observações, intervenções e evolução da sessão de hoje..."
            className="min-h-[150px] bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
          />
          <div className="flex justify-end">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" /> Salvar Evolução
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Histórico de Sessões</h2>
        {mockProntuarios.length === 0 ? (
          <div className="text-center p-8 bg-white border border-dashed rounded-xl text-slate-500">
            Nenhum registro encontrado no prontuário deste paciente.
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="bg-white rounded-xl border shadow-sm px-4"
          >
            {mockProntuarios.map((p) => (
              <AccordionItem key={p.id} value={p.id}>
                <AccordionTrigger className="hover:no-underline font-semibold text-slate-800 py-5">
                  <div className="flex items-center gap-3 text-left">
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-bold">
                      {p.date}
                    </div>
                    <span className="text-slate-600 font-medium hidden sm:inline">
                      Evolução de Sessão
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-lg mb-4 border border-slate-100">
                  {p.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )
}
