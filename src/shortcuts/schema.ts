import { readFile } from 'fs/promises'
import { resolve } from 'path'

export type ShortcutPosting = {
  account: string
  amount: string
}

export type ShortcutQuestion =
  { var: string, type: 'account', question: string } |
  { var: string, type: 'amount', question: string }

export type ShortcutNarration = string | 'ask'

export type Shortcut = {
  name: string
  icon: string
  // payee: string | 'ask' | 'ignore'
  narration: ShortcutNarration
  script: ShortcutQuestion[]
  postings: ShortcutPosting[]
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
