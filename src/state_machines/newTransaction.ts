import TelegramBot, { Message } from 'node-telegram-bot-api'
import { createMachine, interpret, assign, DoneInvokeEvent } from 'xstate'
import { Posting, putEntries, Transaction } from '../fava'
import { DEFAULT_KEYBOARD, NO_KEYBOARD } from '../markup'
import { formatDate, escape } from '../utils'
import askAccount from './askAccount'
import askAmount from './askAmount'
import askConfirm from './askConfirm'

type Context = {
  id: number
  client: TelegramBot
  currentAccount?: string
  postings: Posting[]
  payee?: string
  narration?: string
  final?: Transaction
}

type Event = { type: 'ANSWER', msg: Message }

const machine = createMachine<Context, Event>({
  id: 'newTransaction',
  initial: 'narration',
  states: {
    narration: {
      entry: ({ client, id }) => client.sendMessage(id, '🧾 Narration', NO_KEYBOARD),
      on: {
        ANSWER: [
          {
            actions: assign({ narration: (ctx, { msg }) => msg.text! }),
            target: 'account'
          }
        ]
      }
    },
    account: {
      invoke: {
        id: 'askAccount',
        src: askAccount,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client, doneAllowed: ctx.postings.length >= 2 }),
        onDone: [
          {
            cond: (ctx, { data }) => data === undefined,
            target: 'confirm'
          },
          {
            actions: assign({ currentAccount: (ctx, { data }) => data }),
            target: 'amount'
          }
        ]
      }
    },
    amount: {
      invoke: {
        id: 'askAmount',
        src: askAmount,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client }),
        onDone: [
          {
            actions: assign<Context, DoneInvokeEvent<any>>({
              postings: (ctx, { data }) => [...ctx.postings, { account: ctx.currentAccount, amount: data } as Posting],
              currentAccount: () => undefined
            }),
            target: 'account'
          }
        ]
      }
    },
    confirm: {
      entry: assign<Context, Event>({
        final: ctx => ({
          type: 'Transaction',
          date: formatDate(new Date()),
          flag: '*',
          narration: ctx.narration!,
          postings: ctx.postings,
          meta: {}
        } as Transaction)
      }),
      invoke: {
        id: 'askConfirm',
        src: askConfirm,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client, question: confirmTransaction(ctx.final!) }),
        onDone: [
          {
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
        ]
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
    client,
    postings: []
  }

  const service = interpret<Context, any, Event>(machine.withContext(context))

  service.start()
  return service
}

function confirmTransaction ({ payee, narration, postings }: Transaction) {
  let r = `🧾 ${payee ? `*${escape(payee!)}* ${escape(narration)}` : `*${escape(narration)}*`}\n\n`
  r += postings
    .map(({ account, amount }) => `_${escape(account)}_\`\t${escape(amount)}\``)
    .join('\n')
  r += '\n*Confirm?*'

  return r
}
