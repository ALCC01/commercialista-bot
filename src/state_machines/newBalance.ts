import TelegramBot, { Message } from 'node-telegram-bot-api'
import { ConditionPredicate, createMachine, interpret, assign } from 'xstate'
import { CANCEL, CONFIRM } from '../consts'
import { Balance, putEntries } from '../fava'
import { accountsKeyboard, CANCEL_KEYBOARD, CONFIRM_KEYBOARD, DEFAULT_KEYBOARD, PARSE_MK } from '../markup'
import { formatDate, isAmount, parseAmount, escape } from '../utils'

type Context = {
  id: number
  client: TelegramBot
  account?: string
  amount?: string
  final?: Balance
}

type Event = { type: 'ANSWER', msg: Message }

const guards: Record<string, ConditionPredicate<Context, Event>> = {
  isValidAmount: (ctx, { msg }, meta) => isAmount(msg),
  isInvalidAmount: (ctx, { msg }, meta) => !isAmount(msg),
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
            target: 'amount'
          }
        ]
      }
    },
    amount: {
      entry: ({ client, id }) => client.sendMessage(id, '💶 Amount', CANCEL_KEYBOARD),
      on: {
        ANSWER: [
          {
            cond: 'isValidAmount',
            actions: assign<Context, Event>({
              amount: (ctx, { msg }) => parseAmount(msg)
            }),
            target: 'confirm'
          },
          {
            cond: 'isInvalidAmount',
            actions: ({ client, id }) => client.sendMessage(id, '❗️ Expected a valid amount', CANCEL_KEYBOARD),
            target: 'amount'
          }
        ]
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

          ctx.client.sendMessage(ctx.id, confirmBalance(final), { ...CONFIRM_KEYBOARD, ...PARSE_MK })

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

const confirmBalance = ({ account, amount: { number, currency } }: Balance) => {
  return `📊 *${escape(account!)}*\n\nBalance: \`${escape(`${number} ${currency}`)}\`\n\n*Confirm?*`
}
