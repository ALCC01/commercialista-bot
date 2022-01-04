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
exports.confirmTransaction = void 0;
const xstate_1 = require("xstate");
const fava_1 = require("../fava");
const markup_1 = require("../markup");
const utils_1 = require("../utils");
const askAccount_1 = __importDefault(require("./askAccount"));
const askAmount_1 = __importDefault(require("./askAmount"));
const askConfirm_1 = __importDefault(require("./askConfirm"));
const askNarration_1 = __importDefault(require("./askNarration"));
const machine = (0, xstate_1.createMachine)({
    id: 'newTransaction',
    initial: 'narration',
    states: {
        narration: {
            invoke: {
                id: 'askNarration',
                src: askNarration_1.default,
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client, askPayee: true, askNarration: true }),
                onDone: {
                    actions: (0, xstate_1.assign)({
                        narration: (ctx, { data }) => data.narration,
                        payee: (ctx, { data }) => data.payee
                    }),
                    target: 'account'
                }
            }
        },
        account: {
            invoke: {
                id: 'askAccount',
                src: askAccount_1.default,
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client, doneAllowed: ctx.postings.length >= 2 }),
                onDone: [
                    {
                        cond: (ctx, { data }) => data === undefined,
                        target: 'confirm'
                    },
                    {
                        actions: (0, xstate_1.assign)({ currentAccount: (ctx, { data }) => data }),
                        target: 'amount'
                    }
                ]
            }
        },
        amount: {
            invoke: {
                id: 'askAmount',
                src: askAmount_1.default,
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client }),
                onDone: {
                    actions: (0, xstate_1.assign)({
                        postings: (ctx, { data }) => [...ctx.postings, { account: ctx.currentAccount, amount: data }],
                        currentAccount: () => undefined
                    }),
                    target: 'account'
                }
            }
        },
        confirm: {
            entry: (0, xstate_1.assign)({
                final: ctx => ({
                    type: 'Transaction',
                    date: (0, utils_1.formatDate)(new Date()),
                    flag: '*',
                    narration: ctx.narration,
                    payee: ctx.payee,
                    postings: ctx.postings,
                    meta: {}
                })
            }),
            invoke: {
                id: 'askConfirm',
                src: askConfirm_1.default,
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client, question: confirmTransaction(ctx.final) }),
                onDone: {
                    actions: ({ client, id, final }) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            yield (0, fava_1.putEntries)([final]);
                            yield client.sendMessage(id, '✅ All done!', markup_1.DEFAULT_KEYBOARD);
                        }
                        catch (err) {
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
        client,
        postings: []
    };
    const service = (0, xstate_1.interpret)(machine.withContext(context));
    service.start();
    return service;
};
function confirmTransaction({ payee, narration, postings }) {
    let r = `🧾 ${payee ? `*${(0, utils_1.escape)(payee)}* ${(0, utils_1.escape)(narration)}` : `*${(0, utils_1.escape)(narration)}*`}\n\n`;
    r += postings
        .map(({ account, amount }) => `_${(0, utils_1.escape)(account)}_\`\t${(0, utils_1.escape)(amount)}\``)
        .join('\n');
    r += '\n*Confirm?*';
    return r;
}
exports.confirmTransaction = confirmTransaction;
