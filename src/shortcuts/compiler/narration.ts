import { assign } from 'xstate'
import { StateNode } from '.'
import { NO_KEYBOARD } from '../../markup'
import { ShortcutNarration } from '../schema'

export const buildNarration = (narration: ShortcutNarration): StateNode => {
  if (narration === 'ask') {
    // TODO Decompose this into a machine in common with newTransaction
    return {
      entry: ({ client, id }) => client.sendMessage(id, '🧾 Narration', NO_KEYBOARD),
      on: {
        ANSWER: {
          actions: assign({ narration: (ctx, { msg }) => msg.text! }),
          target: 'questions'
        }
      }
    }
  } else {
    return {
      always: {
        actions: assign({ narration: ctx => ctx.shortcut!.narration }),
        target: 'questions'
      }
    }
  }
}
