import 'dotenv/config'
import Bot from './bot'
import { loadLedgerData } from './fava'
import { loadShortcuts } from './shortcuts'
import { setupLogging } from './logging'
import logger from 'npmlog'

export let ACCOUNTS: string[] = []

start().catch(err => {
  logger.error('fatal', 'Unexpected error:', err.message)
  logger.verbose('fatal', '', err)
  process.exit(-1)
})

async function start () {
  setupLogging()
  logger.info('startup', 'Starting up commercialista-bot')

  logger.info('startup', `Fava instance is ${process.env.FAVA_PRIVATE}`)
  const ledgerData = await loadLedgerData()
  ACCOUNTS = ledgerData.accounts
  logger.verbose('startup', `Found ${ACCOUNTS.length} accounts`)

  process.env.DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || ledgerData.operatingCurrency[0] || 'EUR'
  logger.verbose('startup', `DEFAULT_CURRENCY is ${process.env.DEFAULT_CURRENCY}`)

  await loadShortcuts()

  const allowedIds = process.env.ALLOWED_USER_IDS?.split(',').map(Number).filter(e => !isNaN(e)) || []
  if (allowedIds.length === 0) logger.warn('startup', 'ALLOWED_USER_IDS is empty, nobody will be able to use this bot!')

  const bot = new Bot(process.env.TELEGRAM_TOKEN!, { allowedIds })
  bot.start()

  logger.info('startup', 'Bot is up and running!')
}
