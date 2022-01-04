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
exports.getShortcutMachine = exports.findShortcut = exports.loadShortcuts = exports.SHORTCUTS = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const ajv_1 = __importDefault(require("ajv"));
const shortcuts_schema_json_1 = __importDefault(require("./shortcuts.schema.json"));
const compiler_1 = require("./compiler");
const SHORTCUTS_FILE = (0, path_1.resolve)(process.env.SHORTCUTS_FILE || './shortcuts.json');
exports.SHORTCUTS = [];
let COMPILED_SHORTCUTS = {};
const validate = new ajv_1.default().compile(shortcuts_schema_json_1.default);
const loadShortcuts = () => __awaiter(void 0, void 0, void 0, function* () {
    const raw = yield (0, promises_1.readFile)(SHORTCUTS_FILE);
    const json = JSON.parse(raw.toString());
    if (!validate(json)) {
        throw validate.errors;
    }
    exports.SHORTCUTS = json.shortcuts;
    COMPILED_SHORTCUTS = Object.fromEntries(exports.SHORTCUTS.map(s => [s.icon, (0, compiler_1.buildShortcut)(s)]));
});
exports.loadShortcuts = loadShortcuts;
const findShortcut = (q) => exports.SHORTCUTS.find(({ icon }) => icon === q);
exports.findShortcut = findShortcut;
const getShortcutMachine = (q) => COMPILED_SHORTCUTS[q];
exports.getShortcutMachine = getShortcutMachine;
