import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Plus, Clock, User } from 'lucide-react'
import { mockAppointments } from '@/lib/mock-data'
import { useToast } from '@/hooks/use-toast'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { toast } = useToast()
  const hours = Array.from({ length: 11 }, (_, i) => i + 8) // 8:00 to 18:00

  const handleDragEnd = () => {
    toast({ title: 'Horário atualizado', description: 'A sessão foi reagendada com sucesso.' })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="gap-2 rounded-full">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nova Sessão</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md w-[90vw]">
            <SheetHeader className="mb-6">
              <SheetTitle>Agendar Nova Sessão</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ana Silva</SelectItem>
                    <SelectItem value="2">Carlos Santos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Input type="time" />
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => toast({ title: 'Sessão agendada!' })}>
                Confirmar Agendamento
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="p-3 shrink-0 h-fit mx-auto lg:mx-0 w-full max-w-[320px] shadow-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md w-full flex justify-center"
          />
        </Card>

        <Card className="flex-1 p-0 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b p-4 text-center font-medium text-slate-700">
            {date?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {hours.map((hour) => {
              const timeString = `${hour.toString().padStart(2, '0')}:00`
              const apt = mockAppointments.find((a) => a.time.startsWith(timeString.split(':')[0]))

              return (
                <div key={hour} className="flex min-h-[80px] group">
                  <div className="w-20 shrink-0 border-r border-slate-100 p-4 text-right text-sm text-slate-500 font-medium">
                    {timeString}
                  </div>
                  <div className="flex-1 p-2 relative">
                    {apt && (
                      <div
                        draggable
                        onDragEnd={handleDragEnd}
                        className={`absolute inset-x-2 top-2 bottom-2 rounded-lg p-3 border cursor-move transition-transform hover:scale-[1.01] flex flex-col justify-center
                          ${apt.status === 'Confirmado' ? 'bg-primary/10 border-primary/20 text-primary-foreground' : 'bg-amber-50 border-amber-200 text-amber-900'}
                        `}
                      >
                        <p className="font-semibold text-sm flex items-center gap-2">
                          <User className="w-3.5 h-3.5" /> {apt.patientName}
                        </p>
                        <p className="text-xs opacity-80 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {apt.time} - {apt.duration} • {apt.type}
                        </p>
                      </div>
                    )}
                    {!apt && (
                      <div className="w-full h-full rounded-lg border-2 border-dashed border-transparent group-hover:border-slate-200 transition-colors" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
