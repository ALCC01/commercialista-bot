import TelegramBot, { Message } from 'node-telegram-bot-api'
import { ConditionPredicate, createMachine, interpret } from 'xstate'
import { CANCEL, CONFIRM, DONE } from '../consts'
import { Posting, putTransaction, Transaction } from '../fava'
import { CANCEL_KEYBOARD, CANCEL_OR_DONE_KEYBOARD, CONFIRM_KEYBOARD, DEFAULT_KEYBOARD, NO_KEYBOARD, PARSE_MK } from '../markup'
import { formatDate, isAmount, parseAmount } from '../utils'

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

const guards: Record<string, ConditionPredicate<Context, Event>> = {
  isDoneAllowed: (ctx, { msg: { text } }, meta) => meta.state.matches('postings.account') && text === DONE && ctx.postings.length > 1,
  isDoneNotAllowed: (ctx, { msg: { text } }, meta) => meta.state.matches('postings.account') && text === DONE && ctx.postings.length < 2,
  isValidAccount: (ctx, e, meta) => meta.state.matches('postings.account'),
  isValidAmount: (ctx, { msg }, meta) => meta.state.matches('postings.amount') && isAmount(msg),
  isInvalidAmount: (ctx, { msg }, meta) => meta.state.matches('postings.amount') && !isAmount(msg),
  isConfirm: (ctx, { msg: { text } }) => text === CONFIRM,
  isNotConfirm: (ctx, { msg: { text } }) => text !== CONFIRM
}

const machine = createMachine<Context, Event>({
  id: 'newTransaction',
  initial: 'narration',
  states: {
    narration: {
      entry: ({ client, id }) => client.sendMessage(id, '🧾 Narration', NO_KEYBOARD),
      on: {
        ANSWER: [
          {
            actions: (ctx, { msg: { text } }) => {
              ctx.narration = text
              return ctx
            },
            target: 'postings'
          }
        ]
      }
    },
    postings: {
      initial: 'account',
      on: {
        ANSWER: [
          {
            cond: 'isDoneAllowed',
            target: 'confirm'
          },
          {
            cond: 'isDoneNotAllowed',
            actions: ({ client, id }) => client.sendMessage(id, '❗️ You must provide at least 2 accounts per transaction', CANCEL_KEYBOARD),
            target: '.account'
          },
          {
            cond: 'isValidAccount',
            actions: (ctx, { msg: { text } }) => {
              ctx.currentAccount = text
              return ctx
            },
            target: '.amount'
          },
          {
            cond: 'isValidAmount',
            actions: (ctx, { msg }) => {
              const posting = { account: ctx.currentAccount, amount: parseAmount(msg) } as Posting
              ctx.postings?.push(posting)
              ctx.currentAccount = undefined
              return ctx
            },
            target: '.account'
          },
          {
            cond: 'isInvalidAmount',
            actions: ({ client, id }) => client.sendMessage(id, '❗️ Expected a valid amount', CANCEL_KEYBOARD),
            target: '.amount'
          }
        ]
      },
      states: {
        account: {
          entry: ({ client, id, postings }) => client.sendMessage(id,
            postings.length > 1 ? `💳 Account (or ${DONE})` : '💳 Account',
            postings.length > 1 ? CANCEL_OR_DONE_KEYBOARD : CANCEL_KEYBOARD
          )
        },
        amount: { entry: ({ client, id }) => client.sendMessage(id, '💶 Amount', CANCEL_KEYBOARD) }
      }
    },
    confirm: {
      entry: (ctx) => {
        ctx.final = {
          type: 'Transaction',
          date: formatDate(new Date()),
          flag: '*',
          narration: ctx.narration!,
          postings: ctx.postings,
          meta: {}
        }

        ctx.client.sendMessage(ctx.id, confirmTransaction(ctx.final), { ...CONFIRM_KEYBOARD, ...PARSE_MK })
        return ctx
      },
      on: {
        ANSWER: [
          {
            cond: 'isConfirm',
            actions: async ({ client, id, final }) => {
              try {
                await putTransaction(final!)
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
    .map(({ account, amount }) => `_${escape(account)}_\`\t${amount}\``)
    .join('\n')
  r += '\n*Confirm?*'

  return r
}
