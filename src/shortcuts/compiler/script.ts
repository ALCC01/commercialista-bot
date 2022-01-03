import { assign, DoneInvokeEvent } from 'xstate'
import { StateNode, Context } from '.'
import askAccount from '../../state_machines/askAccount'
import askAmount from '../../state_machines/askAmount'
import { ShortcutQuestion } from '../schema'

const questionToState = (q: ShortcutQuestion, next: string): [string, StateNode] => {
  let node: StateNode = {}

  if (q.type === 'amount') {
    node = {
      id: q.var,
      invoke: {
        id: 'askAmount',
        src: askAmount,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client, question: q.question }),
        onDone: {
          actions: assign<Context, DoneInvokeEvent<any>>({
            variables: (ctx, { data }) => ({ ...ctx.variables, ...{ [q.var]: data } })
          }),
          target: next
        }
      }
    }
  }
  if (q.type === 'account') {
    node = {
      id: q.var,
      invoke: {
        id: 'askAccount',
        src: askAccount,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client, question: q.question }),
        onDone: {
          actions: assign<Context, DoneInvokeEvent<any>>({
            variables: (ctx, { data }) => ({ ...ctx.variables, ...{ [q.var]: data } })
          }),
          target: next
        }
      }
    }
  }

  return [q.var, node]
}

export const buildQuestions = (script: ShortcutQuestion[]): StateNode => {
  const node: StateNode = {
    initial: script[0].var,
    states: {},
    onDone: { target: 'postings' }
  }

  node.states = Object.fromEntries(script.map((q, i, a) => {
    const next = i < script.length - 1 ? a[i + 1].var : 'done'
    return questionToState(q, next)
  }))
  node.states.done = { type: 'final' }

  return node
}
