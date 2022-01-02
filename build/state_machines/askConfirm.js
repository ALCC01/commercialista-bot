"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xstate_1 = require("xstate");
const consts_1 = require("../consts");
const markup_1 = require("../markup");
const guards = {
    isConfirm: (ctx, { msg: { text } }) => text === consts_1.CONFIRM,
    isNotConfirm: (ctx, { msg: { text } }) => text !== consts_1.CONFIRM
};
exports.default = (0, xstate_1.createMachine)({
    id: 'askConfirm',
    initial: 'confirm',
    states: {
        confirm: {
            entry: ({ client, id, question }) => client.sendMessage(id, question, Object.assign(Object.assign({}, markup_1.CONFIRM_KEYBOARD), markup_1.PARSE_MK)),
            on: {
                ANSWER: [
                    {
                        cond: 'isConfirm',
                        target: 'done'
                    },
                    {
                        cond: 'isNotConfirm',
                        actions: ({ client, id }) => client.sendMessage(id, `❗️ Expected ${consts_1.CONFIRM} or ${consts_1.CANCEL}`, markup_1.CONFIRM_KEYBOARD),
                        target: 'confirm'
                    }
                ]
            }
        },
        done: {
            type: 'final'
        }
    }
}).withConfig({
    guards
});
