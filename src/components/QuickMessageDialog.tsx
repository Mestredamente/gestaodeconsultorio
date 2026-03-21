import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { MessageCircle, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { parseWhatsAppTemplate, generateWhatsAppLink } from '@/lib/whatsapp'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export function QuickMessageDialog({ patient }: { patient: any }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [templates, setTemplates] = useState<any>(null)
  const [customTemplates, setCustomTemplates] = useState<any[]>([])
  const [nextAppt, setNextAppt] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState('lembrete')
  const [message, setMessage] = useState('')
  const [waType, setWaType] = useState<'padrao' | 'business'>('padrao')

  useEffect(() => {
    if (open && user && patient?.id) {
      supabase
        .from('usuarios')
        .select(
          'template_lembrete, template_confirmacao, template_cobranca, whatsapp_tipo, chave_pix',
        )
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setTemplates(data)
            setWaType(
              (data.whatsapp_tipo as any) === 'personal'
                ? 'padrao'
                : (data.whatsapp_tipo as any) || 'padrao',
            )
          }
        })

      supabase
        .from('templates_documentos')
        .select('id, titulo, conteudo')
        .eq('usuario_id', user.id)
        .eq('tipo', 'mensagem_rapida')
        .then(({ data }) => {
          if (data) setCustomTemplates(data)
        })

      supabase
        .from('agendamentos')
        .select('id, data_hora, tipo_pagamento')
        .eq('paciente_id', patient.id)
        .gte('data_hora', new Date().toISOString())
        .order('data_hora', { ascending: true })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          setNextAppt(data)
        })
    }
  }, [open, user, patient?.id])

  useEffect(() => {
    if (templates && patient) {
      let tpl = ''
      if (['lembrete', 'confirmacao', 'cobranca'].includes(selectedTemplate)) {
        tpl = templates[`template_${selectedTemplate}`] || ''
      } else {
        const custom = customTemplates.find((t) => t.id === selectedTemplate)
        if (custom) tpl = custom.conteudo
      }

      const link = `${window.location.origin}/portal/${patient.hash_anamnese}`
      const confirmLink = nextAppt?.id
        ? `${window.location.origin}/confirmar/${patient.hash_anamnese}/${nextAppt.id}`
        : ''

      const parsed = parseWhatsAppTemplate(tpl, {
        nome: patient.nome,
        dataHora: nextAppt?.data_hora,
        tipoSessao: nextAppt?.tipo_pagamento,
        link_portal: link,
        link_confirmacao: confirmLink,
        chave_pix: templates.chave_pix || '',
      })
      setMessage(parsed)
    }
  }, [selectedTemplate, templates, nextAppt, patient, customTemplates])

  const handleSend = async () => {
    if (!patient?.telefone) {
      toast({ title: 'Paciente sem telefone cadastrado', variant: 'destructive' })
      return
    }

    // generateWhatsAppLink já executa a sanitização com a função formatPhoneForWhatsApp
    const link = generateWhatsAppLink(patient.telefone, message, waType)
    window.open(link, '_blank', 'noopener,noreferrer')

    if (user && patient.id) {
      await supabase.from('historico_mensagens' as any).insert({
        usuario_id: user.id,
        paciente_id: patient.id,
        tipo: selectedTemplate,
        conteudo: message,
        status_envio: 'enviado',
      })
    }

    if (nextAppt?.id && selectedTemplate === 'lembrete') {
      await supabase
        .from('agendamentos')
        .update({ status_whatsapp_lembrete: 'enviado' } as any)
        .eq('id', nextAppt.id)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-emerald-50/50 shadow-sm shrink-0"
        >
          <MessageCircle className="w-4 h-4" /> Mensagem Rápida
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-500" />
            Enviar Mensagem
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Tipo de Mensagem</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="text-xs text-slate-500 uppercase tracking-wider">
                    Padrões do Sistema
                  </SelectLabel>
                  <SelectItem value="lembrete">Lembrete de Consulta</SelectItem>
                  <SelectItem value="confirmacao">Confirmação de Agendamento</SelectItem>
                  <SelectItem value="cobranca">Cobrança</SelectItem>
                </SelectGroup>
                {customTemplates.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="text-xs text-slate-500 uppercase tracking-wider mt-2 border-t pt-2">
                      Meus Modelos Especiais
                    </SelectLabel>
                    {customTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.titulo}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mensagem (Pode editar livremente)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px] bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <Label>Abrir via</Label>
            <Select value={waType} onValueChange={(v: any) => setWaType(v)}>
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="padrao">WhatsApp Padrão</SelectItem>
                <SelectItem value="business">WhatsApp Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
          >
            <Send className="w-4 h-4" /> Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
