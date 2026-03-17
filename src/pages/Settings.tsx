import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Save, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome_consultorio: '',
    chave_pix: '',
    template_cobranca:
      'Olá [Nome], você tem R$ [valor] a pagar referente a [periodo]. PIX: [chave_pix]',
  })

  useEffect(() => {
    if (user) {
      supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFormData({
              nome_consultorio: data.nome_consultorio || '',
              chave_pix: data.chave_pix || '',
              template_cobranca:
                data.template_cobranca ||
                'Olá [Nome], você tem R$ [valor] a pagar referente a [periodo]. PIX: [chave_pix]',
            })
          } else {
            // Ensure row exists
            supabase.from('usuarios').insert({ id: user.id }).then()
          }
        })
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('usuarios').upsert({
      id: user?.id,
      ...formData,
    })
    setLoading(false)

    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Configurações salvas!' })
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up pb-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações</h1>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-lg">Perfil da Clínica</CardTitle>
          <CardDescription>
            Personalize as informações de pagamento e mensagens automáticas.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic">Nome da Clínica / Consultório</Label>
                <Input
                  id="clinic"
                  value={formData.nome_consultorio}
                  onChange={(e) => setFormData({ ...formData, nome_consultorio: e.target.value })}
                  placeholder="Ex: Espaço Mente Saudável"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pix">Chave PIX</Label>
                <Input
                  id="pix"
                  value={formData.chave_pix}
                  onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                  placeholder="Ex: 000.000.000-00"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="template">Template de Cobrança (WhatsApp)</Label>
              <p className="text-xs text-slate-500 mb-2">
                Utilize as variáveis para personalizar a mensagem. Variáveis disponíveis:{' '}
                <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  [Nome]
                </code>
                ,{' '}
                <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  [valor]
                </code>
                ,{' '}
                <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  [periodo]
                </code>
                ,{' '}
                <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  [chave_pix]
                </code>
              </p>
              <Textarea
                id="template"
                rows={4}
                value={formData.template_cobranca}
                onChange={(e) => setFormData({ ...formData, template_cobranca: e.target.value })}
                className="resize-none"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="gap-2 w-full sm:w-auto" disabled={loading}>
                <Save className="w-4 h-4" /> {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-red-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Zona de Perigo
          </CardTitle>
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
