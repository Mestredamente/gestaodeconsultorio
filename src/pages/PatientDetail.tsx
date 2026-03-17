import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Edit3, FileText, DollarSign, Save } from 'lucide-react'
import { mockPatients, mockProntuarios, mockTransactions } from '@/lib/mock-data'
import { useToast } from '@/hooks/use-toast'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const patient = mockPatients.find((p) => p.id === id) || mockPatients[0]

  const handleSave = () => {
    toast({ title: 'Anotação salva com sucesso!', variant: 'default' })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ml-4 text-slate-500">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <div className="bg-primary/5 h-24 w-full"></div>
        <CardContent className="px-6 pb-6 relative pt-0">
          <Avatar className="w-20 h-20 border-4 border-white absolute -top-10 shadow-sm">
            <AvatarImage src={patient.avatar} />
            <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="mt-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {patient.email} • {patient.phone}
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Edit3 className="w-4 h-4" /> Editar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="prontuarios" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg w-full justify-start overflow-x-auto">
          <TabsTrigger value="prontuarios" className="rounded-md data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2" /> Prontuários
          </TabsTrigger>
          <TabsTrigger value="documentos" className="rounded-md data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2" /> Documentos
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="rounded-md data-[state=active]:shadow-sm">
            <DollarSign className="w-4 h-4 mr-2" /> Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prontuarios" className="space-y-4 mt-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm text-slate-700">Nova Anotação</h3>
              <Textarea
                placeholder="Escreva os detalhes da sessão de hoje..."
                className="min-h-[100px] bg-slate-50"
              />
              <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" /> Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
          <Accordion
            type="single"
            collapsible
            className="bg-white rounded-xl border shadow-sm px-4"
          >
            {mockProntuarios.map((p) => (
              <AccordionItem key={p.id} value={p.id}>
                <AccordionTrigger className="hover:no-underline font-medium text-slate-800">
                  Sessão em {p.date}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg mb-4">
                  {p.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="documentos" className="mt-4">
          <Card className="shadow-sm p-12 text-center text-slate-500 border-dashed">
            <p>Nenhum documento anexado ainda.</p>
            <Button variant="link" className="mt-2">
              Fazer upload
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="mt-4">
          <Card className="shadow-sm">
            <div className="divide-y">
              {mockTransactions
                .filter((t) => t.description.includes(patient.name.split(' ')[0]))
                .map((t) => (
                  <div key={t.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-slate-500">{t.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">R$ {t.amount}</p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.status === 'Recebido' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
