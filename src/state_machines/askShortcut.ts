import TelegramBot, { Message } from 'node-telegram-bot-api'
import { createMachine, assign, ConditionPredicate } from 'xstate'
import { CANCEL } from '../consts'
import { findShortcut, Shortcut, SHORTCUTS } from '../shortcuts'
import { chunks } from '../utils'

type Context = {
  id: number
  client: TelegramBot
  final?: Shortcut
}

type Event = { type: 'ANSWER', msg: Message }

const guards: Record<string, ConditionPredicate<Context, Event>> = {
  isValidShortcut: (ctx, { msg }) => !!findShortcut(msg.text!)
}

export default createMachine<Context, Event>({
  id: 'askShortcut',
  initial: 'shortcut',
  predictableActionArguments: true,
  states: {
    shortcut: {
      entry: ({ client, id }) => client.sendMessage(id, '💨 Choose a shortcut', shortcutsKeyboard()),
      on: {
        ANSWER: [
          {
            cond: 'isValidShortcut',
            actions: assign({ final: (ctx, { msg }) => findShortcut(msg.text!) }),
            target: 'done'
          },
          {
            actions: ({ client, id }) => client.sendMessage(id, '❗️ You must provide a valid shortcut', shortcutsKeyboard()),
            target: 'shortcut'
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

const shortcutsKeyboard = () => ({
  reply_markup: {
    resize_keyboard: true,
    keyboard: [
      [{ text: CANCEL }],
      ...chunks(SHORTCUTS.map(({ icon }) => ({ text: icon })), 3)
    ]
  }
})
