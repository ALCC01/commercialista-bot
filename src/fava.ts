import axios from 'axios'
import logger from 'npmlog'

const ENDPOINT = process.env.FAVA_PRIVATE! + '/api'
export const FRONTEND = process.env.FAVA_PUBLIC || process.env.FAVA_PRIVATE!

// https://github.com/beancount/fava/blob/main/src/fava/serialisation.py#L69
export type Posting = {
  account: string
  amount: string
}

export type Transaction = {
  t: 'Transaction'
  date: string
  flag: '!' | '*'
  meta: {}
  payee?: string
  narration: string
  postings: Posting[]
  links: string[]
  tags: string[]
}

export type Balance = {
  t: 'Balance'
  date: string
  meta: {}
  account: string
  amount: {
    number: string
    currency: string
  }
}

export type Note = {
  t: 'Note'
  date: string
  meta: {}
  account: string
  comment: string
}

export type LedgerData = {
  accounts: string[]
  operatingCurrency: string[],
  raw: any
}

export async function loadLedgerData (): Promise<LedgerData> {
  const { data } = await axios({
    method: 'GET',
    url: process.env.FAVA_PRIVATE! + '/income_statement/'
  })

  try {
    const raw = JSON.parse(data.match(/<script .+ id="ledger-data">({(.|\n)*})<\/script>\n\s{4}/)[1])

    return {
      accounts: raw.accounts,
      operatingCurrency: raw.options.operating_currency,
      raw
    }
  } catch (err) {
    logger.error('fatal', 'Failed to load ledger data from Fava', (err as any).message)
    process.exit(-1)
  }
}

type Entry = Transaction | Balance | Note

export async function putEntries (e: Entry[]) {
  try {
    const a = await axios({
      method: 'PUT',
      url: ENDPOINT + '/add_entries',
      data: { entries: e }
    })

    const { success, error } = await a.data
    if (!success) {
      logger.error('fava', 'Failed PUT /add_entries', error)
      throw new Error('Failed PUT /add_entries: ' + error)
    }
  } catch (err) {
    logger.error('fava', 'Failed PUT /add_entries', (err as any).message)
    throw new Error('Failed PUT /add_entries: ' + (err as any).message)
  }
}

export async function getErrors (): Promise<number> {
  try {
    const a = await axios({
      method: 'GET',
      url: ENDPOINT + '/errors'
    })

    const { success, error, data } = await a.data

    if (!success) {
      logger.error('fava', 'Failed GET /errors', error)
      throw new Error('Failed GET /errors: ' + error)
    }
    return data as number
  } catch (err) {
    logger.error('fava', 'Failed GET /errors', (err as any).message)
    throw new Error('Failed GET /errors: ' + (err as any).message)
  }
}
