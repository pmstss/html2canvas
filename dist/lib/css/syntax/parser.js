"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenizer_1 = require("./tokenizer");
class Parser {
    constructor(tokens) {
        this._tokens = tokens;
    }
    static create(value) {
        const tokenizer = new tokenizer_1.Tokenizer();
        tokenizer.write(value);
        return new Parser(tokenizer.read());
    }
    static parseValue(value) {
        return Parser.create(value).parseComponentValue();
    }
    static parseValues(value) {
        return Parser.create(value).parseComponentValues();
    }
    parseComponentValue() {
        let token = this.consumeToken();
        while (token.type === tokenizer_1.TokenType.WHITESPACE_TOKEN) {
            token = this.consumeToken();
        }
        if (token.type === tokenizer_1.TokenType.EOF_TOKEN) {
            throw new SyntaxError(`Error parsing CSS component value, unexpected EOF`);
        }
        this.reconsumeToken(token);
        const value = this.consumeComponentValue();
        do {
            token = this.consumeToken();
        } while (token.type === tokenizer_1.TokenType.WHITESPACE_TOKEN);
        if (token.type === tokenizer_1.TokenType.EOF_TOKEN) {
            return value;
        }
        throw new SyntaxError(`Error parsing CSS component value, multiple values found when expecting only one`);
    }
    parseComponentValues() {
        const values = [];
        while (true) {
            let value = this.consumeComponentValue();
            if (value.type === tokenizer_1.TokenType.EOF_TOKEN) {
                return values;
            }
            values.push(value);
            values.push();
        }
    }
    consumeComponentValue() {
        const token = this.consumeToken();
        switch (token.type) {
            case tokenizer_1.TokenType.LEFT_CURLY_BRACKET_TOKEN:
            case tokenizer_1.TokenType.LEFT_SQUARE_BRACKET_TOKEN:
            case tokenizer_1.TokenType.LEFT_PARENTHESIS_TOKEN:
                return this.consumeSimpleBlock(token.type);
            case tokenizer_1.TokenType.FUNCTION_TOKEN:
                return this.consumeFunction(token);
        }
        return token;
    }
    consumeSimpleBlock(type) {
        const block = { type, values: [] };
        let token = this.consumeToken();
        while (true) {
            if (token.type === tokenizer_1.TokenType.EOF_TOKEN || isEndingTokenFor(token, type)) {
                return block;
            }
            this.reconsumeToken(token);
            block.values.push(this.consumeComponentValue());
            token = this.consumeToken();
        }
    }
    consumeFunction(functionToken) {
        const cssFunction = {
            name: functionToken.value,
            values: [],
            type: tokenizer_1.TokenType.FUNCTION
        };
        while (true) {
            const token = this.consumeToken();
            if (token.type === tokenizer_1.TokenType.EOF_TOKEN || token.type === tokenizer_1.TokenType.RIGHT_PARENTHESIS_TOKEN) {
                return cssFunction;
            }
            this.reconsumeToken(token);
            cssFunction.values.push(this.consumeComponentValue());
        }
    }
    consumeToken() {
        const token = this._tokens.shift();
        return typeof token === 'undefined' ? tokenizer_1.EOF_TOKEN : token;
    }
    reconsumeToken(token) {
        this._tokens.unshift(token);
    }
}
exports.Parser = Parser;
exports.isDimensionToken = (token) => token.type === tokenizer_1.TokenType.DIMENSION_TOKEN;
exports.isNumberToken = (token) => token.type === tokenizer_1.TokenType.NUMBER_TOKEN;
exports.isIdentToken = (token) => token.type === tokenizer_1.TokenType.IDENT_TOKEN;
exports.isStringToken = (token) => token.type === tokenizer_1.TokenType.STRING_TOKEN;
exports.isIdentWithValue = (token, value) => exports.isIdentToken(token) && token.value === value;
exports.nonWhiteSpace = (token) => token.type !== tokenizer_1.TokenType.WHITESPACE_TOKEN;
exports.nonFunctionArgSeparator = (token) => token.type !== tokenizer_1.TokenType.WHITESPACE_TOKEN && token.type !== tokenizer_1.TokenType.COMMA_TOKEN;
exports.parseFunctionArgs = (tokens) => {
    const args = [];
    let arg = [];
    tokens.forEach(token => {
        if (token.type === tokenizer_1.TokenType.COMMA_TOKEN) {
            if (arg.length === 0) {
                throw new Error(`Error parsing function args, zero tokens for arg`);
            }
            args.push(arg);
            arg = [];
            return;
        }
        if (token.type !== tokenizer_1.TokenType.WHITESPACE_TOKEN) {
            arg.push(token);
        }
    });
    if (arg.length) {
        args.push(arg);
    }
    return args;
};
const isEndingTokenFor = (token, type) => {
    if (type === tokenizer_1.TokenType.LEFT_CURLY_BRACKET_TOKEN && token.type === tokenizer_1.TokenType.RIGHT_CURLY_BRACKET_TOKEN) {
        return true;
    }
    if (type === tokenizer_1.TokenType.LEFT_SQUARE_BRACKET_TOKEN && token.type === tokenizer_1.TokenType.RIGHT_SQUARE_BRACKET_TOKEN) {
        return true;
    }
    return type === tokenizer_1.TokenType.LEFT_PARENTHESIS_TOKEN && token.type === tokenizer_1.TokenType.RIGHT_PARENTHESIS_TOKEN;
};
//# sourceMappingURL=parser.js.map