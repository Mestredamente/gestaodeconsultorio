import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Search, Plus, ChevronRight, UserCircle, Phone, Loader2, Mail, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { Skeleton } from '@/components/ui/skeleton'
import NewPatientForm from '@/components/NewPatientForm'
import { cn } from '@/lib/utils'

export default function Patients() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ativos')

  const { user, userProfile } = useAuth()

  const fetchPatients = async () => {
    if (!user) return
    setLoading(true)

    const tenantId = userProfile?.parent_id || user.id

    let query = supabase
      .from('pacientes')
      .select('id, nome, telefone, email, data_criacao, recorrencia, ativo')
      .eq('usuario_id', tenantId)
      .eq('ativo', statusFilter === 'ativos')

    if (userProfile?.role === 'profissional') {
      query = query.eq('profissional_id', user.id)
    }

    const { data } = await query.order('nome')

    if (data) setPatients(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchPatients()
    if (user) {
      supabase.functions.invoke('audit_logger', {
        body: { user_id: user.id, action: 'view_list', table_name: 'pacientes' },
      })
    }
  }, [user, statusFilter])

  const filteredPatients = patients.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.telefone && p.telefone.includes(search)),
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Pacientes</h1>
          <p className="text-slate-500 mt-1 text-base">Gerencie os cadastros e prontuários</p>
        </div>

        <Button
          onClick={() => navigate('/pacientes/novo')}
          className="h-12 md:h-11 px-6 rounded-xl gap-2 shadow-sm w-full md:w-auto text-base md:text-sm"
        >
          <Plus className="w-6 h-6 md:w-5 md:h-5" /> Novo Paciente
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 md:h-10 rounded-xl bg-white border-slate-200 shadow-sm text-base md:text-sm"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 h-12 md:h-10">
            <button
              className={cn(
                'px-4 rounded-lg text-sm font-bold transition-all h-full flex items-center',
                statusFilter === 'ativos'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-700',
              )}
              onClick={() => setStatusFilter('ativos')}
            >
              Ativos
            </button>
            <button
              className={cn(
                'px-4 rounded-lg text-sm font-bold transition-all h-full flex items-center',
                statusFilter === 'inativos'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-700',
              )}
              onClick={() => setStatusFilter('inativos')}
            >
              Inativos
            </button>
          </div>
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
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <UserCircle className="w-16 h-16 mx-auto text-slate-200 mb-4" />
            <p className="text-lg font-medium text-slate-600">Nenhum paciente encontrado.</p>
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className="divide-y divide-slate-100">
            {filteredPatients.map((p) => (
              <div
                key={p.id}
                className="p-5 flex items-center justify-between active:bg-slate-50 transition-colors bg-white cursor-pointer"
                onClick={() => navigate(`/pacientes/${p.id}`)}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {p.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-bold text-slate-900 text-base leading-tight truncate">
                      {p.nome}
                    </p>
                    <div className="flex flex-col gap-1 mt-1.5">
                      {p.telefone && (
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> {p.telefone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-300 shrink-0 ml-2" />
              </div>
            ))}
          </div>
        ) : (
          // Desktop Table View
          <div className="overflow-x-auto">
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
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                    onClick={() => navigate(`/pacientes/${p.id}`)}
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {p.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800">{p.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-slate-600 flex flex-col gap-1">
                        {p.telefone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {p.telefone}
                          </span>
                        )}
                        {p.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {p.email}
                          </span>
                        )}
                        {!p.telefone && !p.email && '-'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm font-medium text-slate-500">
                      {p.data_criacao ? new Date(p.data_criacao).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="pr-6 text-right py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 text-primary hover:bg-primary/5"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
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
