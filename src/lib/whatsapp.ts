import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function parseWhatsAppTemplate(
  template: string,
  data: {
    nome?: string
    dataHora?: string | Date | null
    tipoSessao?: string | null
    link_portal?: string
    link_confirmacao?: string
    valor?: string | number
    periodo?: string
    chave_pix?: string
    [key: string]: any
  },
) {
  let text = template || ''

  if (data.nome) {
    text = text.replace(/\[Nome\]/gi, data.nome)
  }

  if (data.dataHora) {
    const d = new Date(data.dataHora)
    text = text.replace(/\[Data\]/gi, format(d, 'dd/MM/yyyy', { locale: ptBR }))
    text = text.replace(/\[Hora\]/gi, format(d, 'HH:mm', { locale: ptBR }))
  } else {
    text = text.replace(/\[Data\]/gi, '__/__/____')
    text = text.replace(/\[Hora\]/gi, '--:--')
  }

  if (data.tipoSessao) {
    text = text.replace(/\[TipoSessao\]/gi, data.tipoSessao)
  } else {
    text = text.replace(/\[TipoSessao\]/gi, 'Consulta')
  }

  if (data.link_portal) {
    text = text.replace(/\[link_portal\]/gi, data.link_portal)
  }

  if (data.link_confirmacao) {
    text = text.replace(/\[link_confirmacao\]/gi, data.link_confirmacao)
  }

  if (data.valor !== undefined) {
    const valorStr = Number(data.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    text = text.replace(/\[valor\]/gi, valorStr)
  }

  if (data.periodo) {
    text = text.replace(/\[periodo\]/gi, data.periodo)
  }

  if (data.chave_pix) {
    text = text.replace(/\[chave_pix\]/gi, data.chave_pix)
  }

  return text
}

export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return ''
  const cleanPhone = phone.replace(/\D/g, '')

  // Se já possui o DDI 55 e tamanho condizente com formato internacional BR
  if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
    return cleanPhone
  }

  // Se possui 10 ou 11 dígitos, assumimos que é um número BR sem o código de país
  if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    return `55${cleanPhone}`
  }

  return cleanPhone
}

export function generateWhatsAppLink(
  phone: string,
  message: string,
  type: 'padrao' | 'business' | 'personal' = 'padrao',
) {
  const cleanPhone = formatPhoneForWhatsApp(phone)
  const encodedMsg = encodeURIComponent(message)

  // Utilizar api.whatsapp.com é uma prática mais resiliente para garantir
  // um fallback (página web informando se o app não está instalado)
  // que funciona bem em tablets (iPad/Android) e Desktops.
  if (type === 'business') {
    return `https://wa.me/${cleanPhone}?text=${encodedMsg}`
  }

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`
}
