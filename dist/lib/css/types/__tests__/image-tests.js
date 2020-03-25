"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const parser_1 = require("../../syntax/parser");
const image_1 = require("../image");
const color_1 = require("../color");
const tokenizer_1 = require("../../syntax/tokenizer");
const angle_1 = require("../angle");
const parse = (value) => image_1.image.parse(parser_1.Parser.parseValue(value));
const colorParse = (value) => color_1.color.parse(parser_1.Parser.parseValue(value));
jest.mock('../../../core/cache-storage');
jest.mock('../../../core/features');
describe('types', () => {
    describe('<image>', () => {
        describe('parsing', () => {
            describe('url', () => {
                it('url(test.jpg)', () => assert_1.deepStrictEqual(parse('url(http://example.com/test.jpg)'), {
                    url: 'http://example.com/test.jpg',
                    type: image_1.CSSImageType.URL
                }));
                it('url("test.jpg")', () => assert_1.deepStrictEqual(parse('url("http://example.com/test.jpg")'), {
                    url: 'http://example.com/test.jpg',
                    type: image_1.CSSImageType.URL
                }));
            });
            describe('linear-gradient', () => {
                it('linear-gradient(#f69d3c, #3f87a6)', () => assert_1.deepStrictEqual(parse('linear-gradient(#f69d3c, #3f87a6)'), {
                    angle: angle_1.deg(180),
                    type: image_1.CSSImageType.LINEAR_GRADIENT,
                    stops: [
                        { color: color_1.pack(0xf6, 0x9d, 0x3c, 1), stop: null },
                        { color: color_1.pack(0x3f, 0x87, 0xa6, 1), stop: null }
                    ]
                }));
                it('linear-gradient(yellow, blue)', () => assert_1.deepStrictEqual(parse('linear-gradient(yellow, blue)'), {
                    angle: angle_1.deg(180),
                    type: image_1.CSSImageType.LINEAR_GRADIENT,
                    stops: [{ color: colorParse('yellow'), stop: null }, { color: colorParse('blue'), stop: null }]
                }));
                it('linear-gradient(to bottom, yellow, blue)', () => assert_1.deepStrictEqual(parse('linear-gradient(to bottom, yellow, blue)'), {
                    angle: angle_1.deg(180),
                    type: image_1.CSSImageType.LINEAR_GRADIENT,
                    stops: [{ color: colorParse('yellow'), stop: null }, { color: colorParse('blue'), stop: null }]
                }));
                it('linear-gradient(180deg, yellow, blue)', () => assert_1.deepStrictEqual(parse('linear-gradient(180deg, yellow, blue)'), {
                    angle: angle_1.deg(180),
                    type: image_1.CSSImageType.LINEAR_GRADIENT,
                    stops: [{ color: colorParse('yellow'), stop: null }, { color: colorParse('blue'), stop: null }]
                }));
                it('linear-gradient(to top, blue, yellow)', () => assert_1.deepStrictEqual(parse('linear-gradient(to top, blue, yellow)'), {
                    angle: 0,
                    type: image_1.CSSImageType.LINEAR_GRADIENT,
                    stops: [{ color: colorParse('blue'), stop: null }, { color: colorParse('yellow'), stop: null }]
                }));
                it('linear-gradient(to top right, blue, yellow)', () => assert_1.deepStrictEqual(parse('linear-gradient(to top right, blue, yellow)'), {
                    angle: [
                        { type: tokenizer_1.TokenType.PERCENTAGE_TOKEN, number: 100, flags: 4 },
                        { type: tokenizer_1.TokenType.NUMBER_TOKEN, number: 0, flags: 4 }
                    ],
                    type: image_1.CSSImageType.LINEAR_GRADIENT,
                    stops: [{ color: colorParse('blue'), stop: null }, { color: colorParse('yellow'), stop: null }]
                }));
                it('linear-gradient(to bottom, yellow 0%, blue 100%)', () => assert_1.deepStrictEqual(parse('linear-gradient(to bottom, yellow 0%, blue 100%)'), {
                    angle: angle_1.deg(180),
                    type: image_1.CSSImageType.LINEAR_GRADIENT,
                    stops: [
                        {
                            color: colorParse('yellow'),
                            stop: {
                                type: tokenizer_1.TokenType.PERCENTAGE_TOKEN,
                                number: 0,
                                flags: tokenizer_1.FLAG_INTEGER
                            }
                        },
                        {
                            color: colorParse('blue'),
                            stop: {
                                type: tokenizer_1.TokenType.PERCENTAGE_TOKEN,
                                number: 100,
                                flags: tokenizer_1.FLAG_INTEGER
                            }
                        }
                    ]
                }));
                it('linear-gradient(to top left, lightpink, lightpink 5px, white 5px, white 10px)', () => assert_1.deepStrictEqual(parse('linear-gradient(to top left, lightpink, lightpink 5px, white 5px, white 10px)'), {
                    angle: [
                        { type: tokenizer_1.TokenType.PERCENTAGE_TOKEN, number: 100, flags: 4 },
                        { type: tokenizer_1.TokenType.PERCENTAGE_TOKEN, number: 100, flags: 4 }
                    ],
                    type: image_1.CSSImageType.LINEAR_GRADIENT,
                    stops: [
                        { color: colorParse('lightpink'), stop: null },
                        {
                            color: colorParse('lightpink'),
                            stop: {
                                type: tokenizer_1.TokenType.DIMENSION_TOKEN,
                                number: 5,
                                flags: tokenizer_1.FLAG_INTEGER,
                                unit: 'px'
                            }
                        },
                        {
                            color: colorParse('white'),
                            stop: {
                                type: tokenizer_1.TokenType.DIMENSION_TOKEN,
                                number: 5,
                                flags: tokenizer_1.FLAG_INTEGER,
                                unit: 'px'
                            }
                        },
                        {
                            color: colorParse('white'),
                            stop: {
                                type: tokenizer_1.TokenType.DIMENSION_TOKEN,
                                number: 10,
                                flags: tokenizer_1.FLAG_INTEGER,
                                unit: 'px'
                            }
                        }
                    ]
                }));
            });
            describe('-prefix-linear-gradient', () => {
                it('-webkit-linear-gradient(left, #cedbe9 0%, #aac5de 17%, #3a8bc2 84%, #26558b 100%)', () => assert_1.deepStrictEqual(parse('-webkit-linear-gradient(left, #cedbe9 0%, #aac5de 17%, #3a8bc2 84%, #26558b 100%)'), {
                    angle: angle_1.deg(90),
                    type: image_1.CSSImageType.LINEAR_GRADIENT,
                    stops: [
                        {
                            color: colorParse('#cedbe9'),
                            stop: {
                                type: tokenizer_1.TokenType.PERCENTAGE_TOKEN,
                                number: 0,
                                flags: tokenizer_1.FLAG_INTEGER
                            }
                        },
                        {
                            color: colorParse('#aac5de'),
                            stop: {
                                type: tokenizer_1.TokenType.PERCENTAGE_TOKEN,
                                number: 17,
                                flags: tokenizer_1.FLAG_INTEGER
                            }
                        },
                        {
                            color: colorParse('#3a8bc2'),
                            stop: {
                                type: tokenizer_1.TokenType.PERCENTAGE_TOKEN,
                                number: 84,
                                flags: tokenizer_1.FLAG_INTEGER
                            }
                        },
                        {
                            color: colorParse('#26558b'),
                            stop: {
                                type: tokenizer_1.TokenType.PERCENTAGE_TOKEN,
                                number: 100,
                                flags: tokenizer_1.FLAG_INTEGER
                            }
                        }
                    ]
                }));
                it('-moz-linear-gradient(top, #cce5f4 0%, #00263c 100%)', () => assert_1.deepStrictEqual(parse('-moz-linear-gradient(top, #cce5f4 0%, #00263c 100%)'), {
                    angle: angle_1.deg(180),
                    type: image_1.CSSImageType.LINEAR_GRADIENT,
                    stops: [
                        {
                            color: colorParse('#cce5f4'),
                            stop: {
                                type: tokenizer_1.TokenType.PERCENTAGE_TOKEN,
                                number: 0,
                                flags: tokenizer_1.FLAG_INTEGER
                            }
                        },
                        {
                            color: colorParse('#00263c'),
                            stop: {
                                type: tokenizer_1.TokenType.PERCENTAGE_TOKEN,
                                number: 100,
                                flags: tokenizer_1.FLAG_INTEGER
                            }
                        }
                    ]
                }));
            });
        });
    });
});
//# sourceMappingURL=image-tests.js.map