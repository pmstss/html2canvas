"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../syntax/parser");
const image_1 = require("../image");
const tokenizer_1 = require("../../syntax/tokenizer");
const angle_1 = require("../angle");
const gradient_1 = require("./gradient");
exports.prefixLinearGradient = (tokens) => {
    let angle = angle_1.deg(180);
    const stops = [];
    parser_1.parseFunctionArgs(tokens).forEach((arg, i) => {
        if (i === 0) {
            const firstToken = arg[0];
            if (firstToken.type === tokenizer_1.TokenType.IDENT_TOKEN &&
                ['top', 'left', 'right', 'bottom'].indexOf(firstToken.value) !== -1) {
                angle = angle_1.parseNamedSide(arg);
                return;
            }
            else if (angle_1.isAngle(firstToken)) {
                angle = (angle_1.angle.parse(firstToken) + angle_1.deg(270)) % angle_1.deg(360);
                return;
            }
        }
        const colorStop = gradient_1.parseColorStop(arg);
        stops.push(colorStop);
    });
    return {
        angle,
        stops,
        type: image_1.CSSImageType.LINEAR_GRADIENT
    };
};
//# sourceMappingURL=-prefix-linear-gradient.js.map