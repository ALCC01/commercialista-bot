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
const markup_1 = require("../markup");
const askShortcut_1 = __importDefault(require("./askShortcut"));
const fava_1 = require("../fava");
const askConfirm_1 = __importDefault(require("./askConfirm"));
const newTransaction_1 = require("./newTransaction");
const utils_1 = require("../utils");
const shortcuts_1 = require("../shortcuts");
const machine = (0, xstate_1.createMachine)({
    id: 'useShortcut',
    initial: 'choose',
    states: {
        choose: {
            invoke: {
                id: 'askShortcut',
                src: askShortcut_1.default,
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client, doneAllowed: false }),
                onDone: {
                    actions: (0, xstate_1.assign)({ shortcut: (ctx, { data }) => data }),
                    target: 'run'
                }
            }
        },
        run: {
            invoke: {
                id: 'runShortcut',
                src: (ctx) => (0, shortcuts_1.getShortcutMachine)(ctx.shortcut.icon),
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client, shortcut: ctx.shortcut }),
                onDone: {
                    actions: (0, xstate_1.assign)({ data: (ctx, { data }) => data }),
                    target: 'confirm'
                }
            }
        },
        confirm: {
            entry: (0, xstate_1.assign)({
                final: ({ data }) => ({
                    type: 'Transaction',
                    date: (0, utils_1.formatDate)(new Date()),
                    flag: '*',
                    narration: data.narration,
                    payee: data.payee,
                    postings: data.postings,
                    meta: {}
                })
            }),
            invoke: {
                id: 'askConfirm',
                src: askConfirm_1.default,
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client, question: (0, newTransaction_1.confirmTransaction)(ctx.final) }),
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
        client
    };
    const service = (0, xstate_1.interpret)(machine.withContext(context));
    service.start();
    return service;
};
