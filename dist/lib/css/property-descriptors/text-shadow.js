"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
const length_percentage_1 = require("../types/length-percentage");
const color_1 = require("../types/color");
const length_1 = require("../types/length");
exports.textShadow = {
    name: 'text-shadow',
    initialValue: 'none',
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (tokens) => {
        if (tokens.length === 1 && parser_1.isIdentWithValue(tokens[0], 'none')) {
            return [];
        }
        return parser_1.parseFunctionArgs(tokens).map((values) => {
            const shadow = {
                color: color_1.COLORS.TRANSPARENT,
                offsetX: length_percentage_1.ZERO_LENGTH,
                offsetY: length_percentage_1.ZERO_LENGTH,
                blur: length_percentage_1.ZERO_LENGTH
            };
            let c = 0;
            for (let i = 0; i < values.length; i++) {
                const token = values[i];
                if (length_1.isLength(token)) {
                    if (c === 0) {
                        shadow.offsetX = token;
                    }
                    else if (c === 1) {
                        shadow.offsetY = token;
                    }
                    else {
                        shadow.blur = token;
                    }
                    c++;
                }
                else {
                    shadow.color = color_1.color.parse(token);
                }
            }
            return shadow;
        });
    }
};
//# sourceMappingURL=text-shadow.js.map