import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

const COLORS = [
  { name: 'Azul (Padrão)', value: 'blue', class: 'bg-blue-600' },
  { name: 'Esmeralda', value: 'emerald', class: 'bg-emerald-600' },
  { name: 'Violeta', value: 'violet', class: 'bg-violet-600' },
  { name: 'Rosa', value: 'rose', class: 'bg-rose-600' },
  { name: 'Laranja', value: 'orange', class: 'bg-orange-600' },
  { name: 'Zinco', value: 'zinc', class: 'bg-zinc-800' },
  { name: 'Vermelho', value: 'red', class: 'bg-red-600' },
  { name: 'Amarelo', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Ciano', value: 'cyan', class: 'bg-cyan-600' },
  { name: 'Verde', value: 'green', class: 'bg-green-600' },
  { name: 'Roxo Claro', value: 'purple', class: 'bg-purple-500' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-600' },
]

export function AppearanceSettings({ user, formData, setFormData }: any) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentColor, setCurrentColor] = useState(formData?.portal_settings?.tema_cor || 'blue')

  const handleSave = async () => {
    setLoading(true)
    const newSettings = { ...(formData.portal_settings || {}), tema_cor: currentColor }

    const { error } = await supabase
      .from('usuarios')
      .update({
        portal_settings: newSettings,
      })
      .eq('id', user.id)

    setLoading(false)
    if (!error) {
      toast({ title: 'Aparência atualizada!' })
      setFormData({ ...formData, portal_settings: newSettings })
      document.documentElement.setAttribute('data-theme', currentColor)
    } else {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  return (
    <Card className="rounded-[2rem] shadow-sm border-slate-100">
      <CardHeader className="p-6 md:p-8 pb-4">
        <CardTitle className="text-xl">Cores e Aparência</CardTitle>
        <CardDescription>
          Personalize a cor principal da sua interface e do portal do paciente.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8 pt-0 space-y-6">
        <div className="space-y-4">
          <Label>Cor Principal</Label>
          <div className="flex flex-wrap gap-4">
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setCurrentColor(color.value)}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all ring-offset-2',
                  color.class,
                  currentColor === color.value
                    ? 'ring-2 ring-slate-400 scale-110 shadow-md'
                    : 'hover:scale-105',
                )}
                title={color.name}
              >
                {currentColor === color.value && <Check className="w-5 h-5 text-white" />}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="rounded-xl h-12 px-8">
          Salvar Aparência
        </Button>
      </CardContent>
    </Card>
  )
}
