import TelegramBot, { Message } from 'node-telegram-bot-api'
import { assign, createMachine } from 'xstate'
import { NO_KEYBOARD } from '../markup'

type Context = {
  id: number
  client: TelegramBot
  question?: string
  narration?: string
  payee?: string
  askPayee?: boolean
  askNarration: boolean
}

type Event = { type: 'ANSWER', msg: Message }

export default createMachine<Context, Event>({
  id: 'askNarration',
  initial: 'narration',
  predictableActionArguments: true,
  states: {
    narration: {
      entry: ({ client, id, askPayee, askNarration }) => {
        let msg = ''
        if (askNarration && askPayee) msg = '🧾 Narration and payee'
        if (askNarration && !askPayee) msg = '🧾 Narration'
        if (askPayee && !askNarration) msg = '🧾 Payee'
        client.sendMessage(id, msg, NO_KEYBOARD)
      },
      on: {
        ANSWER: {
          actions: assign((ctx, { msg: { text } }) => {
            if (!ctx.askPayee) return { ...ctx, narration: text! }
            if (!ctx.askNarration) return { ...ctx, payee: text! }

            const [a, ...b] = text!.split(':')
            if (b.length === 0) return { ...ctx, narration: a }

            return {
              ...ctx,
              payee: a.trim(),
              narration: b.join(':').trim()
            }
          }),
          target: 'done'
        }
      }
    },
    done: {
      type: 'final',
      data: ctx => ({
        payee: ctx.payee,
        narration: ctx.narration
      })
    }
  }
})
