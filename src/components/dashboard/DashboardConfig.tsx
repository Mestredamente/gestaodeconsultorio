import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Settings2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface WidgetPref {
  id: string
  title: string
  visible: boolean
  order: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  preferences: WidgetPref[]
  onChange: (prefs: WidgetPref[]) => void
}

export function DashboardConfig({ open, onOpenChange, preferences, onChange }: Props) {
  const toggleVisibility = (id: string) => {
    onChange(preferences.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newPrefs = [...preferences]
    const temp = newPrefs[index]
    newPrefs[index] = newPrefs[index - 1]
    newPrefs[index - 1] = temp
    newPrefs.forEach((p, i) => (p.order = i))
    onChange(newPrefs)
  }

  const moveDown = (index: number) => {
    if (index === preferences.length - 1) return
    const newPrefs = [...preferences]
    const temp = newPrefs[index]
    newPrefs[index] = newPrefs[index + 1]
    newPrefs[index + 1] = temp
    newPrefs.forEach((p, i) => (p.order = i))
    onChange(newPrefs)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Settings2 className="w-5 h-5 text-primary" /> Personalizar Painel
          </DialogTitle>
          <DialogDescription>
            Escolha quais blocos deseja ver e a ordem de exibição.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {preferences.map((pref, index) => (
            <div
              key={pref.id}
              className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl transition-all hover:border-slate-200"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleVisibility(pref.id)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    pref.visible
                      ? 'text-primary hover:bg-primary/10'
                      : 'text-slate-400 hover:bg-slate-200',
                  )}
                >
                  {pref.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <span
                  className={cn(
                    'font-medium text-sm',
                    !pref.visible && 'text-slate-400 line-through',
                  )}
                >
                  {pref.title}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-700"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-700"
                  onClick={() => moveDown(index)}
                  disabled={index === preferences.length - 1}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
