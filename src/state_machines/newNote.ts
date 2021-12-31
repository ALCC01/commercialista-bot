import TelegramBot, { Message } from 'node-telegram-bot-api'
import { ConditionPredicate, createMachine, interpret, assign } from 'xstate'
import { CANCEL, CONFIRM } from '../consts'
import { Note, putEntries } from '../fava'
import { accountsKeyboard, CANCEL_KEYBOARD, CONFIRM_KEYBOARD, DEFAULT_KEYBOARD, PARSE_MK } from '../markup'
import { formatDate, escape } from '../utils'

type Context = {
  id: number
  client: TelegramBot
  account?: string
  comment?: string
  final?: Note
}

type Event = { type: 'ANSWER', msg: Message }

const guards: Record<string, ConditionPredicate<Context, Event>> = {
  isConfirm: (ctx, { msg: { text } }) => text === CONFIRM,
  isNotConfirm: (ctx, { msg: { text } }) => text !== CONFIRM
}

const machine = createMachine<Context, Event>({
  id: 'newTransaction',
  initial: 'account',
  states: {
    account: {
      entry: ({ client, id }) => client.sendMessage(id, '💳 Account', accountsKeyboard(false)),
      on: {
        ANSWER: [
          {
            actions: assign({ account: (ctx, { msg }) => msg.text! }),
            target: 'comment'
          }
        ]
      }
    },
    comment: {
      entry: ({ client, id }) => client.sendMessage(id, '🗒 Note', CANCEL_KEYBOARD),
      on: {
        ANSWER: [
          {
            actions: assign({ comment: (ctx, { msg: { text } }) => text }),
            target: 'confirm'
          }
        ]
      }
    },
    confirm: {
      entry: assign<Context, Event>({
        final: ctx => {
          const final = {
            type: 'Note',
            date: formatDate(new Date()),
            account: ctx.account!,
            comment: ctx.comment!,
            meta: {}
          } as Note

          ctx.client.sendMessage(ctx.id, confirmNote(final), { ...CONFIRM_KEYBOARD, ...PARSE_MK })

          return final
        }
      }),
      on: {
        ANSWER: [
          {
            cond: 'isConfirm',
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
          },
          {
            cond: 'isNotConfirm',
            actions: ({ client, id }) => client.sendMessage(id, `❗️ Expected ${CONFIRM} or ${CANCEL}`, CONFIRM_KEYBOARD),
            target: 'confirm'
          }
        ]
      }
    },
    done: {
      type: 'final'
    }
  }
}).withConfig({
  guards
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

const confirmNote = ({ account, comment }: Note) => {
  return `🗒 *${escape(account)}*\n\n${escape(comment)}\n\n*Confirm?*`
}
