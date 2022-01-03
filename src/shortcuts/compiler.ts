import TelegramBot, { Message } from 'node-telegram-bot-api'
import { assign, createMachine, DoneInvokeEvent, MachineConfig, StateMachine, StateNodeConfig } from 'xstate'
import askAccount from '../state_machines/askAccount'
import askAmount from '../state_machines/askAmount'
import { Shortcut, ShortcutQuestion } from './schema'

type Context = {
  id: number
  client: TelegramBot
  shortcut?: Shortcut
  variables?: { [key: string]: string }
}

type Event = { type: 'ANSWER', msg: Message }

const questionToState = (q: ShortcutQuestion, next: string): [string, StateNodeConfig<Context, any, Event>] => {
  let node: StateNodeConfig<Context, any, Event> = {}

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

export const buildQuestions = (script: ShortcutQuestion[]): StateNodeConfig<Context, any, Event> => {
  const node: StateNodeConfig<Context, any, Event> = {
    initial: script[0].var,
    states: {},
    onDone: { target: 'done' }
  }

  node.states = Object.fromEntries(script.map((q, i, a) => {
    const next = i < script.length - 1 ? a[i + 1].var : 'done'
    return questionToState(q, next)
  }))
  node.states.done = { type: 'final' }

  return node
}

export const buildShortcut = (shortcut: Shortcut): StateMachine<Context, any, Event> => {
  const prototype: MachineConfig<Context, any, Event> = {
    id: shortcut.name,
    initial: 'questions',
    states: {
      done: {
        type: 'final',
        data: (ctx) => ctx
      }
    }
  }

  prototype.states!.questions = buildQuestions(shortcut.script)

  return createMachine(prototype)
}
