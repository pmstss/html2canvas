"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vector_1 = require("./vector");
const path_1 = require("./path");
const lerp = (a, b, t) => {
    return new vector_1.Vector(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
};
class BezierCurve {
    constructor(start, startControl, endControl, end) {
        this.type = path_1.PathType.BEZIER_CURVE;
        this.start = start;
        this.startControl = startControl;
        this.endControl = endControl;
        this.end = end;
    }
    subdivide(t, firstHalf) {
        const ab = lerp(this.start, this.startControl, t);
        const bc = lerp(this.startControl, this.endControl, t);
        const cd = lerp(this.endControl, this.end, t);
        const abbc = lerp(ab, bc, t);
        const bccd = lerp(bc, cd, t);
        const dest = lerp(abbc, bccd, t);
        return firstHalf ? new BezierCurve(this.start, ab, abbc, dest) : new BezierCurve(dest, bccd, cd, this.end);
    }
    add(deltaX, deltaY) {
        return new BezierCurve(this.start.add(deltaX, deltaY), this.startControl.add(deltaX, deltaY), this.endControl.add(deltaX, deltaY), this.end.add(deltaX, deltaY));
    }
    reverse() {
        return new BezierCurve(this.end, this.endControl, this.startControl, this.start);
    }
}
exports.BezierCurve = BezierCurve;
exports.isBezierCurve = (path) => path.type === path_1.PathType.BEZIER_CURVE;
//# sourceMappingURL=bezier-curve.js.map