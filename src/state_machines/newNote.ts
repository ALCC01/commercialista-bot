import TelegramBot, { Message } from 'node-telegram-bot-api'
import { createMachine, interpret, assign } from 'xstate'
import { Note, putEntries } from '../fava'
import { CANCEL_KEYBOARD, DEFAULT_KEYBOARD } from '../markup'
import { formatDate, escape } from '../utils'
import askAccount from './askAccount'
import askConfirm from './askConfirm'

type Context = {
  id: number
  client: TelegramBot
  account?: string
  comment?: string
  final?: Note
}

type Event = { type: 'ANSWER', msg: Message }

const machine = createMachine<Context, Event>({
  id: 'newNote',
  initial: 'account',
  predictableActionArguments: true,
  states: {
    account: {
      invoke: {
        id: 'askAccount',
        src: askAccount,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client, doneAllowed: false }),
        onDone: {
          actions: assign({ account: (ctx, { data }) => data }),
          target: 'comment'
        }
      }
    },
    comment: {
      entry: ({ client, id }) => client.sendMessage(id, '🗒 Note', CANCEL_KEYBOARD),
      on: {
        ANSWER: {
          actions: assign({ comment: (ctx, { msg: { text } }) => text }),
          target: 'confirm'
        }
      }
    },
    confirm: {
      entry: assign<Context, Event>({
        final: ctx => ({
          type: 'Note',
          date: formatDate(new Date()),
          account: ctx.account!,
          comment: ctx.comment!,
          meta: {}
        } as Note)
      }),
      invoke: {
        id: 'askConfirm',
        src: askConfirm,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client, question: confirmNote(ctx.final!) }),
        onDone: {
          actions: async ({ client, id, final }) => {
            try {
              await putEntries([final!])
              await client.sendMessage(id, '✅ All done!', DEFAULT_KEYBOARD)
            } catch (err) {
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

  const service = interpret<Context, any, Event, any, any>(machine.withContext(context))
  service.start()

  return service
}

const confirmNote = ({ account, comment }: Note) => {
  return `🗒 *${escape(account)}*\n\n${escape(comment)}\n\n*Confirm?*`
}
