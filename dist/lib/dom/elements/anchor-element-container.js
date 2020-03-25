"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_container_1 = require("../element-container");
class AnchorElementContainer extends element_container_1.ElementContainer {
    constructor(element) {
        super(element);
        this.href = element.href;
    }
}
exports.AnchorElementContainer = AnchorElementContainer;
//# sourceMappingURL=anchor-element-container.js.map