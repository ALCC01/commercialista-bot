import axios from 'axios'
const ENDPOINT = process.env.FAVA_ENDPOINT! + '/api'

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

export async function putTransaction (txn: Transaction) {
  const a = await axios({
    method: 'PUT',
    url: ENDPOINT + '/add_entries',
    data: { entries: [txn] }
  })

  const { success, error } = await a.data
  if (!success) throw new Error('Failed PUT /add_entries: ' + error)
}
