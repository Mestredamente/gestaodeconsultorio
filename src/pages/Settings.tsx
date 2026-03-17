import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Save,
  AlertTriangle,
  Calendar,
  Globe,
  Copy,
  Upload,
  Image as ImageIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    nome_consultorio: '',
    email: '',
    chave_pix: '',
    template_cobranca:
      'Olá [Nome], você tem R$ [valor] a pagar referente a [periodo]. PIX: [chave_pix]',
    logo_url: '',
  })

  useEffect(() => {
    if (user) {
      supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setFormData({
              nome_consultorio: data.nome_consultorio || '',
              email: data.email || user.email || '',
              chave_pix: data.chave_pix || '',
              template_cobranca: data.template_cobranca || formData.template_cobranca,
              logo_url: data.logo_url || '',
            })
          }
        })
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('usuarios').upsert({ id: user?.id, ...formData })

    if (user && formData.email && formData.email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({ email: formData.email })
      if (authError)
        toast({ title: 'Aviso', description: 'Erro ao solicitar mudança de e-mail de acesso.' })
      else
        toast({
          title: 'E-mail atualizado',
          description: 'Verifique a caixa de entrada para confirmar a alteração.',
        })
    }

    setLoading(false)
    if (error)
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    else toast({ title: 'Configurações salvas!' })
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/logo-${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('logos').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path)
      const newUrl = data.publicUrl
      setFormData((prev) => ({ ...prev, logo_url: newUrl }))
      await supabase.from('usuarios').update({ logo_url: newUrl }).eq('id', user.id)
      toast({ title: 'Logo atualizada com sucesso!' })
    } else {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' })
    }
    setUploading(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up pb-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Perfil e Configurações</h1>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-lg">Perfil da Clínica</CardTitle>
          <CardDescription>
            Personalize as informações, logo e mensagens automáticas.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="w-24 h-24 border-2 border-slate-200 shadow-sm">
                  <AvatarImage src={formData.logo_url} className="object-cover" />
                  <AvatarFallback className="bg-slate-100 text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" /> {uploading ? 'Enviando...' : 'Alterar Logo'}
                </Button>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic">Nome da Clínica / Consultório</Label>
                    <Input
                      id="clinic"
                      value={formData.nome_consultorio}
                      onChange={(e) =>
                        setFormData({ ...formData, nome_consultorio: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail de Contato/Acesso</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="pix">Chave PIX para Cobranças</Label>
                    <Input
                      id="pix"
                      value={formData.chave_pix}
                      onChange={(e) => setFormData({ ...formData, chave_pix: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 mt-4">
              <Label htmlFor="template" className="mt-4 block">
                Template de Cobrança (WhatsApp)
              </Label>
              <p className="text-xs text-slate-500 mb-2">
                Variáveis: <code className="bg-slate-100 px-1">[Nome]</code>,{' '}
                <code className="bg-slate-100 px-1">[valor]</code>,{' '}
                <code className="bg-slate-100 px-1">[periodo]</code>,{' '}
                <code className="bg-slate-100 px-1">[chave_pix]</code>
              </p>
              <Textarea
                id="template"
                rows={3}
                value={formData.template_cobranca}
                onChange={(e) => setFormData({ ...formData, template_cobranca: e.target.value })}
                className="resize-none"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Button type="submit" className="gap-2 flex-1 sm:flex-none" disabled={loading}>
                <Save className="w-4 h-4" /> {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2 flex-1 sm:flex-none text-primary border-primary/20 hover:bg-primary/5"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/agendar/${user?.id}`)
                  toast({ title: 'Link copiado!' })
                }}
              >
                <Copy className="w-4 h-4" /> Link de Agendamento Online
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
