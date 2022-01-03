import TelegramBot, { Message } from 'node-telegram-bot-api'
import { assign, createMachine, DoneInvokeEvent, MachineConfig, StateMachine, StateNodeConfig } from 'xstate'
import { Posting } from '../fava'
import { NO_KEYBOARD } from '../markup'
import askAccount from '../state_machines/askAccount'
import askAmount from '../state_machines/askAmount'
import { Shortcut, ShortcutNarration, ShortcutPosting, ShortcutQuestion } from './schema'

type Context = {
  id: number
  client: TelegramBot
  shortcut?: Shortcut
  narration?: string
  variables?: { [key: string]: string }
  postings?: Posting[]
}

type Event = { type: 'ANSWER', msg: Message }

type StateNode = StateNodeConfig<Context, any, Event>

const questionToState = (q: ShortcutQuestion, next: string): [string, StateNode] => {
  let node: StateNode = {}

  if (q.type === 'amount') {
    node = {
      id: q.var,
      invoke: {
        id: 'askAmount',
        src: askAmount,
        autoForward: true,
        data: (ctx) => ({ id: ctx.id, client: ctx.client }),
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
        data: (ctx) => ({ id: ctx.id, client: ctx.client }),
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

const replaceVariables = (str: string, variables: { [key: string]: string }) => {
  for (const [k, v] of Object.entries(variables)) {
    str = str.replaceAll(k, v)
  }

  return str
}

const evaluatePosting = ({ account, amount }: ShortcutPosting, variables: { [key: string]: string }): Posting => {
  return {
    account: replaceVariables(account, variables),
    amount: replaceVariables(amount, variables)
  }
}

const buildPostings = (postings: ShortcutPosting[]): StateNode => {
  return {
    always: {
      actions: assign({ postings: ctx => ctx.shortcut!.postings.map(p => evaluatePosting(p, ctx.variables!)) }),
      target: 'done'
    }
  }
}

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

export const buildShortcut = (shortcut: Shortcut): StateMachine<Context, any, Event> => {
  const prototype: MachineConfig<Context, any, Event> = {
    id: shortcut.name,
    initial: 'narration',
    states: {
      done: {
        type: 'final',
        data: (ctx) => ctx
      }
    }
  }

  prototype.states!.narration = buildNarration(shortcut.narration)
  prototype.states!.questions = buildQuestions(shortcut.script)
  prototype.states!.postings = buildPostings(shortcut.postings)

  return createMachine(prototype)
}
