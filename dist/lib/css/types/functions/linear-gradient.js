"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("../../syntax/parser");
const tokenizer_1 = require("../../syntax/tokenizer");
const angle_1 = require("../angle");
const image_1 = require("../image");
const gradient_1 = require("./gradient");
exports.linearGradient = (tokens) => {
    let angle = angle_1.deg(180);
    const stops = [];
    parser_1.parseFunctionArgs(tokens).forEach((arg, i) => {
        if (i === 0) {
            const firstToken = arg[0];
            if (firstToken.type === tokenizer_1.TokenType.IDENT_TOKEN && firstToken.value === 'to') {
                angle = angle_1.parseNamedSide(arg);
                return;
            }
            else if (angle_1.isAngle(firstToken)) {
                angle = angle_1.angle.parse(firstToken);
                return;
            }
        }
        const colorStop = gradient_1.parseColorStop(arg);
        stops.push(colorStop);
    });
    return { angle, stops, type: image_1.CSSImageType.LINEAR_GRADIENT };
};
//# sourceMappingURL=linear-gradient.js.map