"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xstate_1 = require("xstate");
const fava_1 = require("../fava");
const markup_1 = require("../markup");
const utils_1 = require("../utils");
const askAccount_1 = __importDefault(require("./askAccount"));
const askAmount_1 = __importDefault(require("./askAmount"));
const askConfirm_1 = __importDefault(require("./askConfirm"));
const machine = (0, xstate_1.createMachine)({
    id: 'newBalance',
    initial: 'account',
    states: {
        account: {
            invoke: {
                id: 'askAccount',
                src: askAccount_1.default,
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client, doneAllowed: false }),
                onDone: {
                    actions: (0, xstate_1.assign)({ account: (ctx, { data }) => data }),
                    target: 'amount'
                }
            }
        },
        amount: {
            invoke: {
                id: 'askAmount',
                src: askAmount_1.default,
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client }),
                onDone: {
                    actions: (0, xstate_1.assign)({ amount: (ctx, { data }) => data }),
                    target: 'confirm'
                }
            }
        },
        confirm: {
            entry: (0, xstate_1.assign)({
                final: ctx => {
                    const [number, currency] = ctx.amount.split(' ');
                    const final = {
                        type: 'Balance',
                        date: (0, utils_1.formatDate)(new Date()),
                        account: ctx.account,
                        amount: { number, currency },
                        meta: {}
                    };
                    return final;
                }
            }),
            invoke: {
                id: 'askConfirm',
                src: askConfirm_1.default,
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client, question: confirmBalance(ctx.final) }),
                onDone: {
                    actions: ({ client, id, final }) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            yield (0, fava_1.putEntries)([final]);
                            yield client.sendMessage(id, '✅ All done!', markup_1.DEFAULT_KEYBOARD);
                        }
                        catch (err) {
                            console.error(err);
                            yield client.sendMessage(id, '❗️ Unexpected error', markup_1.DEFAULT_KEYBOARD);
                        }
                    }),
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
const confirmBalance = ({ account, amount: { number, currency } }) => {
    return `📊 *${(0, utils_1.escape)(account)}*\n\nBalance: \`${(0, utils_1.escape)(`${number} ${currency}`)}\`\n\n*Confirm?*`;
};
