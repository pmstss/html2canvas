"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenizer_1 = require("../syntax/tokenizer");
const image_1 = require("../types/image");
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
exports.listStyleImage = {
    name: 'list-style-image',
    initialValue: 'none',
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.VALUE,
    prefix: false,
    parse: (token) => {
        if (token.type === tokenizer_1.TokenType.IDENT_TOKEN && token.value === 'none') {
            return null;
        }
        return image_1.image.parse(token);
    }
};
//# sourceMappingURL=list-style-image.js.map