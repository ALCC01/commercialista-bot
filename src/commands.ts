import { BotCommand } from 'node-telegram-bot-api'

const commands: BotCommand[] = [
  {
    command: 'cancel',
    description: '🚫 Cancel any current operation'
  }
]

export default commands
