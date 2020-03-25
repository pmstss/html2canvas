"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_container_1 = require("../element-container");
class CanvasElementContainer extends element_container_1.ElementContainer {
    constructor(canvas) {
        super(canvas);
        this.canvas = canvas;
        this.intrinsicWidth = canvas.width;
        this.intrinsicHeight = canvas.height;
    }
}
exports.CanvasElementContainer = CanvasElementContainer;
//# sourceMappingURL=canvas-element-container.js.map