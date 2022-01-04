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
exports.ACCOUNTS = void 0;
require("dotenv/config");
const bot_1 = __importDefault(require("./bot"));
const fava_1 = require("./fava");
const shortcuts_1 = require("./shortcuts");
const logging_1 = require("./logging");
const npmlog_1 = __importDefault(require("npmlog"));
exports.ACCOUNTS = [];
start().catch(err => {
    npmlog_1.default.error('fatal', 'Unexpected error:', err.message);
    npmlog_1.default.verbose('fatal', '', err);
    process.exit(-1);
});
function start() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        (0, logging_1.setupLogging)();
        npmlog_1.default.info('startup', 'Starting up commercialista-bot');
        npmlog_1.default.info('startup', `Fava instance is ${process.env.FAVA_PRIVATE}`);
        const ledgerData = yield (0, fava_1.loadLedgerData)();
        exports.ACCOUNTS = ledgerData.accounts;
        npmlog_1.default.verbose('startup', `Found ${exports.ACCOUNTS.length} accounts`);
        process.env.DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || ledgerData.operatingCurrency[0] || 'EUR';
        npmlog_1.default.verbose('startup', `DEFAULT_CURRENCY is ${process.env.DEFAULT_CURRENCY}`);
        yield (0, shortcuts_1.loadShortcuts)();
        const allowedIds = ((_a = process.env.ALLOWED_USER_IDS) === null || _a === void 0 ? void 0 : _a.split(',').map(Number).filter(e => !isNaN(e))) || [];
        if (allowedIds.length === 0)
            npmlog_1.default.warn('startup', 'ALLOWED_USER_IDS is empty, nobody will be able to use this bot!');
        const bot = new bot_1.default(process.env.TELEGRAM_TOKEN, { allowedIds });
        bot.start();
        npmlog_1.default.info('startup', 'Bot is up and running!');
    });
}
