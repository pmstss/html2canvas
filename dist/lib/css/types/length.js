"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenizer_1 = require("../syntax/tokenizer");
exports.isLength = (token) => token.type === tokenizer_1.TokenType.NUMBER_TOKEN || token.type === tokenizer_1.TokenType.DIMENSION_TOKEN;
//# sourceMappingURL=length.js.map