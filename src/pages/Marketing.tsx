import { useState } from 'react'
import { TemplatesManager } from '@/components/TemplatesManager'
import { SelfCareNewsletter } from '@/components/SelfCareNewsletter'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Megaphone } from 'lucide-react'

export default function Marketing() {
  const [activeTab, setActiveTab] = useState('comunicacao')

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Marketing e Comunicação
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Gerencie templates e envio de mensagens</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto bg-slate-100/50 p-1 rounded-lg">
          <TabsTrigger value="comunicacao" className="py-2">
            Comunicações e Emails
          </TabsTrigger>
          <TabsTrigger value="newsletter" className="py-2">
            Newsletter Autocuidado
          </TabsTrigger>
          <TabsTrigger value="juridico" className="py-2">
            Jurídico e Contratos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comunicacao" className="animate-fade-in-up">
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

        <TabsContent value="newsletter" className="animate-fade-in-up">
          <SelfCareNewsletter />
        </TabsContent>

        <TabsContent value="juridico" className="animate-fade-in-up">
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
