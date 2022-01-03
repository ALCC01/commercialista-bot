import TelegramBot, { Message } from 'node-telegram-bot-api'
import { createMachine, interpret, assign } from 'xstate'
import { DEFAULT_KEYBOARD } from '../markup'
import { buildShortcut } from '../shortcuts/compiler'
import { Shortcut } from '../shortcuts/schema'
import askShortcut from './askShortcut'
import { inspect } from 'util'

type Context = {
  id: number
  client: TelegramBot
  shortcut?: Shortcut,
  data?: any
}

type Event = { type: 'ANSWER', msg: Message }

const machine = createMachine<Context, Event>({
  id: 'useShortcut',
  initial: 'choose',
  states: {
    choose: {
      invoke: {
        id: 'askShortcut',
        src: askShortcut,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client, doneAllowed: false }),
        onDone: {
          actions: assign({ shortcut: (ctx, { data }) => data }),
          target: 'run'
        }
      }
    },
    run: {
      invoke: {
        id: 'runShortcut',
        src: (ctx) => buildShortcut(ctx.shortcut!),
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client, shortcut: ctx.shortcut }),
        onDone: {
          actions: assign({ data: (ctx, { data }) => data }),
          target: 'done'
        }
      }
    },
    done: {
      entry: ({ id, client, ...rest }) => client.sendMessage(id, inspect(rest), DEFAULT_KEYBOARD),
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
