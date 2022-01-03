import { readFile } from 'fs/promises'
import { resolve } from 'path'

type ShortcutPosting = {
  account: string | { type: 'var', var: string } | { type: 'evaluate', expr: string },
  amount: string | { type: 'var', var: string } | { type: 'evaluate', expr: string }
}

export type ShortcutQuestion =
  { var: string, type: 'account', question: string } |
  { var: string, type: 'amount', question: string }

export type Shortcut = {
  name: string
  icon: string
  // payee: string | 'ask' | 'ignore'
  narration: string | 'ask'
  script: ShortcutQuestion[]
  postings: ShortcutPosting[]
  allowMorePostings: boolean
}

export type ShortcutsFile = {
  shortcuts: Shortcut[]
}

const SHORTCUTS_FILE = resolve(process.env.SHORTCUTS_FILE || './shortcuts.json')
export let SHORTCUTS: Shortcut[] = []

export const loadShortcuts = async () => {
  const raw = await readFile(SHORTCUTS_FILE)

  SHORTCUTS = (JSON.parse(raw.toString()) as ShortcutsFile).shortcuts
}

export const findShortcut = (q: string) => SHORTCUTS.find(({ icon }) => icon === q)
