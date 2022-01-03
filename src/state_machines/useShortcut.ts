import TelegramBot, { Message } from 'node-telegram-bot-api'
import { createMachine, interpret, assign } from 'xstate'
import { DEFAULT_KEYBOARD } from '../markup'
import { Shortcut } from '../shortcuts/schema'
import askShortcut from './askShortcut'
import { putEntries, Transaction } from '../fava'
import askConfirm from './askConfirm'
import { confirmTransaction } from './newTransaction'
import { formatDate } from '../utils'
import { getShortcutMachine } from '../shortcuts'

type Context = {
  id: number
  client: TelegramBot
  shortcut?: Shortcut,
  data?: any,
  final?: Transaction
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
        src: (ctx) => getShortcutMachine(ctx.shortcut!.icon),
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client, shortcut: ctx.shortcut }),
        onDone: {
          actions: assign({ data: (ctx, { data }) => data }),
          target: 'confirm'
        }
      }
    },
    confirm: {
      entry: assign<Context, Event>({
        final: ({ data }) => ({
          type: 'Transaction',
          date: formatDate(new Date()),
          flag: '*',
          narration: data.narration!,
          postings: data.postings,
          meta: {}
        } as Transaction)
      }),
      invoke: {
        id: 'askConfirm',
        src: askConfirm,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client, question: confirmTransaction(ctx.final!) }),
        onDone: {
          actions: async ({ client, id, final }) => {
            try {
              await putEntries([final!])
              await client.sendMessage(id, '✅ All done!', DEFAULT_KEYBOARD)
            } catch (err) {
              console.error(err)
              await client.sendMessage(id, '❗️ Unexpected error', DEFAULT_KEYBOARD)
            }
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
