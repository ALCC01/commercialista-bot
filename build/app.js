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
exports.ACCOUNTS = [];
start().catch(err => {
    console.error(err);
    process.exit(-1);
});
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        exports.ACCOUNTS = yield (0, fava_1.loadAccounts)();
        const allowedIds = process.env.ALLOWED_USER_IDS.split(',').map(Number).filter(e => !isNaN(e));
        const bot = new bot_1.default(process.env.TELEGRAM_TOKEN, { allowedIds });
        bot.start();
    });
}
