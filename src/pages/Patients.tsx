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

      if (error) {
        console.error('Error fetching patients:', error)
      } else if (data) {
        setPatients(data)
      }

      setLoading(false)
    }
    fetchPatients()
  }, [user])

  const filtered = patients.filter((p) => {
    const s = search.toLowerCase()
    return (
      p.nome?.toLowerCase().includes(s) ||
      p.cpf?.toLowerCase().includes(s) ||
      p.telefone?.toLowerCase().includes(s) ||
      p.email?.toLowerCase().includes(s)
    )
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pacientes</h1>
          <p className="text-slate-500">Gerencie sua base de pacientes e níveis de engajamento.</p>
        </div>
        <Button
          className="gap-2 shadow-sm rounded-full"
          onClick={() => navigate('/pacientes/novo')}
        >
          <Plus className="w-4 h-4" /> Adicionar Paciente
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-9 bg-white"
              placeholder="Buscar por nome, email, CPF ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Nenhum paciente encontrado.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const achievementsCount = p.testes_pacientes?.length || 0
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/pacientes/${p.id}`)}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <UserRound className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                          {p.nome}
                        </h3>
                        <p className="text-sm text-slate-500">{p.telefone || 'Sem telefone'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {achievementsCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5 shadow-sm"
                        >
                          <Trophy className="w-3 h-3 text-amber-500" /> Nível {achievementsCount}
                        </Badge>
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
