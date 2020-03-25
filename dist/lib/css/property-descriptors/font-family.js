"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const tokenizer_1 = require("../syntax/tokenizer");
exports.fontFamily = {
    name: `font-family`,
    initialValue: '',
    prefix: false,
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.LIST,
    parse: (tokens) => {
        return tokens.filter(isStringToken).map(token => token.value);
    }
};
const isStringToken = (token) => token.type === tokenizer_1.TokenType.STRING_TOKEN || token.type === tokenizer_1.TokenType.IDENT_TOKEN;
//# sourceMappingURL=font-family.js.map