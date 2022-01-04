"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPostings = void 0;
const xstate_1 = require("xstate");
const replaceVariables = (str, variables) => {
    for (const [k, v] of Object.entries(variables)) {
        str = str.replaceAll(k, v);
    }
    return str;
};
const evaluatePosting = ({ account, amount }, variables) => {
    return {
        account: replaceVariables(account, variables),
        amount: replaceVariables(amount, variables)
    };
};
const buildPostings = (postings) => {
    return {
        always: {
            actions: (0, xstate_1.assign)({ postings: ctx => ctx.shortcut.postings.map(p => evaluatePosting(p, ctx.variables)) }),
            target: 'done'
        }
    };
};
exports.buildPostings = buildPostings;
