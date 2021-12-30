import { ParseMode } from 'node-telegram-bot-api'
import { CANCEL, CONFIRM, DONE, NEW_TRANSACTION } from './consts'

export const PARSE_MK = { parse_mode: 'MarkdownV2' as ParseMode }

export const DEFAULT_KEYBOARD = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [
      [{ text: NEW_TRANSACTION }]
    ]
  }
}

export const CONFIRM_KEYBOARD = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [
      [{ text: CONFIRM }, { text: CANCEL }]
    ]
  }
}

export const CANCEL_KEYBOARD = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [
      [{ text: CANCEL }]
    ]
  }
}

export const CANCEL_OR_DONE_KEYBOARD = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [
      [{ text: DONE }, { text: CANCEL }]
    ]
  }
}

export const NO_KEYBOARD = { reply_markup: { remove_keyboard: true } }
