import { supabase } from '@/lib/supabase/client'

export const gerarCobrancaWhatsapp = async (paciente_id: string, mes: number, ano: number) => {
  const { data, error } = await supabase.functions.invoke('enviar_cobranca_whatsapp', {
    body: { paciente_id, mes, ano },
  })
  return { data, error }
}
