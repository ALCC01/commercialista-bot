import TelegramBot, { Message } from 'node-telegram-bot-api'
import { ConditionPredicate, createMachine } from 'xstate'
import { CANCEL, CONFIRM } from '../consts'
import { CONFIRM_KEYBOARD, PARSE_MK } from '../markup'

type Context = {
  id: number
  client: TelegramBot
  question: string
  final?: string
}

type Event = { type: 'ANSWER', msg: Message }

const guards: Record<string, ConditionPredicate<Context, Event>> = {
  isConfirm: (ctx, { msg: { text } }) => text === CONFIRM,
  isNotConfirm: (ctx, { msg: { text } }) => text !== CONFIRM
}

export default createMachine<Context, Event>({
  id: 'askConfirm',
  initial: 'confirm',
  states: {
    confirm: {
      entry: ({ client, id, question }) => client.sendMessage(id, question, { ...CONFIRM_KEYBOARD, ...PARSE_MK }),
      on: {
        ANSWER: [
          {
            cond: 'isConfirm',
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
