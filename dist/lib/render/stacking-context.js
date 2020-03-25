"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitwise_1 = require("../core/bitwise");
const bound_curves_1 = require("./bound-curves");
const effects_1 = require("./effects");
const overflow_1 = require("../css/property-descriptors/overflow");
const path_1 = require("./path");
const ol_element_container_1 = require("../dom/elements/ol-element-container");
const li_element_container_1 = require("../dom/elements/li-element-container");
const counter_1 = require("../css/types/functions/counter");
class StackingContext {
    constructor(container) {
        this.element = container;
        this.inlineLevel = [];
        this.nonInlineLevel = [];
        this.negativeZIndex = [];
        this.zeroOrAutoZIndexOrTransformedOrOpacity = [];
        this.positiveZIndex = [];
        this.nonPositionedFloats = [];
        this.nonPositionedInlineLevel = [];
    }
}
exports.StackingContext = StackingContext;
class ElementPaint {
    constructor(element, parentStack) {
        this.container = element;
        this.effects = parentStack.slice(0);
        this.curves = new bound_curves_1.BoundCurves(element);
        if (element.styles.transform !== null) {
            const offsetX = element.bounds.left + element.styles.transformOrigin[0].number;
            const offsetY = element.bounds.top + element.styles.transformOrigin[1].number;
            const matrix = element.styles.transform;
            this.effects.push(new effects_1.TransformEffect(offsetX, offsetY, matrix));
        }
        if (element.styles.overflowX !== overflow_1.OVERFLOW.VISIBLE) {
            const borderBox = bound_curves_1.calculateBorderBoxPath(this.curves);
            const paddingBox = bound_curves_1.calculatePaddingBoxPath(this.curves);
            if (path_1.equalPath(borderBox, paddingBox)) {
                this.effects.push(new effects_1.ClipEffect(borderBox, 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */));
            }
            else {
                this.effects.push(new effects_1.ClipEffect(borderBox, 2 /* BACKGROUND_BORDERS */));
                this.effects.push(new effects_1.ClipEffect(paddingBox, 4 /* CONTENT */));
            }
        }
    }
    getParentEffects() {
        const effects = this.effects.slice(0);
        if (this.container.styles.overflowX !== overflow_1.OVERFLOW.VISIBLE) {
            const borderBox = bound_curves_1.calculateBorderBoxPath(this.curves);
            const paddingBox = bound_curves_1.calculatePaddingBoxPath(this.curves);
            if (!path_1.equalPath(borderBox, paddingBox)) {
                effects.push(new effects_1.ClipEffect(paddingBox, 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */));
            }
        }
        return effects;
    }
}
exports.ElementPaint = ElementPaint;
const parseStackTree = (parent, stackingContext, realStackingContext, listItems) => {
    parent.container.elements.forEach(child => {
        const treatAsRealStackingContext = bitwise_1.contains(child.flags, 4 /* CREATES_REAL_STACKING_CONTEXT */);
        const createsStackingContext = bitwise_1.contains(child.flags, 2 /* CREATES_STACKING_CONTEXT */);
        const paintContainer = new ElementPaint(child, parent.getParentEffects());
        if (bitwise_1.contains(child.styles.display, 2048 /* LIST_ITEM */)) {
            listItems.push(paintContainer);
        }
        const listOwnerItems = bitwise_1.contains(child.flags, 8 /* IS_LIST_OWNER */) ? [] : listItems;
        if (treatAsRealStackingContext || createsStackingContext) {
            const parentStack = treatAsRealStackingContext || child.styles.isPositioned() ? realStackingContext : stackingContext;
            const stack = new StackingContext(paintContainer);
            if (child.styles.isPositioned() || child.styles.opacity < 1 || child.styles.isTransformed()) {
                const order = child.styles.zIndex.order;
                if (order < 0) {
                    let index = 0;
                    parentStack.negativeZIndex.some((current, i) => {
                        if (order > current.element.container.styles.zIndex.order) {
                            index = i;
                            return false;
                        }
                        else if (index > 0) {
                            return true;
                        }
                        return false;
                    });
                    parentStack.negativeZIndex.splice(index, 0, stack);
                }
                else if (order > 0) {
                    let index = 0;
                    parentStack.positiveZIndex.some((current, i) => {
                        if (order > current.element.container.styles.zIndex.order) {
                            index = i + 1;
                            return false;
                        }
                        else if (index > 0) {
                            return true;
                        }
                        return false;
                    });
                    parentStack.positiveZIndex.splice(index, 0, stack);
                }
                else {
                    parentStack.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
                }
            }
            else {
                if (child.styles.isFloating()) {
                    parentStack.nonPositionedFloats.push(stack);
                }
                else {
                    parentStack.nonPositionedInlineLevel.push(stack);
                }
            }
            parseStackTree(paintContainer, stack, treatAsRealStackingContext ? stack : realStackingContext, listOwnerItems);
        }
        else {
            if (child.styles.isInlineLevel()) {
                stackingContext.inlineLevel.push(paintContainer);
            }
            else {
                stackingContext.nonInlineLevel.push(paintContainer);
            }
            parseStackTree(paintContainer, stackingContext, realStackingContext, listOwnerItems);
        }
        if (bitwise_1.contains(child.flags, 8 /* IS_LIST_OWNER */)) {
            processListItems(child, listOwnerItems);
        }
    });
};
const processListItems = (owner, elements) => {
    let numbering = owner instanceof ol_element_container_1.OLElementContainer ? owner.start : 1;
    const reversed = owner instanceof ol_element_container_1.OLElementContainer ? owner.reversed : false;
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        if (item.container instanceof li_element_container_1.LIElementContainer &&
            typeof item.container.value === 'number' &&
            item.container.value !== 0) {
            numbering = item.container.value;
        }
        item.listValue = counter_1.createCounterText(numbering, item.container.styles.listStyleType, true);
        numbering += reversed ? -1 : 1;
    }
};
exports.parseStackingContexts = (container) => {
    const paintContainer = new ElementPaint(container, []);
    const root = new StackingContext(paintContainer);
    const listItems = [];
    parseStackTree(paintContainer, root, root, listItems);
    processListItems(paintContainer.container, listItems);
    return root;
};
//# sourceMappingURL=stacking-context.js.map