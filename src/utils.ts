import { Message, MessageEntity } from 'node-telegram-bot-api'

export const getEntityText = (text: string, { offset, length }: MessageEntity, exclude = false): string => text!.substring(exclude ? offset + 1 : offset, offset + length)

const parseCurrency = ({ text, entities }: Message) => {
  if (text!.indexOf('€') !== -1) return 'EUR'
  if (text!.indexOf('£') !== -1) return 'GBP'
  if (!entities && text!.indexOf('$') !== -1) return 'USD'

  const cashtags = entities ? entities!.filter(({ type }) => type === 'cashtag').map(e => getEntityText(text!, e, true)) : text!.match(/[A-Z]{3}/) || []

  return cashtags.length ? cashtags[0] : (process.env.DEFAULT_CURRENCY || 'EUR')
}

export const parseAmount = (message: Message): string => {
  const curr = parseCurrency(message)
  const int = parseFloat(message.text!.replace(',', '.').replace(/[^\d.-]/g, ''))

  return `${int.toFixed(2)} ${curr}`
}

export const isAmount = ({ text }: Message) => !isNaN(parseFloat(text!.replace(',', '.').replace(/[^\d.-]/g, '')))