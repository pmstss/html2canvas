"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const css_1 = require("../css");
const element_container_1 = require("./element-container");
const text_container_1 = require("./text-container");
const image_element_container_1 = require("./replaced-elements/image-element-container");
const canvas_element_container_1 = require("./replaced-elements/canvas-element-container");
const svg_element_container_1 = require("./replaced-elements/svg-element-container");
const li_element_container_1 = require("./elements/li-element-container");
const ol_element_container_1 = require("./elements/ol-element-container");
const input_element_container_1 = require("./replaced-elements/input-element-container");
const select_element_container_1 = require("./elements/select-element-container");
const textarea_element_container_1 = require("./elements/textarea-element-container");
const iframe_element_container_1 = require("./replaced-elements/iframe-element-container");
const anchor_element_container_1 = require("./elements/anchor-element-container");
const word_break_1 = require("../css/property-descriptors/word-break");
const bounds_1 = require("../css/layout/bounds");
const text_1 = require("../css/layout/text");
const LIST_OWNERS = ['OL', 'UL', 'MENU'];
const EPS = 0.01;
// TODO: move to options
const useTextSplitDnc = '*'.charCodeAt(0) === 42; // to avoid trim from dist build
/**
 * Custom getClientRects() implementation with combining adjacent rects
 * @param range source of client rects
 */
const getClientRects = (range) => {
    return Array.from(range.getClientRects()).reduce((res, rect) => {
        if (res.length > 0) {
            const prevRect = res[res.length - 1];
            if (Math.abs(prevRect.x + prevRect.width - rect.x) < EPS && Math.abs(prevRect.y - rect.y) < EPS) {
                prevRect.width += rect.width;
            }
            else {
                res.push(rect);
            }
        }
        else {
            res.push(rect);
        }
        return res;
    }, []);
};
/**
 * Split text node into multiple text nodes according to visual line wraps
 * @param textNode Text node to split
 * @param range pre-created Range
 * @see splitTextByLineWrapsDnc()
 */
const splitTextByLineWrapsLinear = (textNode, range) => {
    range.selectNodeContents(textNode);
    if (getClientRects(range).length < 2) {
        return [textNode];
    }
    const textNodes = [];
    let i = 0;
    while (textNode && ++i <= textNode.data.length) {
        range.setEnd(textNode, i);
        if (getClientRects(range).length > 1) {
            textNode = textNode.splitText(i - 1);
            textNodes.push(textNode.previousSibling);
            range.selectNodeContents(textNode);
            i = 0;
        }
    }
    if (textNode.data.length) {
        textNodes.push(textNode);
    }
    return textNodes;
};
/**
 * Splits text node into multiple nodes with exactly 1 client rectangle (core recursion method)
 * @param textNode Text node to split
 * @param range pre-created Range
 * @see splitTextByLineWrapsDnc()
 */
const splitTextIntoSingleRectNodes = (textNode, range) => {
    if (!textNode.data) {
        return [];
    }
    range.selectNodeContents(textNode);
    // this is the most expensive operation, that should be minimized
    const clientRects = getClientRects(range);
    // filtering empty/hidden/etc nodes for proper expectedPartLength
    const numberOfRects = clientRects.length;
    const numberOfLines = Math.max(1, clientRects.filter(r => r.width > 1 && r.height > 1).length);
    if (numberOfRects < 2) {
        return [textNode];
    }
    const textNodes = [];
    // as getClientRects() is expensive, instead of binary split recursive calls,
    // minimizing its usage by splitting into N parts at once
    const numberOfParts = Math.max(2, numberOfLines);
    const expectedPartLength = Math.floor(textNode.data.length / numberOfParts);
    let i = 0;
    while (++i < numberOfParts) {
        const secondPart = textNode.splitText(expectedPartLength);
        if (textNode.data) {
            textNodes.push(textNode);
        }
        textNode = secondPart;
    }
    if (textNode.data) {
        textNodes.push(textNode);
    }
    return textNodes.reduce((res, subTextNode) => [...res, ...splitTextIntoSingleRectNodes(subTextNode, range)], []);
};
/**
 * "Divide and conquer" approach for split by lines wrap in contrast to splitTextByLineWrapsLinear()
 * @param textNode Text node to split
 * @param range pre-created Range
 * @see splitTextByLineWrapsLinear()
 */
const splitTextByLineWrapsDnc = (textNode, range) => {
    range.selectNodeContents(textNode);
    if (getClientRects(range).length < 2) {
        return [textNode];
    }
    // preprocess for performance reasons
    let textNodes = splitByNewLines(textNode);
    // actual "Divide and conquer" calls
    textNodes = textNodes.reduce((res, subTextNode) => [...res, ...splitTextIntoSingleRectNodes(subTextNode, range)], []);
    // postprocessing: merging single rect nodes into single line nodes
    textNodes = mergeAdjacentOneLinesNodes(textNodes, range);
    // postprocessing: between-nodes space normalization
    moveSpacesToLineEnds(textNodes);
    return textNodes;
};
/**
 * Helps to pre-split text node by new lines for further splitTextByLineWrapsDnc() w/o expensive getClientRects() call.
 * Extra useful for nodes with 'white-space: pre', where new line indeed leads to visual text wrap.
 *
 * @param textNode Text node to split
 * @see splitTextByLineWrapsDnc()
 */
const splitByNewLines = (textNode) => {
    if (textNode.data.includes('\n')) {
        const textNodes = [];
        while (textNode.data.includes('\n')) {
            const idx = textNode.data.indexOf('\n');
            // extract '\n' into separate node, not included into result, but major for proper client rect calculations
            let secondPart = textNode.splitText(idx);
            secondPart = secondPart.splitText(1);
            if (textNode.data) {
                textNodes.push(textNode);
            }
            textNode = secondPart;
        }
        if (textNode.data) {
            textNodes.push(textNode);
        }
        return textNodes;
    }
    return [textNode];
};
/**
 * Merge adjacent (by x axis) text nodes
 * @param textNodes Text[] to run merge on
 * @param range pre-created Range
 */
const mergeAdjacentOneLinesNodes = (textNodes, range) => {
    return textNodes.reduce((res, textNode) => {
        const prevTextNode = res.length > 0 ? res[res.length - 1] : null;
        if (prevTextNode) {
            range.selectNodeContents(prevTextNode);
            const tmpRects = getClientRects(range);
            const prevClientRect = tmpRects[tmpRects.length - 1];
            range.selectNodeContents(textNode);
            const clientRect = getClientRects(range)[0];
            if (Math.abs(prevClientRect.x + prevClientRect.width - clientRect.x) < EPS &&
                Math.abs(prevClientRect.y - clientRect.y) < EPS) {
                prevTextNode.appendData(textNode.data);
                textNode.parentNode.removeChild(textNode);
            }
            else {
                res.push(textNode);
            }
        }
        else {
            res.push(textNode);
        }
        return res;
    }, []);
};
/**
 * "Normalize" spacing in adjacent per-line text nodes by moving them from line start to line end
 * @param textNodes Text[] to "normalize"
 */
const moveSpacesToLineEnds = (textNodes) => {
    textNodes.forEach((textNode, idx) => {
        if (idx > 0) {
            let spacePrefix = null;
            textNode.data = textNode.data.replace(/^\s+/, (token) => {
                spacePrefix = token;
                return '';
            });
            if (spacePrefix) {
                textNodes[idx - 1].appendData(spacePrefix);
            }
        }
    });
};
// TODO: trivial space normalization, could be wrong in some cases; improve
const getNormalizedText = (txt) => {
    const parent = txt.parentElement;
    return (txt.textContent || '').includes(parent.innerText)
        ? parent.innerText
        : (txt.textContent || '').replace(/[\t\n\r ]+/g, ' ');
};
const parseNodeTree = (node, parent, root) => {
    for (let childNode = node.firstChild, nextNode; childNode; childNode = nextNode) {
        nextNode = childNode.nextSibling;
        if (exports.isTextNode(childNode) && childNode.data.trim().length > 0) {
            /*
              If node has more than 1 client rect, its bounding polygon is not always rect,
              so using getBoundingClientRect() further for drawing background leads to incorrect results.
              Workaround: split text node into single-rect text nodes with putting each one into aux ElementContainer,
              that inherits background props (color, etc) from parent node.
            */
            const range = node.ownerDocument.createRange();
            const textNodes = useTextSplitDnc
                ? splitTextByLineWrapsDnc(childNode, range)
                : splitTextByLineWrapsLinear(childNode, range);
            const styles = new css_1.CSSParsedDeclaration(window.getComputedStyle(node, null));
            /*
              After "manual" dividing into single client rect element, reset word-break property to avoid
              redundant additional processing by LineBreaker (see breakText())
             */
            styles.wordBreak = word_break_1.WORD_BREAK.NORMAL;
            /*
              Aux ElementContainer will inherit background color, so parent color can be omited to avoid
              drawing "invalid" BoundingClientRect.
             */
            parent.styles.backgroundColor = 0;
            parent.elements.push(...textNodes.map((n) => {
                range.selectNodeContents(n);
                const bounds = bounds_1.Bounds.fromClientRect(range.getBoundingClientRect());
                const auxTextContainer = new element_container_1.ElementContainer(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                null, styles, bounds);
                auxTextContainer.textNodes.push(new text_container_1.TextContainer(n, styles, [new text_1.TextBounds(getNormalizedText(n), bounds)]));
                return auxTextContainer;
            }));
        }
        else if (exports.isElementNode(childNode)) {
            const container = createContainer(childNode);
            if (container.styles.isVisible()) {
                if (createsRealStackingContext(childNode, container, root)) {
                    container.flags |= 4 /* CREATES_REAL_STACKING_CONTEXT */;
                }
                else if (createsStackingContext(container.styles)) {
                    container.flags |= 2 /* CREATES_STACKING_CONTEXT */;
                }
                if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
                    container.flags |= 8 /* IS_LIST_OWNER */;
                }
                parent.elements.push(container);
                if (!exports.isTextareaElement(childNode) && !exports.isSVGElement(childNode) && !exports.isSelectElement(childNode)) {
                    parseNodeTree(childNode, container, root);
                }
            }
        }
    }
};
const createContainer = (element) => {
    if (exports.isImageElement(element)) {
        return new image_element_container_1.ImageElementContainer(element);
    }
    if (exports.isCanvasElement(element)) {
        return new canvas_element_container_1.CanvasElementContainer(element);
    }
    if (exports.isSVGElement(element)) {
        return new svg_element_container_1.SVGElementContainer(element);
    }
    if (exports.isLIElement(element)) {
        return new li_element_container_1.LIElementContainer(element);
    }
    if (exports.isOLElement(element)) {
        return new ol_element_container_1.OLElementContainer(element);
    }
    if (exports.isInputElement(element)) {
        return new input_element_container_1.InputElementContainer(element);
    }
    if (exports.isSelectElement(element)) {
        return new select_element_container_1.SelectElementContainer(element);
    }
    if (exports.isTextareaElement(element)) {
        return new textarea_element_container_1.TextareaElementContainer(element);
    }
    if (exports.isIFrameElement(element)) {
        return new iframe_element_container_1.IFrameElementContainer(element);
    }
    if (exports.isAnchorElement(element)) {
        return new anchor_element_container_1.AnchorElementContainer(element);
    }
    return new element_container_1.ElementContainer(element);
};
exports.parseTree = (element) => {
    const container = createContainer(element);
    container.flags |= 4 /* CREATES_REAL_STACKING_CONTEXT */;
    parseNodeTree(element, container, container);
    return container;
};
const createsRealStackingContext = (node, container, root) => {
    return (container.styles.isPositionedWithZIndex() ||
        container.styles.opacity < 1 ||
        container.styles.isTransformed() ||
        (exports.isBodyElement(node) && root.styles.isTransparent()));
};
const createsStackingContext = (styles) => styles.isPositioned() || styles.isFloating();
exports.isTextNode = (node) => node.nodeType === Node.TEXT_NODE;
exports.isElementNode = (node) => node.nodeType === Node.ELEMENT_NODE;
exports.isHTMLElementNode = (node) => typeof node.style !== 'undefined';
exports.isLIElement = (node) => node.tagName === 'LI';
exports.isOLElement = (node) => node.tagName === 'OL';
exports.isInputElement = (node) => node.tagName === 'INPUT';
exports.isHTMLElement = (node) => node.tagName === 'HTML';
exports.isSVGElement = (node) => node.tagName === 'svg';
exports.isBodyElement = (node) => node.tagName === 'BODY';
exports.isCanvasElement = (node) => node.tagName === 'CANVAS';
exports.isImageElement = (node) => node.tagName === 'IMG';
exports.isIFrameElement = (node) => node.tagName === 'IFRAME';
exports.isStyleElement = (node) => node.tagName === 'STYLE';
exports.isScriptElement = (node) => node.tagName === 'SCRIPT';
exports.isTextareaElement = (node) => node.tagName === 'TEXTAREA';
exports.isSelectElement = (node) => node.tagName === 'SELECT';
exports.isAnchorElement = (node) => node.tagName === 'A';
//# sourceMappingURL=node-parser.js.map