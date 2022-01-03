import { assign } from 'xstate'
import { StateNode } from '.'
import { Posting } from '../../fava'
import { ShortcutPosting } from '../schema'

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

export const buildPostings = (postings: ShortcutPosting[]): StateNode => {
  return {
    always: {
      actions: assign({ postings: ctx => ctx.shortcut!.postings.map(p => evaluatePosting(p, ctx.variables!)) }),
      target: 'done'
    }
  }
}
