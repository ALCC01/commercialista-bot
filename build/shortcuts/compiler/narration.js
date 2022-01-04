"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNarration = void 0;
const xstate_1 = require("xstate");
const askNarration_1 = __importDefault(require("../../state_machines/askNarration"));
const buildNarration = (narration, payee) => {
    if (narration !== 'ask' && payee !== 'ask') {
        return {
            always: {
                actions: (0, xstate_1.assign)({
                    narration: (ctx) => narration,
                    payee: (ctx) => payee !== 'ignore' ? payee : undefined
                }),
                target: 'questions'
            }
        };
    }
    return {
        invoke: {
            id: 'askNarration',
            src: askNarration_1.default,
            autoForward: true,
            data: ({ id, client }) => {
                const askPayee = payee === 'ask';
                const askNarration = narration === 'ask';
                const n = !askNarration ? narration : undefined;
                const p = !askPayee && payee !== 'ignore' ? payee : undefined;
                return { id, client, askPayee, askNarration, narration: n, payee: p };
            },
            onDone: {
                actions: (0, xstate_1.assign)({
                    narration: (ctx, { data }) => data.narration,
                    payee: (ctx, { data }) => data.payee
                }),
                target: 'questions'
            }
        }
    };
};
exports.buildNarration = buildNarration;
