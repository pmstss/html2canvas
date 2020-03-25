"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PathType;
(function (PathType) {
    PathType[PathType["VECTOR"] = 0] = "VECTOR";
    PathType[PathType["BEZIER_CURVE"] = 1] = "BEZIER_CURVE";
})(PathType = exports.PathType || (exports.PathType = {}));
exports.equalPath = (a, b) => {
    if (a.length === b.length) {
        return a.some((v, i) => v === b[i]);
    }
    return false;
};
exports.transformPath = (path, deltaX, deltaY, deltaW, deltaH) => {
    return path.map((point, index) => {
        switch (index) {
            case 0:
                return point.add(deltaX, deltaY);
            case 1:
                return point.add(deltaX + deltaW, deltaY);
            case 2:
                return point.add(deltaX + deltaW, deltaY + deltaH);
            case 3:
                return point.add(deltaX, deltaY + deltaH);
        }
        return point;
    });
};
//# sourceMappingURL=path.js.map