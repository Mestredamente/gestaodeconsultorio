import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SaasKpis from '@/components/admin/SaasKpis'
import SaasSubscribersTable from '@/components/admin/SaasSubscribersTable'
import SaasBetaTesters from '@/components/admin/SaasBetaTesters'
import { ShieldAlert } from 'lucide-react'
import { ProtectedComponent } from '@/components/ProtectedComponent'

export default function AdminSaasDashboard() {
  return (
    <ProtectedComponent
      requiredPermission="manage_clinics"
      fallback={
        <div className="p-8 text-center text-slate-500">
          Acesso negado. Área restrita a administradores.
        </div>
      }
    >
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Painel de Administração Global (SaaS)
          </h1>
          <p className="text-slate-500 mt-1">
            Gerencie assinaturas, financeiro global, métricas de crescimento e acessos das clínicas.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6 mt-8">
          <TabsList className="bg-slate-100/50 p-1 rounded-xl h-auto">
            <TabsTrigger value="overview" className="rounded-lg py-2">
              Visão Geral e KPIs
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="rounded-lg py-2">
              Gestão de Clínicas
            </TabsTrigger>
            <TabsTrigger value="beta" className="rounded-lg py-2">
              Beta Testers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 outline-none">
            <SaasKpis />
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-6 outline-none">
            <SaasSubscribersTable />
          </TabsContent>

          <TabsContent value="beta" className="space-y-6 outline-none">
            <SaasBetaTesters />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedComponent>
  )
}
