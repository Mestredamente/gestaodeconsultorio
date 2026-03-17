import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Plus, Phone, ArrowLeft, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import NewPatientForm from '@/components/NewPatientForm'

export default function Patients() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<any[]>([])
  const [view, setView] = useState<'list' | 'new'>('list')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchPatients = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('pacientes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('nome')
      if (data) setPatients(data)
      setLoading(false)
    }
    if (view === 'list') {
      fetchPatients()
    }
  }, [user, view])

  if (view === 'new') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setView('list')} className="gap-2 text-slate-500">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Cadastrar Paciente</h1>
        </div>
        <NewPatientForm />
      </div>
    )
  }

  const filtered = patients.filter((p) => p.nome.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
        <Button className="rounded-full gap-2" onClick={() => setView('new')}>
          <Plus className="w-4 h-4" /> Novo Paciente
        </Button>
      </div>

      <Card className="p-4 flex gap-4 shadow-sm border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome..."
            className="pl-9 bg-slate-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">Nenhum paciente</h3>
          <p className="text-slate-500 mt-1 mb-4">Você ainda não tem pacientes cadastrados.</p>
          <Button onClick={() => setView('new')}>Cadastrar Primeiro Paciente</Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {filtered.map((p) => (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-md transition active:scale-95"
                onClick={() => navigate(`/pacientes/${p.id}`)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {p.nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{p.nome}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {p.telefone || 'Sem telefone'}
                    </p>
                  </div>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativo</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="hidden md:block shadow-sm overflow-hidden border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate(`/pacientes/${p.id}`)}
                  >
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {p.nome.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-900">{p.nome}</span>
                    </TableCell>
                    <TableCell className="text-slate-600">{p.telefone || '-'}</TableCell>
                    <TableCell className="text-slate-600">{p.email || '-'}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">Ativo</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
