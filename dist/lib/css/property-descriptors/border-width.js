"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
const borderWidthForSide = (side) => ({
    name: `border-${side}-width`,
    initialValue: '0',
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.VALUE,
    prefix: false,
    parse: (token) => {
        if (parser_1.isDimensionToken(token)) {
            return token.number;
        }
        return 0;
    }
});
exports.borderTopWidth = borderWidthForSide('top');
exports.borderRightWidth = borderWidthForSide('right');
exports.borderBottomWidth = borderWidthForSide('bottom');
exports.borderLeftWidth = borderWidthForSide('left');
//# sourceMappingURL=border-width.js.map