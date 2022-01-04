"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildShortcut = void 0;
const xstate_1 = require("xstate");
const narration_1 = require("./narration");
const postings_1 = require("./postings");
const script_1 = require("./script");
const buildShortcut = (shortcut) => {
    const prototype = {
        id: shortcut.name,
        initial: 'narration',
        states: {
            done: {
                type: 'final',
                data: (ctx) => ctx
            }
        }
    };
    prototype.states.narration = (0, narration_1.buildNarration)(shortcut.narration, shortcut.payee);
    prototype.states.questions = (0, script_1.buildQuestions)(shortcut.script);
    prototype.states.postings = (0, postings_1.buildPostings)(shortcut.postings);
    return (0, xstate_1.createMachine)(prototype);
};
exports.buildShortcut = buildShortcut;
