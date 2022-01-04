"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountsKeyboard = exports.NO_KEYBOARD = exports.CANCEL_OR_DONE_KEYBOARD = exports.CANCEL_KEYBOARD = exports.CONFIRM_KEYBOARD = exports.DEFAULT_KEYBOARD = exports.PARSE_MK = void 0;
const app_1 = require("./app");
const consts_1 = require("./consts");
exports.PARSE_MK = { parse_mode: 'MarkdownV2' };
exports.DEFAULT_KEYBOARD = {
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [{ text: consts_1.NEW_TRANSACTION }],
            [{ text: consts_1.NEW_BALANCE }, { text: consts_1.NEW_NOTE }, { text: consts_1.GET_ERRORS }],
            [{ text: consts_1.USE_SHORTCUT }]
        ]
    }
};
exports.CONFIRM_KEYBOARD = {
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [{ text: consts_1.CONFIRM }, { text: consts_1.CANCEL }]
        ]
    }
};
exports.CANCEL_KEYBOARD = {
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [{ text: consts_1.CANCEL }]
        ]
    }
};
exports.CANCEL_OR_DONE_KEYBOARD = {
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [{ text: consts_1.DONE }, { text: consts_1.CANCEL }]
        ]
    }
};
exports.NO_KEYBOARD = { reply_markup: { remove_keyboard: true } };
const accountsKeyboard = (done, filter) => ({
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            done ? [{ text: consts_1.DONE }, { text: consts_1.CANCEL }] : [{ text: consts_1.CANCEL }],
            ...(app_1.ACCOUNTS.filter(e => e.startsWith(filter || '')).map(e => [{ text: e }]))
        ]
    }
});
exports.accountsKeyboard = accountsKeyboard;
