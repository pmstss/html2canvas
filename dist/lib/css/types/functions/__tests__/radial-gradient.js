"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const parser_1 = require("../../../syntax/parser");
const radial_gradient_1 = require("../radial-gradient");
const image_1 = require("../../image");
const color_1 = require("../../color");
const tokenizer_1 = require("../../../syntax/tokenizer");
const length_percentage_1 = require("../../length-percentage");
const parse = (value) => radial_gradient_1.radialGradient(parser_1.Parser.parseValues(value)[0].values);
const colorParse = (value) => color_1.color.parse(parser_1.Parser.parseValue(value));
describe('functions', () => {
    describe('radial-gradient', () => {
        describe('parsing', () => {
            it('radial-gradient(circle closest-side, #3f87a6, #ebf8e1, #f69d3c)', () => assert_1.deepStrictEqual(parse('radial-gradient(ellipse closest-side, #3f87a6, #ebf8e1, #f69d3c)'), {
                type: image_1.CSSImageType.RADIAL_GRADIENT,
                shape: image_1.CSSRadialShape.ELLIPSE,
                size: image_1.CSSRadialExtent.CLOSEST_SIDE,
                position: [],
                stops: [
                    { color: colorParse('#3f87a6'), stop: null },
                    { color: colorParse('#ebf8e1'), stop: null },
                    { color: colorParse('#f69d3c'), stop: null }
                ]
            }));
            it('radial-gradient(circle at center, red 0, blue, green 100%)', () => assert_1.deepStrictEqual(parse('radial-gradient(circle at center, red 0, blue, green 100%)'), {
                type: image_1.CSSImageType.RADIAL_GRADIENT,
                shape: image_1.CSSRadialShape.CIRCLE,
                size: image_1.CSSRadialExtent.FARTHEST_CORNER,
                position: [length_percentage_1.FIFTY_PERCENT],
                stops: [
                    { color: colorParse('red'), stop: { type: tokenizer_1.TokenType.NUMBER_TOKEN, number: 0, flags: 4 } },
                    { color: colorParse('blue'), stop: null },
                    { color: colorParse('green'), stop: { type: tokenizer_1.TokenType.PERCENTAGE_TOKEN, number: 100, flags: 4 } }
                ]
            }));
            it('radial-gradient(circle at 100%, #333, #333 50%, #eee 75%, #333 75%)', () => assert_1.deepStrictEqual(parse('radial-gradient(circle at 100%, #333, #333 50%, #eee 75%, #333 75%)'), {
                type: image_1.CSSImageType.RADIAL_GRADIENT,
                shape: image_1.CSSRadialShape.CIRCLE,
                size: image_1.CSSRadialExtent.FARTHEST_CORNER,
                position: [length_percentage_1.HUNDRED_PERCENT],
                stops: [
                    { color: colorParse('#333'), stop: null },
                    { color: colorParse('#333'), stop: { type: tokenizer_1.TokenType.PERCENTAGE_TOKEN, number: 50, flags: 4 } },
                    { color: colorParse('#eee'), stop: { type: tokenizer_1.TokenType.PERCENTAGE_TOKEN, number: 75, flags: 4 } },
                    { color: colorParse('#333'), stop: { type: tokenizer_1.TokenType.PERCENTAGE_TOKEN, number: 75, flags: 4 } }
                ]
            }));
            it('radial-gradient(20px, red, blue)', () => assert_1.deepStrictEqual(parse('radial-gradient(20px, red, blue)'), {
                type: image_1.CSSImageType.RADIAL_GRADIENT,
                shape: image_1.CSSRadialShape.CIRCLE,
                size: [{ type: tokenizer_1.TokenType.DIMENSION_TOKEN, number: 20, flags: 4, unit: 'px' }],
                position: [],
                stops: [{ color: colorParse('red'), stop: null }, { color: colorParse('blue'), stop: null }]
            }));
        });
    });
});
//# sourceMappingURL=radial-gradient.js.map