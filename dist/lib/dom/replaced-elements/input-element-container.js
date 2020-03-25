"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_container_1 = require("../element-container");
const border_style_1 = require("../../css/property-descriptors/border-style");
const background_clip_1 = require("../../css/property-descriptors/background-clip");
const tokenizer_1 = require("../../css/syntax/tokenizer");
const bounds_1 = require("../../css/layout/bounds");
const CHECKBOX_BORDER_RADIUS = [
    {
        type: tokenizer_1.TokenType.DIMENSION_TOKEN,
        flags: 0,
        unit: 'px',
        number: 3
    }
];
const RADIO_BORDER_RADIUS = [
    {
        type: tokenizer_1.TokenType.PERCENTAGE_TOKEN,
        flags: 0,
        number: 50
    }
];
const reformatInputBounds = (bounds) => {
    if (bounds.width > bounds.height) {
        return new bounds_1.Bounds(bounds.left + (bounds.width - bounds.height) / 2, bounds.top, bounds.height, bounds.height);
    }
    else if (bounds.width < bounds.height) {
        return new bounds_1.Bounds(bounds.left, bounds.top + (bounds.height - bounds.width) / 2, bounds.width, bounds.width);
    }
    return bounds;
};
const getInputValue = (node) => {
    const value = node.type === exports.PASSWORD ? new Array(node.value.length + 1).join('\u2022') : node.value;
    return value.length === 0 ? node.placeholder || '' : value;
};
exports.CHECKBOX = 'checkbox';
exports.RADIO = 'radio';
exports.PASSWORD = 'password';
exports.INPUT_COLOR = 0x2a2a2aff;
class InputElementContainer extends element_container_1.ElementContainer {
    constructor(input) {
        super(input);
        this.type = input.type.toLowerCase();
        this.checked = input.checked;
        this.value = getInputValue(input);
        if (this.type === exports.CHECKBOX || this.type === exports.RADIO) {
            this.styles.backgroundColor = 0xdededeff;
            this.styles.borderTopColor = this.styles.borderRightColor = this.styles.borderBottomColor = this.styles.borderLeftColor = 0xa5a5a5ff;
            this.styles.borderTopWidth = this.styles.borderRightWidth = this.styles.borderBottomWidth = this.styles.borderLeftWidth = 1;
            this.styles.borderTopStyle = this.styles.borderRightStyle = this.styles.borderBottomStyle = this.styles.borderLeftStyle =
                border_style_1.BORDER_STYLE.SOLID;
            this.styles.backgroundClip = [background_clip_1.BACKGROUND_CLIP.BORDER_BOX];
            this.styles.backgroundOrigin = [0 /* BORDER_BOX */];
            this.bounds = reformatInputBounds(this.bounds);
        }
        switch (this.type) {
            case exports.CHECKBOX:
                this.styles.borderTopRightRadius = this.styles.borderTopLeftRadius = this.styles.borderBottomRightRadius = this.styles.borderBottomLeftRadius = CHECKBOX_BORDER_RADIUS;
                break;
            case exports.RADIO:
                this.styles.borderTopRightRadius = this.styles.borderTopLeftRadius = this.styles.borderBottomRightRadius = this.styles.borderBottomLeftRadius = RADIO_BORDER_RADIUS;
                break;
        }
    }
}
exports.InputElementContainer = InputElementContainer;
//# sourceMappingURL=input-element-container.js.map