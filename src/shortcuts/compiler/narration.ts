import { assign, DoneInvokeEvent } from 'xstate'
import { Context, StateNode } from '.'
import askNarration from '../../state_machines/askNarration'
import { ShortcutNarration, ShortcutPayee } from '../schema'

export const buildNarration = (narration: ShortcutNarration, payee: ShortcutPayee): StateNode => {
  if (narration !== 'ask' && payee !== 'ask') {
    return {
      always: {
        actions: assign({
          narration: (ctx) => narration,
          payee: (ctx) => payee !== 'ignore' ? payee : undefined
        }),
        target: 'questions'
      }
    }
  }

  return {
    invoke: {
      id: 'askNarration',
      src: askNarration,
      autoForward: true,
      data: ({ id, client }) => {
        const askPayee = payee === 'ask'
        const askNarration = narration === 'ask'
        const n = !askNarration ? narration : undefined
        const p = !askPayee && payee !== 'ignore' ? payee : undefined
        return { id, client, askPayee, askNarration, narration: n, payee: p }
      },
      onDone: {
        actions: assign<Context, DoneInvokeEvent<any>>({
          narration: (ctx, { data }) => data.narration,
          payee: (ctx, { data }) => data.payee
        }),
        target: 'questions'
      }
    }
  }
}
