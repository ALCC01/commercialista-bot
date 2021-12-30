import TelegramBot from 'node-telegram-bot-api'

type BotOptions = {
  allowedIds: number[]
}

export default class Bot {
  _client: TelegramBot
  _allowedIds: number[]

  constructor (token: string, { allowedIds }: BotOptions) {
    this._client = new TelegramBot(token, { polling: true })
    this._allowedIds = allowedIds
  }

  isAllowed (id: number) {
    return this._allowedIds.indexOf(id) !== -1
  }

  start () {
    this._client.on('text', msg => {
      if (!this.isAllowed(msg.chat.id)) return this._client.sendMessage(msg.chat.id, '⛔ User not allowed')
      this._client.sendMessage(msg.chat.id, msg.text!)
    })
  }
}
