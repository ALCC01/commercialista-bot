import TelegramBot from 'node-telegram-bot-api'
import { CANCEL, NEW_TRANSACTION } from './consts'
import { DEFAULT_KEYBOARD, NO_KEYBOARD } from './markup'
import newTransaction from './state_machines/newTransaction'

type BotOptions = {
  allowedIds: number[]
}

export default class Bot {
  _client: TelegramBot
  _allowedIds: number[]
  _machines: { [key: number]: any }

  constructor (token: string, { allowedIds }: BotOptions) {
    this._client = new TelegramBot(token, { polling: true })
    this._allowedIds = allowedIds
    this._machines = {}
  }

  isAllowed (id: number) {
    return this._allowedIds.indexOf(id) !== -1
  }

  start () {
    this._client.on('polling_error', err => {
      console.error(err)
    })
    this._client.on('text', msg => {
      if (!this.isAllowed(msg.chat.id)) return this._client.sendMessage(msg.chat.id, '⛔ User not allowed', NO_KEYBOARD)
      if (msg.text === CANCEL || msg.text === '/cancel') {
        this._machines[msg.chat.id] = undefined
        return this._client.sendMessage(msg.chat.id, '✅ Cancelled', DEFAULT_KEYBOARD)
      }

      if (this._machines[msg.chat.id]) {
        const state = this._machines[msg.chat.id].send({ type: 'ANSWER', msg })
        if (state.done) this._machines[msg.chat.id] = undefined
      } else {
        switch (msg.text!) {
          case NEW_TRANSACTION:
            this._machines[msg.chat.id] = newTransaction(msg, this._client)
            break
          default:
            return this._client.sendMessage(msg.chat.id, '👋 Hi there!', DEFAULT_KEYBOARD)
        }
      }
    })
  }
}
