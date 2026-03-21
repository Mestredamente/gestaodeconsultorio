import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Trophy, ChevronRight, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'

export default function Patients() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    const fetchPatients = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('pacientes')
        .select('*, testes_pacientes(id)')
        .eq('usuario_id', user.id)
        .order('nome')

      if (!error && data) setPatients(data)
      setLoading(false)
    }
    fetchPatients()
  }, [user])

  const filtered = patients.filter((p) => {
    if (!search) return true
    const s = search.toLowerCase()
    return p.nome?.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s)
  })

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pacientes</h1>
          <p className="text-slate-500 mt-1 text-base">
            Gerencie sua base de pacientes e prontuários.
          </p>
        </div>
        <Button
          className="gap-2 shadow-sm rounded-xl h-12 sm:h-11 px-6 text-base sm:text-sm w-full sm:w-auto"
          onClick={() => navigate('/pacientes/novo')}
        >
          <Plus className="w-5 h-5 sm:w-4 sm:h-4" /> Novo Paciente
        </Button>
      </div>

      <Card className="shadow-sm border-slate-100 rounded-[2rem] overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-6">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              className="pl-11 bg-white h-12 rounded-xl border-slate-200 text-base"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-16 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-500 font-medium">
              Nenhum paciente encontrado.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/pacientes/${p.id}`)}
                  className="p-5 sm:p-6 flex flex-row items-center justify-between hover:bg-slate-50/50 cursor-pointer transition-colors group gap-4"
                >
                  <div className="flex items-center gap-4 sm:gap-5 w-full min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 shadow-sm border border-indigo-100">
                      <UserRound className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-slate-800 group-hover:text-primary transition-colors truncate">
                        {p.nome}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-500 truncate">
                        {p.telefone || 'Sem telefone'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
