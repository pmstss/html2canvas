"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../css/index");
const bounds_1 = require("../css/layout/bounds");
const node_parser_1 = require("./node-parser");
class ElementContainer {
    constructor(element, styles, bounds) {
        this.styles = styles || new index_1.CSSParsedDeclaration(window.getComputedStyle(element, null));
        this.textNodes = [];
        this.elements = [];
        if (element && this.styles.transform !== null && node_parser_1.isHTMLElementNode(element)) {
            // getBoundingClientRect takes transforms into account
            element.style.transform = 'none';
        }
        this.bounds = bounds || bounds_1.parseBounds(element);
        this.flags = 0;
        this.className = element ? element.className : '';
    }
}
exports.ElementContainer = ElementContainer;
//# sourceMappingURL=element-container.js.map