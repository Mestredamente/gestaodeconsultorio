import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Phone, Edit3, FileText, Link as LinkIcon, Camera, Gift, AlertCircle } from 'lucide-react'
import SendContractDialog from '@/components/SendContractDialog'
import WhatsAppBillingDialog from '@/components/WhatsAppBillingDialog'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function PatientHeader({
  patient,
  onUpdate,
  isEditing,
  setIsEditing,
  hasDebt,
}: any) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const copyLink = (path: string, msg: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${path}/${patient.hash_anamnese}`)
    toast({ title: msg })
  }

  const getInitials = (name: string) => {
    if (!name) return 'P'
    const names = name.trim().split(' ')
    if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Use JPG, PNG ou WebP.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${patient.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('patient-avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('patient-avatars').getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('pacientes')
        .update({ foto_url: data.publicUrl })
        .eq('id', patient.id)

      if (updateError) throw updateError

      onUpdate({ ...patient, foto_url: data.publicUrl })
      toast({ title: 'Foto atualizada com sucesso!' })
    } catch (err: any) {
      toast({
        title: 'Erro ao fazer upload da foto',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const isBirthdayMonth = () => {
    if (!patient?.data_nascimento) return false
    const birthDate = new Date(patient.data_nascimento)
    const today = new Date()
    return birthDate.getMonth() === today.getMonth()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative mb-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 h-24 w-full relative">
        {isBirthdayMonth() && (
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-indigo-100">
            <Gift className="w-3.5 h-3.5 text-indigo-500" /> Aniversariante do Mês
          </div>
        )}
      </div>

      <div className="px-6 pb-6 pt-0 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 -mt-12">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end w-full lg:w-auto">
            <div className="relative">
              <div
                className="relative group cursor-pointer shrink-0 rounded-full bg-white shadow-sm ring-4 ring-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="w-24 h-24">
                  {patient.foto_url && (
                    <AvatarImage
                      src={patient.foto_url}
                      alt={patient.nome}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                    {getInitials(patient.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                {uploadingImage && (
                  <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                />
              </div>

              {hasDebt && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        <div className="bg-red-500 text-white rounded-full p-1">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pagamento Pendente</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                <h1 className="text-2xl font-bold text-slate-900 leading-tight">{patient.nome}</h1>
                {patient.contrato_aceito ? (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none shadow-none">
                    Contrato Aceito
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                    Contrato Pendente
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4" /> {patient.telefone || 'Sem telefone'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto shrink-0 lg:pb-1">
            <SendContractDialog
              patientName={patient.nome}
              patientPhone={patient.telefone}
              hash={patient.hash_anamnese}
              accepted={patient.contrato_aceito}
            />
            <WhatsAppBillingDialog pacienteId={patient.id} patientName={patient.nome} />
            <Button
              variant="outline"
              className="gap-2 text-indigo-600 border-indigo-200 bg-indigo-50/50"
              onClick={() => copyLink('portal', 'Link do Portal copiado!')}
            >
              <LinkIcon className="w-4 h-4" /> Portal
            </Button>
            {!isEditing && (
              <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4" /> Editar
              </Button>
            )}
            <Button
              className="gap-2"
              onClick={() => navigate(`/pacientes/${patient.id}/prontuario`)}
            >
              <FileText className="w-4 h-4" /> Prontuário
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
