"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_container_1 = require("../element-container");
class LIElementContainer extends element_container_1.ElementContainer {
    constructor(element) {
        super(element);
        this.value = element.value;
    }
}
exports.LIElementContainer = LIElementContainer;
//# sourceMappingURL=li-element-container.js.map