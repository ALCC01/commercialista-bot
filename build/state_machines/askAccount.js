"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xstate_1 = require("xstate");
const consts_1 = require("../consts");
const markup_1 = require("../markup");
const guards = {
    isDoneAllowed: (ctx, { msg }) => ctx.doneAllowed && msg.text === consts_1.DONE,
    isDoneNotAllowed: (ctx, { msg }) => ctx.doneAllowed && msg.text !== consts_1.DONE
};
exports.default = (0, xstate_1.createMachine)({
    id: 'askAccount',
    initial: 'account',
    states: {
        account: {
            entry: ({ client, id, doneAllowed }) => client.sendMessage(id, doneAllowed ? `💳 Account (or ${consts_1.DONE})` : '💳 Account', (0, markup_1.accountsKeyboard)(doneAllowed)),
            on: {
                ANSWER: [
                    {
                        cond: 'isDoneAllowed',
                        target: 'done'
                    },
                    {
                        cond: 'isDoneNotAllowed',
                        actions: ({ client, id }) => client.sendMessage(id, '❗️ You must provide an account', markup_1.CANCEL_KEYBOARD),
                        target: 'account'
                    },
                    {
                        actions: (0, xstate_1.assign)({ final: (ctx, { msg }) => msg.text }),
                        target: 'done'
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
