"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
const length_percentage_1 = require("../types/length-percentage");
var BACKGROUND_SIZE;
(function (BACKGROUND_SIZE) {
    BACKGROUND_SIZE["AUTO"] = "auto";
    BACKGROUND_SIZE["CONTAIN"] = "contain";
    BACKGROUND_SIZE["COVER"] = "cover";
})(BACKGROUND_SIZE = exports.BACKGROUND_SIZE || (exports.BACKGROUND_SIZE = {}));
exports.backgroundSize = {
    name: 'background-size',
    initialValue: '0',
    prefix: false,
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.LIST,
    parse: (tokens) => {
        return parser_1.parseFunctionArgs(tokens).map(values => values.filter(isBackgroundSizeInfoToken));
    }
};
const isBackgroundSizeInfoToken = (value) => parser_1.isIdentToken(value) || length_percentage_1.isLengthPercentage(value);
//# sourceMappingURL=background-size.js.map