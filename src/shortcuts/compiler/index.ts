import TelegramBot, { Message } from 'node-telegram-bot-api'
import { createMachine, MachineConfig, StateMachine, StateNodeConfig } from 'xstate'
import { Posting } from '../../fava'
import { Shortcut } from '../schema'
import { buildNarration } from './narration'
import { buildPostings } from './postings'
import { buildQuestions } from './script'

export type Context = {
  id: number
  client: TelegramBot
  shortcut?: Shortcut
  narration?: string
  payee?: string
  variables?: { [key: string]: string }
  postings?: Posting[]
}

type Event = { type: 'ANSWER', msg: Message }

export type StateNode = StateNodeConfig<Context, any, Event>

export type CompiledShortcut = StateMachine<Context, any, Event>

export const buildShortcut = (shortcut: Shortcut): CompiledShortcut => {
  const prototype: MachineConfig<Context, any, Event> = {
    id: shortcut.name,
    initial: 'narration',
    predictableActionArguments: true,
    states: {
      done: {
        type: 'final',
        data: (ctx) => ctx
      }
    }
  }

  prototype.states!.narration = buildNarration(shortcut.narration, shortcut.payee)
  prototype.states!.questions = buildQuestions(shortcut.script)
  prototype.states!.postings = buildPostings(shortcut.postings)

  return createMachine(prototype)
}
