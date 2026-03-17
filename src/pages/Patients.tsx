import { useState } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Plus, Phone } from 'lucide-react'
import { mockPatients } from '@/lib/mock-data'

export default function Patients() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = mockPatients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
        <Button className="rounded-full gap-2">
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

      {/* Mobile Grid */}
      <div className="grid gap-4 md:hidden">
        {filtered.map((p) => (
          <Card
            key={p.id}
            className="cursor-pointer hover:shadow-md transition active:scale-95"
            onClick={() => navigate(`/pacientes/${p.id}`)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={p.avatar} />
                <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {p.phone}
                </p>
              </div>
              <Badge
                variant={p.status === 'Ativo' ? 'default' : 'secondary'}
                className={p.status === 'Ativo' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
              >
                {p.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block shadow-sm overflow-hidden border-slate-200">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Última Sessão</TableHead>
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
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-slate-900">{p.name}</span>
                </TableCell>
                <TableCell className="text-slate-600">{p.phone}</TableCell>
                <TableCell className="text-slate-600">{p.lastSession}</TableCell>
                <TableCell>
                  <Badge
                    variant={p.status === 'Ativo' ? 'default' : 'secondary'}
                    className={p.status === 'Ativo' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                  >
                    {p.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
