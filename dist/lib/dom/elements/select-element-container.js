"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_container_1 = require("../element-container");
class SelectElementContainer extends element_container_1.ElementContainer {
    constructor(element) {
        super(element);
        const option = element.options[element.selectedIndex || 0];
        this.value = option ? option.text || '' : '';
    }
}
exports.SelectElementContainer = SelectElementContainer;
//# sourceMappingURL=select-element-container.js.map