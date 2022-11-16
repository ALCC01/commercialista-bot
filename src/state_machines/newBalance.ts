import TelegramBot, { Message } from 'node-telegram-bot-api'
import { createMachine, interpret, assign } from 'xstate'
import { Balance, putEntries } from '../fava'
import { DEFAULT_KEYBOARD } from '../markup'
import { formatDate, escape } from '../utils'
import askAccount from './askAccount'
import askAmount from './askAmount'
import askConfirm from './askConfirm'

type Context = {
  id: number
  client: TelegramBot
  account?: string
  amount?: string
  final?: Balance
}

type Event = { type: 'ANSWER', msg: Message }

const machine = createMachine<Context, Event>({
  id: 'newBalance',
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
          target: 'amount'
        }
      }
    },
    amount: {
      invoke: {
        id: 'askAmount',
        src: askAmount,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client }),
        onDone: {
          actions: assign({ amount: (ctx, { data }) => data }),
          target: 'confirm'
        }
      }
    },
    confirm: {
      entry: assign<Context, Event>({
        final: ctx => {
          const [number, currency] = ctx.amount!.split(' ')
          const final = {
            type: 'Balance',
            date: formatDate(new Date()),
            account: ctx.account!,
            amount: { number, currency },
            meta: {}
          } as Balance

          return final
        }
      }),
      invoke: {
        id: 'askConfirm',
        src: askConfirm,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client, question: confirmBalance(ctx.final!) }),
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

const confirmBalance = ({ account, amount: { number, currency } }: Balance) => {
  return `📊 *${escape(account!)}*\n\nBalance: \`${escape(`${number} ${currency}`)}\`\n\n*Confirm?*`
}
