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
exports.getErrors = exports.putEntries = exports.loadLedgerData = exports.FRONTEND = void 0;
const axios_1 = __importDefault(require("axios"));
const npmlog_1 = __importDefault(require("npmlog"));
const ENDPOINT = process.env.FAVA_PRIVATE + '/api';
exports.FRONTEND = process.env.FAVA_PUBLIC || process.env.FAVA_PRIVATE;
function loadLedgerData() {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield (0, axios_1.default)({
            method: 'GET',
            url: process.env.FAVA_PRIVATE + '/income_statement/'
        });
        try {
            const raw = JSON.parse(data.match(/<script .+ id="ledger-data">(.+)<\/script>/)[1]);
            return {
                accounts: raw.accounts,
                operatingCurrency: raw.options.operating_currency,
                raw
            };
        }
        catch (err) {
            npmlog_1.default.error('fatal', 'Failed to load ledger data from Fava', err.message);
            process.exit(-1);
        }
    });
}
exports.loadLedgerData = loadLedgerData;
function putEntries(e) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const a = yield (0, axios_1.default)({
                method: 'PUT',
                url: ENDPOINT + '/add_entries',
                data: { entries: e }
            });
            const { success, error } = yield a.data;
            if (!success) {
                npmlog_1.default.error('fava', 'Failed PUT /add_entries', error);
                throw new Error('Failed PUT /add_entries: ' + error);
            }
        }
        catch (err) {
            npmlog_1.default.error('fava', 'Failed PUT /add_entries', err.message);
            throw new Error('Failed PUT /add_entries: ' + err.message);
        }
    });
}
exports.putEntries = putEntries;
function getErrors() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const a = yield (0, axios_1.default)({
                method: 'GET',
                url: ENDPOINT + '/errors'
            });
            const { success, error, data } = yield a.data;
            if (!success) {
                npmlog_1.default.error('fava', 'Failed GET /errors', error);
                throw new Error('Failed GET /errors: ' + error);
            }
            return data;
        }
        catch (err) {
            npmlog_1.default.error('fava', 'Failed GET /errors', err.message);
            throw new Error('Failed GET /errors: ' + err.message);
        }
    });
}
exports.getErrors = getErrors;
