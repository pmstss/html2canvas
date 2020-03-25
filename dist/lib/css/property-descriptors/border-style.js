"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("../IPropertyDescriptor");
var BORDER_STYLE;
(function (BORDER_STYLE) {
    BORDER_STYLE[BORDER_STYLE["NONE"] = 0] = "NONE";
    BORDER_STYLE[BORDER_STYLE["SOLID"] = 1] = "SOLID";
})(BORDER_STYLE = exports.BORDER_STYLE || (exports.BORDER_STYLE = {}));
const borderStyleForSide = (side) => ({
    name: `border-${side}-style`,
    initialValue: 'solid',
    prefix: false,
    type: IPropertyDescriptor_1.PropertyDescriptorParsingType.IDENT_VALUE,
    parse: (style) => {
        switch (style) {
            case 'none':
                return BORDER_STYLE.NONE;
        }
        return BORDER_STYLE.SOLID;
    }
});
exports.borderTopStyle = borderStyleForSide('top');
exports.borderRightStyle = borderStyleForSide('right');
exports.borderBottomStyle = borderStyleForSide('bottom');
exports.borderLeftStyle = borderStyleForSide('left');
//# sourceMappingURL=border-style.js.map