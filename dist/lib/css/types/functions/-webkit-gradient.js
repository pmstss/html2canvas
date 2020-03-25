"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../syntax/parser");
const image_1 = require("../image");
const angle_1 = require("../angle");
const tokenizer_1 = require("../../syntax/tokenizer");
const color_1 = require("../color");
const length_percentage_1 = require("../length-percentage");
exports.webkitGradient = (tokens) => {
    let angle = angle_1.deg(180);
    const stops = [];
    let type = image_1.CSSImageType.LINEAR_GRADIENT;
    let shape = image_1.CSSRadialShape.CIRCLE;
    let size = image_1.CSSRadialExtent.FARTHEST_CORNER;
    const position = [];
    parser_1.parseFunctionArgs(tokens).forEach((arg, i) => {
        const firstToken = arg[0];
        if (i === 0) {
            if (parser_1.isIdentToken(firstToken) && firstToken.value === 'linear') {
                type = image_1.CSSImageType.LINEAR_GRADIENT;
                return;
            }
            else if (parser_1.isIdentToken(firstToken) && firstToken.value === 'radial') {
                type = image_1.CSSImageType.RADIAL_GRADIENT;
                return;
            }
        }
        if (firstToken.type === tokenizer_1.TokenType.FUNCTION) {
            if (firstToken.name === 'from') {
                const color = color_1.color.parse(firstToken.values[0]);
                stops.push({ stop: length_percentage_1.ZERO_LENGTH, color });
            }
            else if (firstToken.name === 'to') {
                const color = color_1.color.parse(firstToken.values[0]);
                stops.push({ stop: length_percentage_1.HUNDRED_PERCENT, color });
            }
            else if (firstToken.name === 'color-stop') {
                const values = firstToken.values.filter(parser_1.nonFunctionArgSeparator);
                if (values.length === 2) {
                    const color = color_1.color.parse(values[1]);
                    const stop = values[0];
                    if (parser_1.isNumberToken(stop)) {
                        stops.push({
                            stop: { type: tokenizer_1.TokenType.PERCENTAGE_TOKEN, number: stop.number * 100, flags: stop.flags },
                            color
                        });
                    }
                }
            }
        }
    });
    return type === image_1.CSSImageType.LINEAR_GRADIENT
        ? {
            angle: (angle + angle_1.deg(180)) % angle_1.deg(360),
            stops,
            type
        }
        : { size, shape, stops, position, type };
};
//# sourceMappingURL=-webkit-gradient.js.map