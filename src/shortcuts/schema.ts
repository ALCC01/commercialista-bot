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
  $schema?: string
  shortcuts: Shortcut[]
}
