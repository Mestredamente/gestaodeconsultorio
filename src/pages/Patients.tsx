import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Search, Plus, FileText, ChevronRight, UserCircle, Phone, CalendarDays, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Patients() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    valor_sessao: ''
  })

  const fetchPatients = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('pacientes')
      .select('id, nome, telefone, email, data_criacao, recorrencia, status:id')
      .eq('usuario_id', user.id)
      .order('nome')
    
    if (data) setPatients(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPatients()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)
    
    try {
      const { data, error } = await supabase.from('pacientes').insert({
        usuario_id: user.id,
        nome: formData.nome,
        telefone: formData.telefone,
        email: formData.email,
        valor_sessao: formData.valor_sessao ? Number(formData.valor_sessao) : null
      }).select().single()
      
      if (error) throw error
      
      toast({ title: 'Paciente cadastrado com sucesso!' })
      setIsModalOpen(false)
      setFormData({ nome: '', telefone: '', email: '', valor_sessao: '' })
      fetchPatients()
      
      // Navigate to detailed view
      if (data) navigate(`/pacientes/${data.id}`)
    } catch (err: any) {
      toast({ title: 'Erro ao cadastrar', description: err.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase()) || 
    (p.telefone && p.telefone.includes(search))
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Pacientes</h1>
          <p className="text-slate-500 mt-1 text-base">Gerencie os cadastros e prontuários</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 sm:h-11 px-6 rounded-xl gap-2 shadow-sm w-full md:w-auto">
              <Plus className="w-5 h-5" /> Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <UserCircle className="w-6 h-6 text-primary" /> Cadastrar Paciente
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Nome Completo</Label>
                <Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required className="bg-slate-50 h-12 rounded-xl" placeholder="Ex: João da Silva" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Telefone (WhatsApp)</Label>
                <Input value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="bg-slate-50 h-12 rounded-xl" placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">E-mail</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-slate-50 h-12 rounded-xl" placeholder="joao@email.com" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Valor da Sessão Padrão (R$)</Label>
                <Input type="number" step="0.01" value={formData.valor_sessao} onChange={e => setFormData({...formData, valor_sessao: e.target.value})} className="bg-slate-50 h-12 rounded-xl" placeholder="150.00" />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl mt-4" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar e Ver Perfil'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-[2rem] shadow-sm border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Buscar por nome ou telefone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-white border-slate-200 shadow-sm"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <UserCircle className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">Nenhum paciente encontrado.</p>
          </div>
        ) : (
          <div className="block">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 h-12 font-bold text-slate-600">Paciente</TableHead>
                    <TableHead className="h-12 font-bold text-slate-600">Contato</TableHead>
                    <TableHead className="h-12 font-bold text-slate-600">Cadastro</TableHead>
                    <TableHead className="pr-6 text-right h-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-slate-50 group" onClick={() => navigate(`/pacientes/${p.id}`)}>
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {p.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-800">{p.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {p.telefone || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-slate-500">
                        {p.data_criacao ? new Date(p.data_criacao).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="pr-6 text-right py-4">
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-primary">
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredPatients.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between active:bg-slate-50 transition-colors" onClick={() => navigate(`/pacientes/${p.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                      {p.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{p.nome}</p>
                      <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {p.telefone || 'Sem telefone'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
