"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_container_1 = require("../element-container");
const cache_storage_1 = require("../../core/cache-storage");
class SVGElementContainer extends element_container_1.ElementContainer {
    constructor(img) {
        super(img);
        const s = new XMLSerializer();
        this.svg = `data:image/svg+xml,${encodeURIComponent(s.serializeToString(img))}`;
        this.intrinsicWidth = img.width.baseVal.value;
        this.intrinsicHeight = img.height.baseVal.value;
        cache_storage_1.CacheStorage.getInstance().addImage(this.svg);
    }
}
exports.SVGElementContainer = SVGElementContainer;
//# sourceMappingURL=svg-element-container.js.map