"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
const parser_1 = require("../syntax/parser");
var BACKGROUND_REPEAT;
(function (BACKGROUND_REPEAT) {
    BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT"] = 0] = "REPEAT";
    BACKGROUND_REPEAT[BACKGROUND_REPEAT["NO_REPEAT"] = 1] = "NO_REPEAT";
    BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT_X"] = 2] = "REPEAT_X";
    BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT_Y"] = 3] = "REPEAT_Y";
})(BACKGROUND_REPEAT = exports.BACKGROUND_REPEAT || (exports.BACKGROUND_REPEAT = {}));
exports.backgroundRepeat = {
    name: 'background-repeat',
    initialValue: 'repeat',
    prefix: false,
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.LIST,
    parse: (tokens) => {
        return parser_1.parseFunctionArgs(tokens)
            .map(values => values
            .filter(parser_1.isIdentToken)
            .map(token => token.value)
            .join(' '))
            .map(parseBackgroundRepeat);
    }
};
const parseBackgroundRepeat = (value) => {
    switch (value) {
        case 'no-repeat':
            return BACKGROUND_REPEAT.NO_REPEAT;
        case 'repeat-x':
        case 'repeat no-repeat':
            return BACKGROUND_REPEAT.REPEAT_X;
        case 'repeat-y':
        case 'no-repeat repeat':
            return BACKGROUND_REPEAT.REPEAT_Y;
        case 'repeat':
        default:
            return BACKGROUND_REPEAT.REPEAT;
    }
};
//# sourceMappingURL=background-repeat.js.map