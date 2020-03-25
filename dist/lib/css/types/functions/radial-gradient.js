"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../syntax/parser");
const image_1 = require("../image");
const gradient_1 = require("./gradient");
const length_percentage_1 = require("../length-percentage");
const length_1 = require("../length");
exports.CLOSEST_SIDE = 'closest-side';
exports.FARTHEST_SIDE = 'farthest-side';
exports.CLOSEST_CORNER = 'closest-corner';
exports.FARTHEST_CORNER = 'farthest-corner';
exports.CIRCLE = 'circle';
exports.ELLIPSE = 'ellipse';
exports.COVER = 'cover';
exports.CONTAIN = 'contain';
exports.radialGradient = (tokens) => {
    let shape = image_1.CSSRadialShape.CIRCLE;
    let size = image_1.CSSRadialExtent.FARTHEST_CORNER;
    const stops = [];
    const position = [];
    parser_1.parseFunctionArgs(tokens).forEach((arg, i) => {
        let isColorStop = true;
        if (i === 0) {
            let isAtPosition = false;
            isColorStop = arg.reduce((acc, token) => {
                if (isAtPosition) {
                    if (parser_1.isIdentToken(token)) {
                        switch (token.value) {
                            case 'center':
                                position.push(length_percentage_1.FIFTY_PERCENT);
                                return acc;
                            case 'top':
                            case 'left':
                                position.push(length_percentage_1.ZERO_LENGTH);
                                return acc;
                            case 'right':
                            case 'bottom':
                                position.push(length_percentage_1.HUNDRED_PERCENT);
                                return acc;
                        }
                    }
                    else if (length_percentage_1.isLengthPercentage(token) || length_1.isLength(token)) {
                        position.push(token);
                    }
                }
                else if (parser_1.isIdentToken(token)) {
                    switch (token.value) {
                        case exports.CIRCLE:
                            shape = image_1.CSSRadialShape.CIRCLE;
                            return false;
                        case exports.ELLIPSE:
                            shape = image_1.CSSRadialShape.ELLIPSE;
                            return false;
                        case 'at':
                            isAtPosition = true;
                            return false;
                        case exports.CLOSEST_SIDE:
                            size = image_1.CSSRadialExtent.CLOSEST_SIDE;
                            return false;
                        case exports.COVER:
                        case exports.FARTHEST_SIDE:
                            size = image_1.CSSRadialExtent.FARTHEST_SIDE;
                            return false;
                        case exports.CONTAIN:
                        case exports.CLOSEST_CORNER:
                            size = image_1.CSSRadialExtent.CLOSEST_CORNER;
                            return false;
                        case exports.FARTHEST_CORNER:
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
//# sourceMappingURL=radial-gradient.js.map