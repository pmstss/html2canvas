"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
const tokenizer_1 = require("../syntax/tokenizer");
exports.counterIncrement = {
    name: 'counter-increment',
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
        const increments = [];
        const filtered = tokens.filter(parser_1.nonWhiteSpace);
        for (let i = 0; i < filtered.length; i++) {
            const counter = filtered[i];
            const next = filtered[i + 1];
            if (counter.type === tokenizer_1.TokenType.IDENT_TOKEN) {
                const increment = next && parser_1.isNumberToken(next) ? next.number : 1;
                increments.push({ counter: counter.value, increment });
            }
        }
        return increments;
    }
};
//# sourceMappingURL=counter-increment.js.map