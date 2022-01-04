"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunks = exports.escape = exports.formatDate = exports.isAmount = exports.parseAmount = exports.getEntityText = void 0;
const getEntityText = (text, { offset, length }, exclude = false) => text.substring(exclude ? offset + 1 : offset, offset + length);
exports.getEntityText = getEntityText;
const parseCurrency = ({ text, entities }) => {
    if (text.indexOf('€') !== -1)
        return 'EUR';
    if (text.indexOf('£') !== -1)
        return 'GBP';
    if (!entities && text.indexOf('$') !== -1)
        return 'USD';
    const cashtags = entities ? entities.filter(({ type }) => type === 'cashtag').map(e => (0, exports.getEntityText)(text, e, true)) : text.match(/[A-Z]{3}/) || [];
    return cashtags.length ? cashtags[0] : (process.env.DEFAULT_CURRENCY || 'EUR');
};
const parseAmount = (message) => {
    const curr = parseCurrency(message);
    const int = parseFloat(message.text.replace(',', '.').replace(/[^\d.-]/g, ''));
    return `${int.toFixed(2)} ${curr}`;
};
exports.parseAmount = parseAmount;
const isAmount = ({ text }) => !isNaN(parseFloat(text.replace(',', '.').replace(/[^\d.-]/g, '')));
exports.isAmount = isAmount;
const pad = (n, length = 2, fill = '0') => String(n).padStart(length, fill);
const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
exports.formatDate = formatDate;
// https://core.telegram.org/bots/api#markdownv2-style
const ILLEGAL_CHARS = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
const escape = (text) => ILLEGAL_CHARS.reduce((txt, char) => txt.replaceAll(char, `\\${char}`), text);
exports.escape = escape;
const chunks = (a, size) => Array(Math.ceil(a.length / size))
    .fill(0)
    .map((_, i) => i * size)
    .map(begin => a.slice(begin, begin + size));
exports.chunks = chunks;
