import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ReceiptDialog({
  open,
  onOpenChange,
  patientName,
  amount,
  dateStr,
  referencia,
}: any) {
  const { user } = useAuth()
  const [clinic, setClinic] = useState<any>(null)

  useEffect(() => {
    if (user && open) {
      supabase
        .from('usuarios')
        .select('nome_consultorio, logo_url, email')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setClinic(data))
    }
  }, [user, open])

  if (!open) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md print:hidden">
          <DialogHeader>
            <DialogTitle>Recibo de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-5 border border-slate-200 rounded-lg bg-slate-50 mt-4 shadow-sm">
            <div className="text-center font-bold text-lg text-slate-900 border-b border-slate-200 pb-3 mb-3">
              {clinic?.nome_consultorio || 'Consultório Clínico'}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Paciente:</span>{' '}
              <span className="font-semibold text-right">{patientName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Valor Recebido:</span>{' '}
              <span className="font-bold text-emerald-700">
                {Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Mês de Referência:</span>{' '}
              <span className="font-medium">{referencia}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Data de Emissão:</span> <span>{dateStr}</span>
            </div>
          </div>
          <Button className="w-full gap-2 mt-4" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Imprimir ou Salvar PDF
          </Button>
        </DialogContent>
      </Dialog>

      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 font-sans text-black">
        <div className="flex items-center gap-6 border-b-2 border-slate-800 pb-6 mb-12">
          {clinic?.logo_url && (
            <img src={clinic.logo_url} className="w-20 h-20 object-contain" alt="Logo" />
          )}
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-slate-900">
              {clinic?.nome_consultorio || 'Recibo de Serviço'}
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              {clinic?.email || 'Contato Profissional'}
            </p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-12 uppercase tracking-widest text-slate-800">
          Recibo de Pagamento
        </h2>

        <div className="text-lg leading-relaxed space-y-8 max-w-3xl mx-auto">
          <p className="text-justify text-slate-800">
            Recebi(emos) de <strong className="uppercase">{patientName}</strong>, a quantia de{' '}
            <strong>
              {Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong>
            referente a serviços de psicologia clínica prestados no período de{' '}
            <strong>{referencia}</strong>.
          </p>
          <p className="text-justify text-slate-800">
            Por ser verdade, firmo(amos) o presente recibo.
          </p>

          <div className="mt-32 pt-16 border-t border-slate-400 w-2/3 mx-auto text-center">
            <p className="font-bold text-xl text-slate-900 uppercase">
              {clinic?.nome_consultorio || 'Assinatura do Profissional'}
            </p>
            <p className="text-base mt-2 text-slate-500">{dateStr}</p>
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible !important; }
          .print\\:block { position: absolute; left: 0; top: 0; width: 100%; min-height: 100%; background: white; }
        }
      `}</style>
    </>
  )
}
