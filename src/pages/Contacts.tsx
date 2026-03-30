import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  Plus,
  Search,
  Trash2,
  Edit,
  UserCircle,
  MoreVertical,
  Phone,
  Mail,
  Filter,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

export default function Contacts() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isMobile = useIsMobile()

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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isMobile) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }

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
            <Button className="h-12 md:h-11 px-6 rounded-xl gap-2 shadow-sm w-full md:w-auto text-base md:text-sm">
              <Plus className="w-6 h-6 md:w-5 md:h-5" /> Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] h-[90vh] sm:h-auto rounded-[2rem] p-0 flex flex-col overflow-hidden">
            <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100 shrink-0 sticky top-0 z-10">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2 pr-8">
                <UserCircle className="w-6 h-6 text-primary" />{' '}
                {editingId ? 'Editar Contato' : 'Cadastrar Contato'}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <form id="contact-form" onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label className="text-base md:text-sm">Nome Completo</Label>
                  <Input
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    onFocus={handleFocus}
                    placeholder="Ex: João Silva"
                    className="h-12 md:h-10 text-base"
                    autoCapitalize="words"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base md:text-sm">E-mail</Label>
                  <Input
                    type="email"
                    inputMode="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={handleFocus}
                    placeholder="joao@email.com"
                    className="h-12 md:h-10 text-base"
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base md:text-sm">Telefone</Label>
                  <Input
                    type="tel"
                    inputMode="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    onFocus={handleFocus}
                    placeholder="(11) 99999-9999"
                    className="h-12 md:h-10 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base md:text-sm">Cargo / Especialidade</Label>
                  <Input
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    onFocus={handleFocus}
                    placeholder="Psiquiatra"
                    className="h-12 md:h-10 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base md:text-sm">LinkedIn</Label>
                  <Input
                    type="url"
                    inputMode="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    onFocus={handleFocus}
                    placeholder="URL do perfil"
                    className="h-12 md:h-10 text-base"
                    autoCapitalize="none"
                  />
                </div>
              </form>
            </div>
            <div className="p-4 bg-slate-50 border-t shrink-0">
              <Button
                type="submit"
                form="contact-form"
                className="w-full h-14 md:h-12 rounded-xl text-lg md:text-base font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Salvar Contato'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar contatos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 md:h-10 rounded-xl bg-white border-slate-200 text-base md:text-sm"
            />
          </div>
          {isMobile && (
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0">
              <Filter className="w-5 h-5 text-slate-600" />
            </Button>
          )}
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <UserCircle className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">Nenhum contato encontrado.</p>
          </div>
        ) : isMobile ? (
          // Mobile View: Stacked Cards
          <div className="divide-y divide-slate-100">
            {filteredContacts.map((c) => (
              <div
                key={c.id}
                className="p-5 bg-white active:bg-slate-50 transition-colors flex justify-between items-start gap-3"
              >
                <div className="flex gap-3 items-start flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {c.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-bold text-slate-900 text-base truncate">{c.nome}</p>
                    <p className="text-sm text-slate-500 truncate">{c.cargo || 'Sem cargo'}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                      {c.telefone && (
                        <span className="text-xs text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Phone className="w-3 h-3" /> {c.telefone}
                        </span>
                      )}
                      {c.email && (
                        <span className="text-xs text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-full">
                          <Mail className="w-3 h-3 shrink-0" />{' '}
                          <span className="truncate">{c.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 text-slate-400"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem onClick={() => openEdit(c)} className="py-3 text-base">
                      <Edit className="w-4 h-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(c.id)}
                      className="py-3 text-base text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        ) : (
          // Desktop View: Table
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
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {c.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{c.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{c.cargo || '-'}</TableCell>
                    <TableCell className="text-slate-600">
                      <div className="text-sm space-y-1">
                        {c.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {c.email}
                          </div>
                        )}
                        {c.telefone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {c.telefone}
                          </div>
                        )}
                        {!c.email && !c.telefone && '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(c)}
                          className="text-slate-500 hover:text-primary hover:bg-primary/5"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(c.id)}
                          className="text-slate-500 hover:text-red-600 hover:bg-red-50"
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
      </div>
    </div>
  )
}
