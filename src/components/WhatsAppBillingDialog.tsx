import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

export default function WhatsAppBillingDialog({ pacienteId, patientName, onSuccess }: any) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isMobile = useIsMobile()

  const handleSendBilling = async () => {
    setLoading(true)
    try {
      const today = new Date()
      const mes = today.getMonth() + 1
      const ano = today.getFullYear()

      const { data, error } = await supabase.functions.invoke('enviar_cobranca_whatsapp', {
        body: { paciente_id: pacienteId, mes, ano },
      })

      if (error) throw error

      if (data.error) {
        throw new Error(data.error)
      }

      toast({
        title: 'Cobrança enviada!',
        description: `Mensagem enviada com sucesso para ${data.telefone}`,
      })

      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar',
        description: err.message || 'Falha ao processar o envio via WhatsApp.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size={isMobile ? 'default' : 'sm'}
      onClick={handleSendBilling}
      disabled={loading}
      className={cn(
        'gap-2 font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200',
        isMobile ? 'h-11 w-full rounded-xl' : 'h-9 px-3',
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4" />
      )}
      {isMobile ? 'Cobrar via WhatsApp' : 'Cobrar'}
    </Button>
  )
}
