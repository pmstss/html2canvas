"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
const tokenizer_1 = require("../syntax/tokenizer");
exports.zIndex = {
    name: 'z-index',
    initialValue: 'auto',
    prefix: false,
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.VALUE,
    parse: (token) => {
        if (token.type === tokenizer_1.TokenType.IDENT_TOKEN) {
            return { auto: true, order: 0 };
        }
        if (parser_1.isNumberToken(token)) {
            return { auto: false, order: token.number };
        }
        throw new Error(`Invalid z-index number parsed`);
    }
};
//# sourceMappingURL=z-index.js.map