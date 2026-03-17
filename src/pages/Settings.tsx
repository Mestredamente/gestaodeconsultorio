import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Save } from 'lucide-react'

export default function Settings() {
  const { toast } = useToast()

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast({ title: 'Configurações salvas!', variant: 'default' })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Perfil Profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" defaultValue="Dr. Marcos L." className="bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crp">CRP</Label>
                <Input id="crp" defaultValue="00/00000" className="bg-slate-50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email de Contato</Label>
              <Input
                id="email"
                type="email"
                defaultValue="marcos@clinica.io"
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic">Nome da Clínica</Label>
              <Input id="clinic" defaultValue="Espaço Mente Saudável" className="bg-slate-50" />
            </div>
            <Button type="submit" className="gap-2 mt-4">
              <Save className="w-4 h-4" /> Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Ao deletar sua conta, todos os dados, pacientes e registros financeiros serão
            permanentemente removidos. Esta ação não pode ser desfeita.
          </p>
          <Button variant="destructive">Excluir Minha Conta</Button>
        </CardContent>
      </Card>
    </div>
  )
}
