import 'dotenv/config'
import Bot from './bot'

start().catch(err => {
  console.error(err)
  process.exit(-1)
})

async function start () {
  const allowedIds = process.env.ALLOWED_USER_IDS!.split(',').map(Number).filter(e => !isNaN(e))
  const bot = new Bot(process.env.TELEGRAM_TOKEN!, { allowedIds })
  await bot.start()
}
