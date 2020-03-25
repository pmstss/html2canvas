"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenizer_1 = require("../syntax/tokenizer");
const image_1 = require("../types/image");
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
exports.backgroundImage = {
    name: 'background-image',
    initialValue: 'none',
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (tokens) => {
        if (tokens.length === 0) {
            return [];
        }
        const first = tokens[0];
        if (first.type === tokenizer_1.TokenType.IDENT_TOKEN && first.value === 'none') {
            return [];
        }
        return tokens.filter(value => parser_1.nonFunctionArgSeparator(value) && image_1.isSupportedImage(value)).map(image_1.image.parse);
    }
};
//# sourceMappingURL=background-image.js.map