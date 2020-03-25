"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../syntax/parser");
const image_1 = require("../image");
const gradient_1 = require("./gradient");
const length_percentage_1 = require("../length-percentage");
const length_1 = require("../length");
const radial_gradient_1 = require("./radial-gradient");
exports.prefixRadialGradient = (tokens) => {
    let shape = image_1.CSSRadialShape.CIRCLE;
    let size = image_1.CSSRadialExtent.FARTHEST_CORNER;
    const stops = [];
    const position = [];
    parser_1.parseFunctionArgs(tokens).forEach((arg, i) => {
        let isColorStop = true;
        if (i === 0) {
            isColorStop = arg.reduce((acc, token) => {
                if (parser_1.isIdentToken(token)) {
                    switch (token.value) {
                        case 'center':
                            position.push(length_percentage_1.FIFTY_PERCENT);
                            return false;
                        case 'top':
                        case 'left':
                            position.push(length_percentage_1.ZERO_LENGTH);
                            return false;
                        case 'right':
                        case 'bottom':
                            position.push(length_percentage_1.HUNDRED_PERCENT);
                            return false;
                    }
                }
                else if (length_percentage_1.isLengthPercentage(token) || length_1.isLength(token)) {
                    position.push(token);
                    return false;
                }
                return acc;
            }, isColorStop);
        }
        else if (i === 1) {
            isColorStop = arg.reduce((acc, token) => {
                if (parser_1.isIdentToken(token)) {
                    switch (token.value) {
                        case radial_gradient_1.CIRCLE:
                            shape = image_1.CSSRadialShape.CIRCLE;
                            return false;
                        case radial_gradient_1.ELLIPSE:
                            shape = image_1.CSSRadialShape.ELLIPSE;
                            return false;
                        case radial_gradient_1.CONTAIN:
                        case radial_gradient_1.CLOSEST_SIDE:
                            size = image_1.CSSRadialExtent.CLOSEST_SIDE;
                            return false;
                        case radial_gradient_1.FARTHEST_SIDE:
                            size = image_1.CSSRadialExtent.FARTHEST_SIDE;
                            return false;
                        case radial_gradient_1.CLOSEST_CORNER:
                            size = image_1.CSSRadialExtent.CLOSEST_CORNER;
                            return false;
                        case radial_gradient_1.COVER:
                        case radial_gradient_1.FARTHEST_CORNER:
                            size = image_1.CSSRadialExtent.FARTHEST_CORNER;
                            return false;
                    }
                }
                else if (length_1.isLength(token) || length_percentage_1.isLengthPercentage(token)) {
                    if (!Array.isArray(size)) {
                        size = [];
                    }
                    size.push(token);
                    return false;
                }
                return acc;
            }, isColorStop);
        }
        if (isColorStop) {
            const colorStop = gradient_1.parseColorStop(arg);
            stops.push(colorStop);
        }
    });
    return { size, shape, stops, position, type: image_1.CSSImageType.RADIAL_GRADIENT };
};
//# sourceMappingURL=-prefix-radial-gradient.js.map