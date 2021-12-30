import 'dotenv/config'
import Bot from './bot'
import { loadAccounts } from './fava'

export let ACCOUNTS: string[] = []

start().catch(err => {
  console.error(err)
  process.exit(-1)
})

async function start () {
  ACCOUNTS = await loadAccounts()
  const allowedIds = process.env.ALLOWED_USER_IDS!.split(',').map(Number).filter(e => !isNaN(e))
  const bot = new Bot(process.env.TELEGRAM_TOKEN!, { allowedIds })
  bot.start()
}
