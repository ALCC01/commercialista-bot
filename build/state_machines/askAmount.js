"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xstate_1 = require("xstate");
const markup_1 = require("../markup");
const utils_1 = require("../utils");
const guards = {
    isValidAmount: (ctx, { msg }) => (0, utils_1.isAmount)(msg),
    isInvalidAmount: (ctx, { msg }) => !(0, utils_1.isAmount)(msg)
};
exports.default = (0, xstate_1.createMachine)({
    id: 'askAmount',
    initial: 'amount',
    states: {
        amount: {
            entry: ({ client, id }) => client.sendMessage(id, '💶 Amount', markup_1.CANCEL_KEYBOARD),
            on: {
                ANSWER: [
                    {
                        cond: 'isValidAmount',
                        actions: (0, xstate_1.assign)({ final: (ctx, { msg }) => (0, utils_1.parseAmount)(msg) }),
                        target: 'done'
                    },
                    {
                        cond: 'isInvalidAmount',
                        actions: ({ client, id }) => client.sendMessage(id, '❗️ Expected a valid amount', markup_1.CANCEL_KEYBOARD),
                        target: 'amount'
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
