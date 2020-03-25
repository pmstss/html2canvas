"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const background_size_1 = require("../css/property-descriptors/background-size");
const vector_1 = require("./vector");
const background_repeat_1 = require("../css/property-descriptors/background-repeat");
const length_percentage_1 = require("../css/types/length-percentage");
const parser_1 = require("../css/syntax/parser");
const box_sizing_1 = require("./box-sizing");
const background_clip_1 = require("../css/property-descriptors/background-clip");
exports.calculateBackgroundPositioningArea = (backgroundOrigin, element) => {
    if (backgroundOrigin === 0 /* BORDER_BOX */) {
        return element.bounds;
    }
    if (backgroundOrigin === 2 /* CONTENT_BOX */) {
        return box_sizing_1.contentBox(element);
    }
    return box_sizing_1.paddingBox(element);
};
exports.calculateBackgroundPaintingArea = (backgroundClip, element) => {
    if (backgroundClip === background_clip_1.BACKGROUND_CLIP.BORDER_BOX) {
        return element.bounds;
    }
    if (backgroundClip === background_clip_1.BACKGROUND_CLIP.CONTENT_BOX) {
        return box_sizing_1.contentBox(element);
    }
    return box_sizing_1.paddingBox(element);
};
exports.calculateBackgroundRendering = (container, index, intrinsicSize) => {
    const backgroundPositioningArea = exports.calculateBackgroundPositioningArea(exports.getBackgroundValueForIndex(container.styles.backgroundOrigin, index), container);
    const backgroundPaintingArea = exports.calculateBackgroundPaintingArea(exports.getBackgroundValueForIndex(container.styles.backgroundClip, index), container);
    const backgroundImageSize = exports.calculateBackgroundSize(exports.getBackgroundValueForIndex(container.styles.backgroundSize, index), intrinsicSize, backgroundPositioningArea);
    const [sizeWidth, sizeHeight] = backgroundImageSize;
    const position = length_percentage_1.getAbsoluteValueForTuple(exports.getBackgroundValueForIndex(container.styles.backgroundPosition, index), backgroundPositioningArea.width - sizeWidth, backgroundPositioningArea.height - sizeHeight);
    const path = exports.calculateBackgroundRepeatPath(exports.getBackgroundValueForIndex(container.styles.backgroundRepeat, index), position, backgroundImageSize, backgroundPositioningArea, backgroundPaintingArea);
    const offsetX = Math.round(backgroundPositioningArea.left + position[0]);
    const offsetY = Math.round(backgroundPositioningArea.top + position[1]);
    return [path, offsetX, offsetY, sizeWidth, sizeHeight];
};
exports.isAuto = (token) => parser_1.isIdentToken(token) && token.value === background_size_1.BACKGROUND_SIZE.AUTO;
const hasIntrinsicValue = (value) => typeof value === 'number';
exports.calculateBackgroundSize = (size, [intrinsicWidth, intrinsicHeight, intrinsicProportion], bounds) => {
    const [first, second] = size;
    if (length_percentage_1.isLengthPercentage(first) && second && length_percentage_1.isLengthPercentage(second)) {
        return [length_percentage_1.getAbsoluteValue(first, bounds.width), length_percentage_1.getAbsoluteValue(second, bounds.height)];
    }
    const hasIntrinsicProportion = hasIntrinsicValue(intrinsicProportion);
    if (parser_1.isIdentToken(first) && (first.value === background_size_1.BACKGROUND_SIZE.CONTAIN || first.value === background_size_1.BACKGROUND_SIZE.COVER)) {
        if (hasIntrinsicValue(intrinsicProportion)) {
            const targetRatio = bounds.width / bounds.height;
            return targetRatio < intrinsicProportion !== (first.value === background_size_1.BACKGROUND_SIZE.COVER)
                ? [bounds.width, bounds.width / intrinsicProportion]
                : [bounds.height * intrinsicProportion, bounds.height];
        }
        return [bounds.width, bounds.height];
    }
    const hasIntrinsicWidth = hasIntrinsicValue(intrinsicWidth);
    const hasIntrinsicHeight = hasIntrinsicValue(intrinsicHeight);
    const hasIntrinsicDimensions = hasIntrinsicWidth || hasIntrinsicHeight;
    // If the background-size is auto or auto auto:
    if (exports.isAuto(first) && (!second || exports.isAuto(second))) {
        // If the image has both horizontal and vertical intrinsic dimensions, it's rendered at that size.
        if (hasIntrinsicWidth && hasIntrinsicHeight) {
            return [intrinsicWidth, intrinsicHeight];
        }
        // If the image has no intrinsic dimensions and has no intrinsic proportions,
        // it's rendered at the size of the background positioning area.
        if (!hasIntrinsicProportion && !hasIntrinsicDimensions) {
            return [bounds.width, bounds.height];
        }
        // TODO If the image has no intrinsic dimensions but has intrinsic proportions, it's rendered as if contain had been specified instead.
        // If the image has only one intrinsic dimension and has intrinsic proportions, it's rendered at the size corresponding to that one dimension.
        // The other dimension is computed using the specified dimension and the intrinsic proportions.
        if (hasIntrinsicDimensions && hasIntrinsicProportion) {
            const width = hasIntrinsicWidth
                ? intrinsicWidth
                : intrinsicHeight * intrinsicProportion;
            const height = hasIntrinsicHeight
                ? intrinsicHeight
                : intrinsicWidth / intrinsicProportion;
            return [width, height];
        }
        // If the image has only one intrinsic dimension but has no intrinsic proportions,
        // it's rendered using the specified dimension and the other dimension of the background positioning area.
        const width = hasIntrinsicWidth ? intrinsicWidth : bounds.width;
        const height = hasIntrinsicHeight ? intrinsicHeight : bounds.height;
        return [width, height];
    }
    // If the image has intrinsic proportions, it's stretched to the specified dimension.
    // The unspecified dimension is computed using the specified dimension and the intrinsic proportions.
    if (hasIntrinsicProportion) {
        let width = 0;
        let height = 0;
        if (length_percentage_1.isLengthPercentage(first)) {
            width = length_percentage_1.getAbsoluteValue(first, bounds.width);
        }
        else if (length_percentage_1.isLengthPercentage(second)) {
            height = length_percentage_1.getAbsoluteValue(second, bounds.height);
        }
        if (exports.isAuto(first)) {
            width = height * intrinsicProportion;
        }
        else if (!second || exports.isAuto(second)) {
            height = width / intrinsicProportion;
        }
        return [width, height];
    }
    // If the image has no intrinsic proportions, it's stretched to the specified dimension.
    // The unspecified dimension is computed using the image's corresponding intrinsic dimension,
    // if there is one. If there is no such intrinsic dimension,
    // it becomes the corresponding dimension of the background positioning area.
    let width = null;
    let height = null;
    if (length_percentage_1.isLengthPercentage(first)) {
        width = length_percentage_1.getAbsoluteValue(first, bounds.width);
    }
    else if (second && length_percentage_1.isLengthPercentage(second)) {
        height = length_percentage_1.getAbsoluteValue(second, bounds.height);
    }
    if (width !== null && (!second || exports.isAuto(second))) {
        height =
            hasIntrinsicWidth && hasIntrinsicHeight
                ? (width / intrinsicWidth) * intrinsicHeight
                : bounds.height;
    }
    if (height !== null && exports.isAuto(first)) {
        width =
            hasIntrinsicWidth && hasIntrinsicHeight
                ? (height / intrinsicHeight) * intrinsicWidth
                : bounds.width;
    }
    if (width !== null && height !== null) {
        return [width, height];
    }
    throw new Error(`Unable to calculate background-size for element`);
};
exports.getBackgroundValueForIndex = (values, index) => {
    const value = values[index];
    if (typeof value === 'undefined') {
        return values[0];
    }
    return value;
};
exports.calculateBackgroundRepeatPath = (repeat, [x, y], [width, height], backgroundPositioningArea, backgroundPaintingArea) => {
    switch (repeat) {
        case background_repeat_1.BACKGROUND_REPEAT.REPEAT_X:
            return [
                new vector_1.Vector(Math.round(backgroundPositioningArea.left), Math.round(backgroundPositioningArea.top + y)),
                new vector_1.Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(backgroundPositioningArea.top + y)),
                new vector_1.Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(height + backgroundPositioningArea.top + y)),
                new vector_1.Vector(Math.round(backgroundPositioningArea.left), Math.round(height + backgroundPositioningArea.top + y))
            ];
        case background_repeat_1.BACKGROUND_REPEAT.REPEAT_Y:
            return [
                new vector_1.Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top)),
                new vector_1.Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top)),
                new vector_1.Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top)),
                new vector_1.Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top))
            ];
        case background_repeat_1.BACKGROUND_REPEAT.NO_REPEAT:
            return [
                new vector_1.Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y)),
                new vector_1.Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y)),
                new vector_1.Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y + height)),
                new vector_1.Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y + height))
            ];
        default:
            return [
                new vector_1.Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.top)),
                new vector_1.Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.top)),
                new vector_1.Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top)),
                new vector_1.Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top))
            ];
    }
};
//# sourceMappingURL=background.js.map