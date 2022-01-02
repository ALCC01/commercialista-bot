import axios from 'axios'
const ENDPOINT = process.env.FAVA_PRIVATE! + '/api'
export const FRONTEND = process.env.FAVA_PUBLIC || process.env.FAVA_PRIVATE!

// https://github.com/beancount/fava/blob/main/src/fava/serialisation.py#L69
export type Posting = {
  account: string
  amount: string
}

export type Transaction = {
  type: 'Transaction'
  date: string
  flag: '!' | '*'
  meta: {}
  payee?: string
  narration: string
  postings: Posting[]
}

export type Balance = {
  type: 'Balance'
  date: string
  meta: {}
  account: string
  amount: {
    number: string
    currency: string
  }
}

export type Note = {
  type: 'Note'
  date: string
  meta: {}
  account: string
  comment: string
}

export async function loadAccounts () {
  const { data } = await axios({
    method: 'GET',
    url: process.env.FAVA_PRIVATE! + '/income_statement/'
  })

  return JSON.parse(data.match(/<script .+ id="ledger-data">(.+)<\/script>/)[1]).accounts as string[]
}

type Entry = Transaction | Balance | Note

export async function putEntries (e: Entry[]) {
  const a = await axios({
    method: 'PUT',
    url: ENDPOINT + '/add_entries',
    data: { entries: e }
  })

  const { success, error } = await a.data
  if (!success) throw new Error('Failed PUT /add_entries: ' + error)
}

export async function getErrors (): Promise<number> {
  const a = await axios({
    method: 'GET',
    url: ENDPOINT + '/errors'
  })

  const { success, error, data } = await a.data
  if (!success) throw new Error('Failed PUT /add_entries: ' + error)
  return data as number
}
