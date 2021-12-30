// https://github.com/beancount/fava/blob/main/src/fava/serialisation.py#L69
export type Posting = {
  account: string
  amount: string
}

export type Transaction = {
  type: 'Transaction'
  payee?: string
  narration: string
  postings: Posting[]
}
