"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
const tokenizer_1 = require("../syntax/tokenizer");
exports.quotes = {
    name: 'quotes',
    initialValue: 'none',
    prefix: true,
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.LIST,
    parse: (tokens) => {
        if (tokens.length === 0) {
            return null;
        }
        const first = tokens[0];
        if (first.type === tokenizer_1.TokenType.IDENT_TOKEN && first.value === 'none') {
            return null;
        }
        const quotes = [];
        const filtered = tokens.filter(parser_1.isStringToken);
        if (filtered.length % 2 !== 0) {
            return null;
        }
        for (let i = 0; i < filtered.length; i += 2) {
            const open = filtered[i].value;
            const close = filtered[i + 1].value;
            quotes.push({ open, close });
        }
        return quotes;
    }
};
exports.getQuote = (quotes, depth, open) => {
    if (!quotes) {
        return '';
    }
    const quote = quotes[Math.min(depth, quotes.length - 1)];
    if (!quote) {
        return '';
    }
    return open ? quote.open : quote.close;
};
//# sourceMappingURL=quotes.js.map