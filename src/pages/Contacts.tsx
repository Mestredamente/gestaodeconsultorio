import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Plus, Search, Trash2, Edit, UserCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Contacts() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    linkedin: '',
    notas: '',
  })

  const fetchContacts = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('contatos')
      .select('*')
      .eq('usuario_id', user.id)
      .order('nome')

    if (error) {
      toast({ title: 'Erro ao carregar contatos', variant: 'destructive' })
    } else {
      setContacts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchContacts()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setIsSubmitting(true)

    try {
      if (editingId) {
        const { error } = await supabase
          .from('contatos')
          .update({
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
            cargo: formData.cargo,
            linkedin: formData.linkedin,
            notas: formData.notas,
          })
          .eq('id', editingId)

        if (error) throw error
        toast({ title: 'Contato atualizado com sucesso!' })
      } else {
        const { error } = await supabase.from('contatos').insert({
          usuario_id: user.id,
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          cargo: formData.cargo,
          linkedin: formData.linkedin,
          notas: formData.notas,
        })

        if (error) throw error
        toast({ title: 'Contato cadastrado com sucesso!' })
      }

      setIsModalOpen(false)
      resetForm()
      fetchContacts()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar contato', description: err.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) return

    try {
      const { error } = await supabase.from('contatos').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Contato excluído com sucesso!' })
      fetchContacts()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir contato', description: err.message, variant: 'destructive' })
    }
  }

  const openEdit = (contact: any) => {
    setEditingId(contact.id)
    setFormData({
      nome: contact.nome || '',
      email: contact.email || '',
      telefone: contact.telefone || '',
      cargo: contact.cargo || '',
      linkedin: contact.linkedin || '',
      notas: contact.notas || '',
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cargo: '',
      linkedin: '',
      notas: '',
    })
  }

  const filteredContacts = contacts.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.telefone && c.telefone.includes(search)),
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Contatos</h1>
          <p className="text-slate-500 mt-1 text-base">
            Gerencie seus contatos de networking e parceiros
          </p>
        </div>

        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-xl gap-2 shadow-sm">
              <Plus className="w-5 h-5" /> Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-[2rem] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <UserCircle className="w-6 h-6 text-primary" />{' '}
                {editingId ? 'Editar Contato' : 'Cadastrar Contato'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label>Cargo / Especialidade</Label>
                <Input
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Psiquiatra"
                />
              </div>
              <div className="space-y-2">
                <Label>LinkedIn</Label>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="URL do perfil"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl mt-4" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Contato'}
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
              placeholder="Buscar contatos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-white border-slate-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <UserCircle className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">Nenhum contato encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 h-12">Nome</TableHead>
                  <TableHead className="h-12">Cargo</TableHead>
                  <TableHead className="h-12">Contato</TableHead>
                  <TableHead className="text-right pr-6 h-12">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6 font-medium text-slate-900">{c.nome}</TableCell>
                    <TableCell className="text-slate-600">{c.cargo || '-'}</TableCell>
                    <TableCell className="text-slate-600">
                      <div className="text-sm">
                        {c.email && <div>{c.email}</div>}
                        {c.telefone && <div>{c.telefone}</div>}
                        {!c.email && !c.telefone && '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(c)}
                          className="text-slate-500 hover:text-primary"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c.id)}
                          className="text-slate-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
