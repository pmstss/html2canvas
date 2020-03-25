"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_transform_1 = require("../css/property-descriptors/text-transform");
const text_1 = require("../css/layout/text");
class TextContainer {
    constructor(node, styles, bounds) {
        this.text = transform(node.data, styles.textTransform);
        this.textBounds = bounds || text_1.parseTextBounds(this.text, styles, node);
    }
}
exports.TextContainer = TextContainer;
const transform = (text, transform) => {
    switch (transform) {
        case text_transform_1.TEXT_TRANSFORM.LOWERCASE:
            return text.toLowerCase();
        case text_transform_1.TEXT_TRANSFORM.CAPITALIZE:
            return text.replace(CAPITALIZE, capitalize);
        case text_transform_1.TEXT_TRANSFORM.UPPERCASE:
            return text.toUpperCase();
        default:
            return text;
    }
};
const CAPITALIZE = /(^|\s|:|-|\(|\))([a-z])/g;
const capitalize = (m, p1, p2) => {
    if (m.length > 0) {
        return p1 + p2.toUpperCase();
    }
    return m;
};
//# sourceMappingURL=text-container.js.map