"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const consts_1 = require("./consts");
const markup_1 = require("./markup");
const npmlog_1 = __importDefault(require("npmlog"));
const newTransaction_1 = __importDefault(require("./state_machines/newTransaction"));
const newBalance_1 = __importDefault(require("./state_machines/newBalance"));
const newNote_1 = __importDefault(require("./state_machines/newNote"));
const getErrors_1 = __importDefault(require("./state_machines/getErrors"));
const useShortcut_1 = __importDefault(require("./state_machines/useShortcut"));
class Bot {
    constructor(token, { allowedIds }) {
        this._client = new node_telegram_bot_api_1.default(token, { polling: true });
        this._allowedIds = allowedIds;
        this._machines = {};
        this._client.on('error', err => npmlog_1.default.error('bot', 'Bot error:', err.message));
        this._client.on('polling_error', err => npmlog_1.default.error('bot', 'Polling error: ', err.message));
    }
    isAllowed(id) {
        return this._allowedIds.indexOf(id) !== -1;
    }
    start() {
        this._client.on('text', msg => {
            if (!this.isAllowed(msg.chat.id)) {
                npmlog_1.default.info('bot', `User ${msg.chat.id} (${msg.chat.username}) tried using this bot`);
                return this._client.sendMessage(msg.chat.id, '⛔ User not allowed', markup_1.NO_KEYBOARD);
            }
            if (msg.text === consts_1.CANCEL || msg.text === '/cancel') {
                this._machines[msg.chat.id] = undefined;
                return this._client.sendMessage(msg.chat.id, '✅ Cancelled', markup_1.DEFAULT_KEYBOARD);
            }
            try {
                if (this._machines[msg.chat.id]) {
                    const state = this._machines[msg.chat.id].send({ type: 'ANSWER', msg });
                    if (state.done)
                        this._machines[msg.chat.id] = undefined;
                    return;
                }
                switch (msg.text) {
                    case consts_1.NEW_TRANSACTION:
                        this._machines[msg.chat.id] = (0, newTransaction_1.default)(msg, this._client);
                        break;
                    case consts_1.NEW_BALANCE:
                        this._machines[msg.chat.id] = (0, newBalance_1.default)(msg, this._client);
                        break;
                    case consts_1.NEW_NOTE:
                        this._machines[msg.chat.id] = (0, newNote_1.default)(msg, this._client);
                        break;
                    case consts_1.GET_ERRORS:
                        this._machines[msg.chat.id] = (0, getErrors_1.default)(msg, this._client);
                        break;
                    case consts_1.USE_SHORTCUT:
                        this._machines[msg.chat.id] = (0, useShortcut_1.default)(msg, this._client);
                        break;
                    default:
                        return this._client.sendMessage(msg.chat.id, '👋 Hi there!', markup_1.DEFAULT_KEYBOARD);
                }
            }
            catch (err) {
                npmlog_1.default.error('bot', 'Unexpected error processing a message:', err.message);
                this._machines[msg.chat.id] = undefined;
                this._client.sendMessage(msg.chat.id, '❗️ Unexpected error', markup_1.DEFAULT_KEYBOARD);
            }
        });
    }
}
exports.default = Bot;
