"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xstate_1 = require("xstate");
const markup_1 = require("../markup");
exports.default = (0, xstate_1.createMachine)({
    id: 'askNarration',
    initial: 'narration',
    states: {
        narration: {
            entry: ({ client, id, askPayee, askNarration }) => {
                let msg = '';
                if (askNarration && askPayee)
                    msg = '🧾 Narration and payee';
                if (askNarration && !askPayee)
                    msg = '🧾 Narration';
                if (askPayee && !askNarration)
                    msg = '🧾 Payee';
                client.sendMessage(id, msg, markup_1.NO_KEYBOARD);
            },
            on: {
                ANSWER: {
                    actions: (0, xstate_1.assign)((ctx, { msg: { text } }) => {
                        if (!ctx.askPayee)
                            return Object.assign(Object.assign({}, ctx), { narration: text });
                        if (!ctx.askNarration)
                            return Object.assign(Object.assign({}, ctx), { payee: text });
                        const [a, ...b] = text.split(':');
                        if (b.length === 0)
                            return Object.assign(Object.assign({}, ctx), { narration: a });
                        return Object.assign(Object.assign({}, ctx), { payee: a.trim(), narration: b.join(':').trim() });
                    }),
                    target: 'done'
                }
            }
        },
        done: {
            type: 'final',
            data: ctx => ({
                payee: ctx.payee,
                narration: ctx.narration
            })
        }
    }
});
