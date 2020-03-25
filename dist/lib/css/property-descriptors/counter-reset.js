"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
exports.counterReset = {
    name: 'counter-reset',
    initialValue: 'none',
    prefix: true,
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.LIST,
    parse: (tokens) => {
        if (tokens.length === 0) {
            return [];
        }
        const resets = [];
        const filtered = tokens.filter(parser_1.nonWhiteSpace);
        for (let i = 0; i < filtered.length; i++) {
            const counter = filtered[i];
            const next = filtered[i + 1];
            if (parser_1.isIdentToken(counter) && counter.value !== 'none') {
                const reset = next && parser_1.isNumberToken(next) ? next.number : 0;
                resets.push({ counter: counter.value, reset });
            }
        }
        return resets;
    }
};
//# sourceMappingURL=counter-reset.js.map