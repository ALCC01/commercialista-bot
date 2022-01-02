import TelegramBot, { Message } from 'node-telegram-bot-api'
import { ConditionPredicate, createMachine, assign } from 'xstate'
import { CANCEL_KEYBOARD } from '../markup'
import { isAmount, parseAmount } from '../utils'

type Context = {
  id: number
  client: TelegramBot
  final?: string
}

type Event = { type: 'ANSWER', msg: Message }

const guards: Record<string, ConditionPredicate<Context, Event>> = {
  isValidAmount: (ctx, { msg }) => isAmount(msg),
  isInvalidAmount: (ctx, { msg }) => !isAmount(msg)
}

export default createMachine<Context, Event>({
  id: 'askAmount',
  initial: 'amount',
  states: {
    amount: {
      entry: ({ client, id }) => client.sendMessage(id, '💶 Amount', CANCEL_KEYBOARD),
      on: {
        ANSWER: [
          {
            cond: 'isValidAmount',
            actions: assign<Context, Event>({ final: (ctx, { msg }) => parseAmount(msg) }),
            target: 'done'
          },
          {
            cond: 'isInvalidAmount',
            actions: ({ client, id }) => client.sendMessage(id, '❗️ Expected a valid amount', CANCEL_KEYBOARD),
            target: 'amount'
          }
        ]
      }
    },
    done: {
      type: 'final',
      data: ctx => ctx.final
    }
  }
}).withConfig({
  guards
})
