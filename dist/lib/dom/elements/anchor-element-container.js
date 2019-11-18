"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var element_container_1 = require("../element-container");
var AnchorElementContainer = /** @class */ (function (_super) {
    __extends(AnchorElementContainer, _super);
    function AnchorElementContainer(element) {
        var _this = _super.call(this, element) || this;
        _this.href = element.href;
        return _this;
    }
    return AnchorElementContainer;
}(element_container_1.ElementContainer));
exports.AnchorElementContainer = AnchorElementContainer;
//# sourceMappingURL=anchor-element-container.js.map