import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { MessageCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { gerarCobrancaWhatsapp } from '@/services/whatsapp'
import { supabase } from '@/lib/supabase/client'

export default function WhatsAppBillingDialog({
  pacienteId,
  patientName,
  onSuccess,
}: {
  pacienteId: string
  patientName: string
  onSuccess?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [whatsappTipo, setWhatsappTipo] = useState('personal')

  const currentDate = new Date()
  const [mes, setMes] = useState(String(currentDate.getMonth() + 1))
  const [ano, setAno] = useState(String(currentDate.getFullYear()))
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from('usuarios')
            .select('whatsapp_tipo')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
              if (data && (data as any).whatsapp_tipo) {
                setWhatsappTipo((data as any).whatsapp_tipo)
              }
            })
        }
      })
    }
  }, [open])

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const { data, error } = await gerarCobrancaWhatsapp(pacienteId, parseInt(mes), parseInt(ano))

      if (error) throw new Error(error.message || 'Erro ao comunicar com o servidor')
      if (data?.error) throw new Error(data.error)
      if (!data?.telefone) throw new Error('Dados incompletos retornados')

      let cleanPhone = data.telefone.replace(/[^\d+]/g, '')
      if (cleanPhone.startsWith('+')) {
        cleanPhone = cleanPhone.substring(1)
      }

      // Assume Brazilian number if no country code and length is typical for BR (10-11 digits)
      if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && !cleanPhone.startsWith('55')) {
        cleanPhone = `55${cleanPhone}`
      }

      const encodedMessage = encodeURIComponent(data.message)
      let url = ''

      if (whatsappTipo === 'business') {
        url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      } else {
        url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      }

      window.open(url, '_blank')
      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast({ title: 'Erro ao gerar cobrança', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 flex-1 sm:flex-none"
        >
          <MessageCircle className="w-4 h-4" /> Gerar Link WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerar Cobrança via WhatsApp</DialogTitle>
          <DialogDescription>
            Cria uma mensagem padronizada para {patientName} com o saldo devedor do mês selecionado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mes" className="text-right text-slate-700">
              Mês
            </Label>
            <div className="col-span-3">
              <Select value={mes} onValueChange={setMes}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {String(m).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ano" className="text-right text-slate-700">
              Ano
            </Label>
            <Input
              id="ano"
              type="number"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4 pt-2 border-t border-slate-100">
            <Label className="text-right text-slate-700">Enviar via</Label>
            <div className="col-span-3">
              <RadioGroup
                value={whatsappTipo}
                onValueChange={setWhatsappTipo}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal" className="font-normal cursor-pointer text-slate-700">
                    WhatsApp
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business" className="font-normal cursor-pointer text-slate-700">
                    WhatsApp Business
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? 'Gerando...' : 'Gerar e Abrir WhatsApp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
