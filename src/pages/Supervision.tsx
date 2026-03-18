import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Users, AlertTriangle, MessageSquare, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function Supervision() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [casos, setCasos] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    titulo_anonimizado: '',
    descricao_caso: '',
    area_atuacao: '',
  })

  useEffect(() => {
    if (user) fetchCasos()
  }, [user])

  const fetchCasos = async () => {
    const { data } = await supabase
      .from('casos_supervisao' as any)
      .select('*')
      .eq('usuario_id', user?.id)
      .order('data_criacao', { ascending: false })
    if (data) setCasos(data)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const { error } = await supabase.from('casos_supervisao' as any).insert({
      usuario_id: user.id,
      ...formData,
    })
    if (!error) {
      toast({ title: 'Caso cadastrado com sucesso!' })
      setIsOpen(false)
      setFormData({ titulo_anonimizado: '', descricao_caso: '', area_atuacao: '' })
      fetchCasos()
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" /> Supervisão Clínica
          </h1>
          <p className="text-slate-500">
            Gerencie e compartilhe casos anonimizados para orientação.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full shadow-sm">
              <Plus className="w-4 h-4" /> Novo Caso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submeter Caso para Supervisão</DialogTitle>
            </DialogHeader>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex gap-2 text-amber-800 text-sm mt-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>
                <strong>Aviso de Privacidade:</strong> Remova todas as informações de identificação
                (nomes, locais específicos, datas exatas) antes de submeter o caso.
              </p>
            </div>
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Título do Caso (Ex: Paciente TCC - Fobia Social)</Label>
                <Input
                  required
                  value={formData.titulo_anonimizado}
                  onChange={(e) => setFormData({ ...formData, titulo_anonimizado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Área de Atuação / Abordagem</Label>
                <Input
                  value={formData.area_atuacao}
                  onChange={(e) => setFormData({ ...formData, area_atuacao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição do Caso (HDA, Sintomas, Dúvida Clínica)</Label>
                <Textarea
                  required
                  className="min-h-[200px]"
                  value={formData.descricao_caso}
                  onChange={(e) => setFormData({ ...formData, descricao_caso: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                Salvar Caso
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {casos.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
            Nenhum caso de supervisão cadastrado.
          </div>
        ) : (
          casos.map((c) => (
            <Card
              key={c.id}
              className="shadow-sm border-slate-200 hover:shadow-md transition-shadow"
            >
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-1">{c.titulo_anonimizado}</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      c.status === 'pendente'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
                {c.area_atuacao && <p className="text-xs text-slate-500">{c.area_atuacao}</p>}
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <p className="text-sm text-slate-700 line-clamp-4 whitespace-pre-wrap">
                  {c.descricao_caso}
                </p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">
                    {new Date(c.data_criacao).toLocaleDateString('pt-BR')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-primary hover:text-primary/80"
                  >
                    <MessageSquare className="w-4 h-4" /> Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
