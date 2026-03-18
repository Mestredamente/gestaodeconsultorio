import { useState } from 'react'
import { TemplatesManager } from '@/components/TemplatesManager'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function Marketing() {
  const [activeTab, setActiveTab] = useState('comunicacao')

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Marketing e Comunicação
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Gerencie templates e envio de mensagens</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="comunicacao">Comunicações e Emails</TabsTrigger>
          <TabsTrigger value="testes">Testes Psicológicos</TabsTrigger>
          <TabsTrigger value="juridico">Jurídico e Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="comunicacao">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg">Campanhas e Lembretes</CardTitle>
              <CardDescription>Crie modelos para avisos, novidades e engajamento.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <TemplatesManager
                defaultTipo="email_marketing"
                title="Modelos de Email"
                description="Estes modelos podem ser usados para envio em massa no futuro."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testes">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg">Biblioteca de Testes e Escalas</CardTitle>
              <CardDescription>
                Crie questionários que os pacientes podem responder via Portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <TemplatesManager
                defaultTipo="teste"
                title="Modelos de Avaliação"
                description="Formate suas perguntas como uma lista. Elas aparecerão no portal do paciente."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="juridico">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg">Modelos Legais</CardTitle>
              <CardDescription>
                Gerencie o formato padrão para atestados, laudos e recibos.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <TemplatesManager
                defaultTipo="laudo"
                title="Documentos Clínicos"
                description="Modelos para exportação de PDF ou envio direto."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
