"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const tokenizer_1 = require("../tokenizer");
const tokenize = (value) => {
    const tokenizer = new tokenizer_1.Tokenizer();
    tokenizer.write(value);
    return tokenizer.read();
};
describe('tokenizer', () => {
    describe('<ident>', () => {
        it('auto', () => assert_1.deepEqual(tokenize('auto'), [{ type: tokenizer_1.TokenType.IDENT_TOKEN, value: 'auto' }]));
        it('url', () => assert_1.deepEqual(tokenize('url'), [{ type: tokenizer_1.TokenType.IDENT_TOKEN, value: 'url' }]));
        it('auto test', () => assert_1.deepEqual(tokenize('auto        test'), [
            { type: tokenizer_1.TokenType.IDENT_TOKEN, value: 'auto' },
            { type: tokenizer_1.TokenType.WHITESPACE_TOKEN },
            { type: tokenizer_1.TokenType.IDENT_TOKEN, value: 'test' }
        ]));
    });
    describe('<url-token>', () => {
        it('url(test.jpg)', () => assert_1.deepEqual(tokenize('url(test.jpg)'), [{ type: tokenizer_1.TokenType.URL_TOKEN, value: 'test.jpg' }]));
        it('url("test.jpg")', () => assert_1.deepEqual(tokenize('url("test.jpg")'), [{ type: tokenizer_1.TokenType.URL_TOKEN, value: 'test.jpg' }]));
        it("url('test.jpg')", () => assert_1.deepEqual(tokenize("url('test.jpg')"), [{ type: tokenizer_1.TokenType.URL_TOKEN, value: 'test.jpg' }]));
    });
});
//# sourceMappingURL=tokernizer-tests.js.map