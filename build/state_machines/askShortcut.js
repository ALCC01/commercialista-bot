"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xstate_1 = require("xstate");
const consts_1 = require("../consts");
const shortcuts_1 = require("../shortcuts");
const utils_1 = require("../utils");
const guards = {
    isValidShortcut: (ctx, { msg }) => !!(0, shortcuts_1.findShortcut)(msg.text)
};
exports.default = (0, xstate_1.createMachine)({
    id: 'askShortcut',
    initial: 'shortcut',
    states: {
        shortcut: {
            entry: ({ client, id }) => client.sendMessage(id, '💨 Choose a shortcut', shortcutsKeyboard()),
            on: {
                ANSWER: [
                    {
                        cond: 'isValidShortcut',
                        actions: (0, xstate_1.assign)({ final: (ctx, { msg }) => (0, shortcuts_1.findShortcut)(msg.text) }),
                        target: 'done'
                    },
                    {
                        actions: ({ client, id }) => client.sendMessage(id, '❗️ You must provide a valid shortcut', shortcutsKeyboard()),
                        target: 'shortcut'
                    }
                ]
            }
        },
        done: {
            type: 'final',
            data: ctx => ctx.final
        }
    }
}).withConfig({
    guards
});
const shortcutsKeyboard = () => ({
    reply_markup: {
        resize_keyboard: true,
        keyboard: [
            [{ text: consts_1.CANCEL }],
            ...(0, utils_1.chunks)(shortcuts_1.SHORTCUTS.map(({ icon }) => ({ text: icon })), 3)
        ]
    }
});
