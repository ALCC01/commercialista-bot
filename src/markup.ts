import { ParseMode } from 'node-telegram-bot-api'
import { ACCOUNTS } from './app'
import { CANCEL, CONFIRM, DONE, GET_ERRORS, NEW_BALANCE, NEW_NOTE, NEW_TRANSACTION } from './consts'

export const PARSE_MK = { parse_mode: 'MarkdownV2' as ParseMode }

export const DEFAULT_KEYBOARD = {
  reply_markup: {
    resize_keyboard: true,
    keyboard: [
      [{ text: NEW_TRANSACTION }],
      [{ text: NEW_BALANCE }, { text: NEW_NOTE }, { text: GET_ERRORS }]
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

export const accountsKeyboard = (done: boolean) => ({
  reply_markup: {
    resize_keyboard: true,
    keyboard: [
      done ? [{ text: DONE }, { text: CANCEL }] : [{ text: CANCEL }],
      ...(ACCOUNTS.map(e => [{ text: e }]))
    ]
  }
})
