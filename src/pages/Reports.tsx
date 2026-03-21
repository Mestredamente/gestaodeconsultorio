import { PerformanceDashboard } from '@/components/PerformanceDashboard'
import { BarChart3 } from 'lucide-react'

export default function Reports() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Desempenho e Métricas</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Análise avançada de crescimento, retenção e financeiro.</p>
        </div>
      </div>
      
      {/* Container with overflow-x-hidden to prevent horizontal scroll issues on mobile charts */}
      <div className="overflow-x-hidden">
        <PerformanceDashboard />
      </div>
    </div>
  )
}
