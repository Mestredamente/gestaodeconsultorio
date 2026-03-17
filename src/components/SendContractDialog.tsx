import { Button } from '@/components/ui/button'
import { FileSignature } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SendContractDialog({
  patientName,
  patientPhone,
  hash,
  accepted,
}: {
  patientName: string
  patientPhone: string | null
  hash: string
  accepted: boolean | null
}) {
  const { toast } = useToast()

  const handleSend = () => {
    if (!patientPhone) {
      toast({
        title: 'Sem telefone',
        description: 'O paciente não possui telefone cadastrado.',
        variant: 'destructive',
      })
      return
    }

    let cleanPhone = patientPhone.replace(/[^\d+]/g, '')
    if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.substring(1)
    }
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && !cleanPhone.startsWith('55')) {
      cleanPhone = `55${cleanPhone}`
    }

    const portalLink = `${window.location.origin}/portal/${hash}`
    const message = `Olá ${patientName}, por favor, acesse seu portal do paciente no link abaixo para ler e aceitar nosso contrato de prestação de serviços psicológicos:\n\n${portalLink}`

    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`

    window.open(url, '_blank')
  }

  if (accepted) return null

  return (
    <Button
      variant="outline"
      className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 flex-1 sm:flex-none"
      onClick={handleSend}
    >
      <FileSignature className="w-4 h-4" /> Enviar Contrato
    </Button>
  )
}
