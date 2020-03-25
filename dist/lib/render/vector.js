"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("./path");
class Vector {
    constructor(x, y) {
        this.type = path_1.PathType.VECTOR;
        this.x = x;
        this.y = y;
    }
    add(deltaX, deltaY) {
        return new Vector(this.x + deltaX, this.y + deltaY);
    }
}
exports.Vector = Vector;
exports.isVector = (path) => path.type === path_1.PathType.VECTOR;
//# sourceMappingURL=vector.js.map