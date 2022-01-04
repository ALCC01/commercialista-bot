import TelegramBot, { Message } from 'node-telegram-bot-api'
import { createMachine, interpret } from 'xstate'
import { FRONTEND, getErrors } from '../fava'
import { DEFAULT_KEYBOARD, PARSE_MK } from '../markup'

type Context = {
  id: number
  client: TelegramBot
}

type Event = { type: 'ANSWER', msg: Message }

const machine = createMachine<Context, Event>({
  id: 'getErrors',
  initial: 'get',
  states: {
    get: {
      invoke: {
        id: 'fetchErrors',
        src: () => getErrors(),
        onDone: {
          actions: ({ id, client }, { data }) => {
            const msg = data > 0
              ? `❗️ Found *${data}* [errors](${FRONTEND}/errors/)`
              : '✅ Everything alright\\! Found *0* errors'

            client.sendMessage(id, msg, { ...DEFAULT_KEYBOARD, ...PARSE_MK })
          },
          target: 'done'
        },
        onError: {
          actions: ({ id, client }, { data }) => {
            client.sendMessage(id, '❗️ Unexpected error', DEFAULT_KEYBOARD)
          },
          target: 'done'
        }
      }
    },
    done: {
      type: 'final'
    }
  }
})

export default (msg: Message, client: TelegramBot) => {
  const context = {
    id: msg.chat!.id,
    client
  }

  const service = interpret<Context, any, Event>(machine.withContext(context))
  service.start()

  return service
}
