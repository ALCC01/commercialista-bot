import TelegramBot from 'node-telegram-bot-api'
import { CANCEL, GET_ERRORS, NEW_BALANCE, NEW_NOTE, NEW_TRANSACTION, USE_SHORTCUT } from './consts'
import { DEFAULT_KEYBOARD, NO_KEYBOARD } from './markup'
import logger from 'npmlog'
import newTransaction from './state_machines/newTransaction'
import newBalance from './state_machines/newBalance'
import newNote from './state_machines/newNote'
import getErrors from './state_machines/getErrors'
import useShortcut from './state_machines/useShortcut'
import commands from './commands'
import { Interpreter } from 'xstate'

type BotOptions = {
  allowedIds: number[]
}

export default class Bot {
  _client: TelegramBot
  _allowedIds: number[]
  _machines: { [key: number]: Interpreter<any, any, any> | undefined }

  constructor (token: string, { allowedIds }: BotOptions) {
    this._client = new TelegramBot(token, { polling: true })
    this._allowedIds = allowedIds
    this._machines = {}

    this._client.on('error', err => logger.error('bot', 'Bot error:', err.message))
    this._client.on('polling_error', err => logger.error('bot', 'Polling error: ', err.message))

    this._client.setMyCommands(commands)
  }

  isAllowed (id: number) {
    return this._allowedIds.indexOf(id) !== -1
  }

  start () {
    this._client.on('text', msg => {
      if (!this.isAllowed(msg.chat.id)) {
        logger.info('bot', `User ${msg.chat.id} (${msg.chat.username}) tried using this bot`)
        return this._client.sendMessage(msg.chat.id, '⛔ User not allowed', NO_KEYBOARD)
      }

      if (msg.text === CANCEL || msg.text === '/cancel') {
        this._machines[msg.chat.id] = undefined
        return this._client.sendMessage(msg.chat.id, '✅ Cancelled', DEFAULT_KEYBOARD)
      }

      try {
        if (this._machines[msg.chat.id] && !this._machines[msg.chat.id]!.state.done) {
          const state = this._machines[msg.chat.id]!.send({ type: 'ANSWER', msg })
          if (state!.done) this._machines[msg.chat.id] = undefined
          return
        }

        switch (msg.text!) {
          case NEW_TRANSACTION:
            this._machines[msg.chat.id] = newTransaction(msg, this._client)
            break
          case NEW_BALANCE:
            this._machines[msg.chat.id] = newBalance(msg, this._client)
            break
          case NEW_NOTE:
            this._machines[msg.chat.id] = newNote(msg, this._client)
            break
          case GET_ERRORS:
            this._machines[msg.chat.id] = getErrors(msg, this._client)
            break
          case USE_SHORTCUT:
            this._machines[msg.chat.id] = useShortcut(msg, this._client)
            break
          default:
            return this._client.sendMessage(msg.chat.id, '👋 Hi there!', DEFAULT_KEYBOARD)
        }
      } catch (err) {
        logger.error('bot', 'Unexpected error processing a message:', (err as any).message)
        this._machines[msg.chat.id] = undefined
        this._client.sendMessage(msg.chat.id, '❗️ Unexpected error', DEFAULT_KEYBOARD)
      }
    })
  }
}
