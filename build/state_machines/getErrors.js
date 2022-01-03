"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xstate_1 = require("xstate");
const fava_1 = require("../fava");
const markup_1 = require("../markup");
const machine = (0, xstate_1.createMachine)({
    id: 'getErrors',
    initial: 'get',
    states: {
        get: {
            invoke: {
                id: 'fetchErrors',
                src: () => (0, fava_1.getErrors)(),
                onDone: {
                    actions: ({ id, client }, { data }) => {
                        const msg = data > 0
                            ? `❗️ Found *${data}* [errors](${fava_1.FRONTEND}/errors/)`
                            : '✅ Everything alright\\! Found *0* errors';
                        client.sendMessage(id, msg, Object.assign(Object.assign({}, markup_1.DEFAULT_KEYBOARD), markup_1.PARSE_MK));
                    },
                    target: 'done'
                },
                onError: {
                    actions: ({ id, client }, { data }) => {
                        console.error(data);
                        client.sendMessage(id, '❗️ Unexpected error', markup_1.DEFAULT_KEYBOARD);
                    },
                    target: 'done'
                }
            }
        },
        done: {
            type: 'final'
        }
    }
});
exports.default = (msg, client) => {
    const context = {
        id: msg.chat.id,
        client
    };
    const service = (0, xstate_1.interpret)(machine.withContext(context));
    service.start();
    return service;
};
