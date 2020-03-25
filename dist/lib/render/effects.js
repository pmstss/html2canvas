"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TransformEffect {
    constructor(offsetX, offsetY, matrix) {
        this.type = 0 /* TRANSFORM */;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.matrix = matrix;
        this.target = 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */;
    }
}
exports.TransformEffect = TransformEffect;
class ClipEffect {
    constructor(path, target) {
        this.type = 1 /* CLIP */;
        this.target = target;
        this.path = path;
    }
}
exports.ClipEffect = ClipEffect;
exports.isTransformEffect = (effect) => effect.type === 0 /* TRANSFORM */;
exports.isClipEffect = (effect) => effect.type === 1 /* CLIP */;
//# sourceMappingURL=effects.js.map