"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenizer_1 = require("../syntax/tokenizer");
const parser_1 = require("../syntax/parser");
const length_1 = require("./length");
exports.isLengthPercentage = (token) => token.type === tokenizer_1.TokenType.PERCENTAGE_TOKEN || length_1.isLength(token);
exports.parseLengthPercentageTuple = (tokens) => tokens.length > 1 ? [tokens[0], tokens[1]] : [tokens[0]];
exports.ZERO_LENGTH = {
    type: tokenizer_1.TokenType.NUMBER_TOKEN,
    number: 0,
    flags: tokenizer_1.FLAG_INTEGER
};
exports.FIFTY_PERCENT = {
    type: tokenizer_1.TokenType.PERCENTAGE_TOKEN,
    number: 50,
    flags: tokenizer_1.FLAG_INTEGER
};
exports.HUNDRED_PERCENT = {
    type: tokenizer_1.TokenType.PERCENTAGE_TOKEN,
    number: 100,
    flags: tokenizer_1.FLAG_INTEGER
};
exports.getAbsoluteValueForTuple = (tuple, width, height) => {
    let [x, y] = tuple;
    return [exports.getAbsoluteValue(x, width), exports.getAbsoluteValue(typeof y !== 'undefined' ? y : x, height)];
};
exports.getAbsoluteValue = (token, parent) => {
    if (token.type === tokenizer_1.TokenType.PERCENTAGE_TOKEN) {
        return (token.number / 100) * parent;
    }
    if (parser_1.isDimensionToken(token)) {
        switch (token.unit) {
            case 'rem':
            case 'em':
                return 16 * token.number; // TODO use correct font-size
            case 'px':
            default:
                return token.number;
        }
    }
    return token.number;
};
//# sourceMappingURL=length-percentage.js.map