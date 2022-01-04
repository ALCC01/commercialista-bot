import 'dotenv/config'
import Bot from './bot'
import { loadLedgerData } from './fava'
import { loadShortcuts } from './shortcuts'

export let ACCOUNTS: string[] = []

start().catch(err => {
  console.error(err)
  process.exit(-1)
})

async function start () {
  const ledgerData = await loadLedgerData()
  ACCOUNTS = ledgerData.accounts
  process.env.DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || ledgerData.operatingCurrency[0] || 'EUR'

  await loadShortcuts()

  const allowedIds = process.env.ALLOWED_USER_IDS!.split(',').map(Number).filter(e => !isNaN(e))
  const bot = new Bot(process.env.TELEGRAM_TOKEN!, { allowedIds })

  bot.start()
}
