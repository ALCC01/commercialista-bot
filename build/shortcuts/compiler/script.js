"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildQuestions = void 0;
const xstate_1 = require("xstate");
const askAccount_1 = __importDefault(require("../../state_machines/askAccount"));
const askAmount_1 = __importDefault(require("../../state_machines/askAmount"));
const questionToState = (q, next) => {
    let node = {};
    if (q.type === 'amount') {
        node = {
            id: q.var,
            invoke: {
                id: 'askAmount',
                src: askAmount_1.default,
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client, question: q.question }),
                onDone: {
                    actions: (0, xstate_1.assign)({
                        variables: (ctx, { data }) => (Object.assign(Object.assign({}, ctx.variables), { [q.var]: data }))
                    }),
                    target: next
                }
            }
        };
    }
    if (q.type === 'account') {
        node = {
            id: q.var,
            invoke: {
                id: 'askAccount',
                src: askAccount_1.default,
                autoForward: true,
                data: (ctx) => ({ id: ctx.id, client: ctx.client, question: q.question, filter: q.filter }),
                onDone: {
                    actions: (0, xstate_1.assign)({
                        variables: (ctx, { data }) => (Object.assign(Object.assign({}, ctx.variables), { [q.var]: data }))
                    }),
                    target: next
                }
            }
        };
    }
    return [q.var, node];
};
const buildQuestions = (script) => {
    const node = {
        initial: script[0].var,
        states: {},
        onDone: { target: 'postings' }
    };
    node.states = Object.fromEntries(script.map((q, i, a) => {
        const next = i < script.length - 1 ? a[i + 1].var : 'done';
        return questionToState(q, next);
    }));
    node.states.done = { type: 'final' };
    return node;
};
exports.buildQuestions = buildQuestions;
