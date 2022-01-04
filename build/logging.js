"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLogging = void 0;
const npmlog_1 = __importDefault(require("npmlog"));
const setupLogging = () => {
    npmlog_1.default.level = (process.env.LOG_LEVEL || 'info').toLowerCase();
    npmlog_1.default.maxRecordSize = 1000;
};
exports.setupLogging = setupLogging;
