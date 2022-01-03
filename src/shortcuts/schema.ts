export type ShortcutPosting = {
  account: string
  amount: string
}

export type ShortcutQuestion =
  { var: string, type: 'account', question: string, filter?: string } |
  { var: string, type: 'amount', question: string }

export type ShortcutNarration = string | 'ask'

export type ShortcutPayee = string | 'ask' | 'ignore'

export type Shortcut = {
  name: string
  icon: string
  payee: ShortcutPayee
  narration: ShortcutNarration
  script: ShortcutQuestion[]
  postings: ShortcutPosting[]
}

export type ShortcutsFile = {
  $schema?: string
  shortcuts: Shortcut[]
}
