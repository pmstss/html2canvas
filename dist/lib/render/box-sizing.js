"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const length_percentage_1 = require("../css/types/length-percentage");
exports.paddingBox = (element) => {
    const bounds = element.bounds;
    const styles = element.styles;
    return bounds.add(styles.borderLeftWidth, styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth), -(styles.borderTopWidth + styles.borderBottomWidth));
};
exports.contentBox = (element) => {
    const styles = element.styles;
    const bounds = element.bounds;
    const paddingLeft = length_percentage_1.getAbsoluteValue(styles.paddingLeft, bounds.width);
    const paddingRight = length_percentage_1.getAbsoluteValue(styles.paddingRight, bounds.width);
    const paddingTop = length_percentage_1.getAbsoluteValue(styles.paddingTop, bounds.width);
    const paddingBottom = length_percentage_1.getAbsoluteValue(styles.paddingBottom, bounds.width);
    return bounds.add(paddingLeft + styles.borderLeftWidth, paddingTop + styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth + paddingLeft + paddingRight), -(styles.borderTopWidth + styles.borderBottomWidth + paddingTop + paddingBottom));
};
//# sourceMappingURL=box-sizing.js.map