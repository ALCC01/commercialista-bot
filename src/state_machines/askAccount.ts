import TelegramBot, { Message } from 'node-telegram-bot-api'
import { ConditionPredicate, createMachine, assign } from 'xstate'
import { DONE } from '../consts'
import { accountsKeyboard, CANCEL_KEYBOARD } from '../markup'

type Context = {
  id: number
  client: TelegramBot
  doneAllowed: boolean
  question?: string
  final?: string
  filter?: string
}

type Event = { type: 'ANSWER', msg: Message }

const guards: Record<string, ConditionPredicate<Context, Event>> = {
  isDoneAllowed: (ctx, { msg }) => ctx.doneAllowed && msg.text === DONE,
  isDoneNotAllowed: (ctx, { msg }) => ctx.doneAllowed && msg.text !== DONE
}

export default createMachine<Context, Event>({
  id: 'askAccount',
  initial: 'account',
  states: {
    account: {
      entry: ({ client, id, doneAllowed, question, filter }) => {
        const msg = question || (doneAllowed ? `💳 Account (or ${DONE})` : '💳 Account')
        client.sendMessage(id, msg, accountsKeyboard(doneAllowed, filter))
      },
      on: {
        ANSWER: [
          {
            cond: 'isDoneAllowed',
            target: 'done'
          },
          {
            cond: 'isDoneNotAllowed',
            actions: ({ client, id }) => client.sendMessage(id, '❗️ You must provide an account', CANCEL_KEYBOARD),
            target: 'account'
          },
          {
            actions: assign({ final: (ctx, { msg }) => msg.text! }),
            target: 'done'
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
