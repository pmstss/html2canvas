"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
exports.backgroundOrigin = {
    name: 'background-origin',
    initialValue: 'border-box',
    prefix: false,
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.LIST,
    parse: (tokens) => {
        return tokens.map(token => {
            if (parser_1.isIdentToken(token)) {
                switch (token.value) {
                    case 'padding-box':
                        return 1 /* PADDING_BOX */;
                    case 'content-box':
                        return 2 /* CONTENT_BOX */;
                }
            }
            return 0 /* BORDER_BOX */;
        });
    }
};
//# sourceMappingURL=background-origin.js.map