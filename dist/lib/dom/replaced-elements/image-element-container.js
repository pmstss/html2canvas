"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const element_container_1 = require("../element-container");
const cache_storage_1 = require("../../core/cache-storage");
class ImageElementContainer extends element_container_1.ElementContainer {
    constructor(img) {
        super(img);
        this.src = img.currentSrc || img.src;
        this.intrinsicWidth = img.naturalWidth;
        this.intrinsicHeight = img.naturalHeight;
        cache_storage_1.CacheStorage.getInstance().addImage(this.src);
    }
}
exports.ImageElementContainer = ImageElementContainer;
//# sourceMappingURL=image-element-container.js.map