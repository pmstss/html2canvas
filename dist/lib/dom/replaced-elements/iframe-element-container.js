"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_container_1 = require("../element-container");
const node_parser_1 = require("../node-parser");
const color_1 = require("../../css/types/color");
const parser_1 = require("../../css/syntax/parser");
const parseColor = (value) => color_1.color.parse(parser_1.Parser.create(value).parseComponentValue());
class IFrameElementContainer extends element_container_1.ElementContainer {
    constructor(iframe) {
        super(iframe);
        this.src = iframe.src;
        this.width = parseInt(iframe.width, 10) || 0;
        this.height = parseInt(iframe.height, 10) || 0;
        this.backgroundColor = this.styles.backgroundColor;
        try {
            if (iframe.contentWindow &&
                iframe.contentWindow.document &&
                iframe.contentWindow.document.documentElement) {
                this.tree = node_parser_1.parseTree(iframe.contentWindow.document.documentElement);
                // http://www.w3.org/TR/css3-background/#special-backgrounds
                const documentBackgroundColor = iframe.contentWindow.document.documentElement
                    ? parseColor(getComputedStyle(iframe.contentWindow.document.documentElement)
                        .backgroundColor)
                    : color_1.COLORS.TRANSPARENT;
                const bodyBackgroundColor = iframe.contentWindow.document.body
                    ? parseColor(getComputedStyle(iframe.contentWindow.document.body).backgroundColor)
                    : color_1.COLORS.TRANSPARENT;
                this.backgroundColor = color_1.isTransparent(documentBackgroundColor)
                    ? color_1.isTransparent(bodyBackgroundColor)
                        ? this.styles.backgroundColor
                        : bodyBackgroundColor
                    : documentBackgroundColor;
            }
        }
        catch (e) { }
    }
}
exports.IFrameElementContainer = IFrameElementContainer;
//# sourceMappingURL=iframe-element-container.js.map