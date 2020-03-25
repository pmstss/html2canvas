"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
exports.fontVariant = {
    name: 'font-variant',
    initialValue: 'none',
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (tokens) => {
        return tokens.filter(parser_1.isIdentToken).map(token => token.value);
    }
};
//# sourceMappingURL=font-variant.js.map