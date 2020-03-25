"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
const length_percentage_1 = require("../types/length-percentage");
exports.backgroundPosition = {
    name: 'background-position',
    initialValue: '0% 0%',
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.LIST,
    prefix: false,
    parse: (tokens) => {
        return parser_1.parseFunctionArgs(tokens)
            .map((values) => values.filter(length_percentage_1.isLengthPercentage))
            .map(length_percentage_1.parseLengthPercentageTuple);
    }
};
//# sourceMappingURL=background-position.js.map