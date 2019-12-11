"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var css_1 = require("../css");
var element_container_1 = require("./element-container");
var text_container_1 = require("./text-container");
var image_element_container_1 = require("./replaced-elements/image-element-container");
var canvas_element_container_1 = require("./replaced-elements/canvas-element-container");
var svg_element_container_1 = require("./replaced-elements/svg-element-container");
var li_element_container_1 = require("./elements/li-element-container");
var ol_element_container_1 = require("./elements/ol-element-container");
var input_element_container_1 = require("./replaced-elements/input-element-container");
var select_element_container_1 = require("./elements/select-element-container");
var textarea_element_container_1 = require("./elements/textarea-element-container");
var iframe_element_container_1 = require("./replaced-elements/iframe-element-container");
var anchor_element_container_1 = require("./elements/anchor-element-container");
var word_break_1 = require("../css/property-descriptors/word-break");
var bounds_1 = require("../css/layout/bounds");
var text_1 = require("../css/layout/text");
var LIST_OWNERS = ['OL', 'UL', 'MENU'];
var EPS = 0.01;
// TODO: move to options
var useTextSplitDnc = '*'.charCodeAt(0) === 42; // to avoid trim from dist build
/**
 * Custom getClientRects() implementation with combining adjacent rects
 * @param range source of client rects
 */
var getClientRects = function (range) {
    return Array.from(range.getClientRects()).reduce(function (res, rect) {
        if (res.length > 0) {
            var prevRect = res[res.length - 1];
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
var splitTextByLineWrapsLinear = function (textNode, range) {
    range.selectNodeContents(textNode);
    if (getClientRects(range).length < 2) {
        return [textNode];
    }
    var textNodes = [];
    var i = 0;
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
var splitTextIntoSingleRectNodes = function (textNode, range) {
    if (!textNode.data) {
        return [];
    }
    range.selectNodeContents(textNode);
    // this is the most expensive operation, that should be minimized
    var clientRects = getClientRects(range);
    // filtering empty/hidden/etc nodes for proper expectedPartLength
    var numberOfRects = clientRects.length;
    var numberOfLines = Math.max(1, clientRects.filter(function (r) { return r.width > 1 && r.height > 1; }).length);
    if (numberOfRects < 2) {
        return [textNode];
    }
    var textNodes = [];
    // as getClientRects() is expensive, instead of binary split recursive calls,
    // minimizing its usage by splitting into N parts at once
    var numberOfParts = Math.max(2, numberOfLines);
    var expectedPartLength = Math.floor(textNode.data.length / numberOfParts);
    var i = 0;
    while (++i < numberOfParts) {
        var secondPart = textNode.splitText(expectedPartLength);
        if (textNode.data) {
            textNodes.push(textNode);
        }
        textNode = secondPart;
    }
    if (textNode.data) {
        textNodes.push(textNode);
    }
    return textNodes.reduce(function (res, subTextNode) { return __spreadArrays(res, splitTextIntoSingleRectNodes(subTextNode, range)); }, []);
};
/**
 * "Divide and conquer" approach for split by lines wrap in contrast to splitTextByLineWrapsLinear()
 * @param textNode Text node to split
 * @param range pre-created Range
 * @see splitTextByLineWrapsLinear()
 */
var splitTextByLineWrapsDnc = function (textNode, range) {
    range.selectNodeContents(textNode);
    if (getClientRects(range).length < 2) {
        return [textNode];
    }
    // preprocess for performance reasons
    var textNodes = splitByNewLines(textNode);
    // actual "Divide and conquer" calls
    textNodes = textNodes.reduce(function (res, subTextNode) { return __spreadArrays(res, splitTextIntoSingleRectNodes(subTextNode, range)); }, []);
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
var splitByNewLines = function (textNode) {
    if (textNode.data.includes('\n')) {
        var textNodes = [];
        while (textNode.data.includes('\n')) {
            var idx = textNode.data.indexOf('\n');
            // extract '\n' into separate node, not included into result, but major for proper client rect calculations
            var secondPart = textNode.splitText(idx);
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
var mergeAdjacentOneLinesNodes = function (textNodes, range) {
    return textNodes.reduce(function (res, textNode) {
        var prevTextNode = res.length > 0 ? res[res.length - 1] : null;
        if (prevTextNode) {
            range.selectNodeContents(prevTextNode);
            var tmpRects = getClientRects(range);
            var prevClientRect = tmpRects[tmpRects.length - 1];
            range.selectNodeContents(textNode);
            var clientRect = getClientRects(range)[0];
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
var moveSpacesToLineEnds = function (textNodes) {
    textNodes.forEach(function (textNode, idx) {
        if (idx > 0) {
            var spacePrefix_1 = null;
            textNode.data = textNode.data.replace(/^\s+/, function (token) {
                spacePrefix_1 = token;
                return '';
            });
            if (spacePrefix_1) {
                textNodes[idx - 1].appendData(spacePrefix_1);
            }
        }
    });
};
// TODO: trivial space normalization, could be wrong in some cases; improve
var getNormalizedText = function (txt) {
    var parent = txt.parentElement;
    return (txt.textContent || '').includes(parent.innerText)
        ? parent.innerText
        : (txt.textContent || '').replace(/[\t\n\r ]+/g, ' ');
};
var parseNodeTree = function (node, parent, root) {
    var _loop_1 = function (childNode, nextNode) {
        var _a;
        nextNode = childNode.nextSibling;
        if (exports.isTextNode(childNode) && childNode.data.trim().length > 0) {
            /*
              If node has more than 1 client rect, its bounding polygon is not always rect,
              so using getBoundingClientRect() further for drawing background leads to incorrect results.
              Workaround: split text node into single-rect text nodes with putting each one into aux ElementContainer,
              that inherits background props (color, etc) from parent node.
            */
            var range_1 = node.ownerDocument.createRange();
            var textNodes = useTextSplitDnc
                ? splitTextByLineWrapsDnc(childNode, range_1)
                : splitTextByLineWrapsLinear(childNode, range_1);
            var styles_1 = new css_1.CSSParsedDeclaration(window.getComputedStyle(node, null));
            /*
              After "manual" dividing into single client rect element, reset word-break property to avoid
              redundant additional processing by LineBreaker (see breakText())
             */
            styles_1.wordBreak = word_break_1.WORD_BREAK.NORMAL;
            /*
              Aux ElementContainer will inherit background color, so parent color can be omited to avoid
              drawing "invalid" BoundingClientRect.
             */
            parent.styles.backgroundColor = 0;
            (_a = parent.elements).push.apply(_a, textNodes.map(function (n) {
                range_1.selectNodeContents(n);
                var bounds = bounds_1.Bounds.fromClientRect(range_1.getBoundingClientRect());
                var auxTextContainer = new element_container_1.ElementContainer(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                null, styles_1, bounds);
                auxTextContainer.textNodes.push(new text_container_1.TextContainer(n, styles_1, [new text_1.TextBounds(getNormalizedText(n), bounds)]));
                return auxTextContainer;
            }));
        }
        else if (exports.isElementNode(childNode)) {
            var container = createContainer(childNode);
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
        out_nextNode_1 = nextNode;
    };
    var out_nextNode_1;
    for (var childNode = node.firstChild, nextNode = void 0; childNode; childNode = nextNode) {
        _loop_1(childNode, nextNode);
        nextNode = out_nextNode_1;
    }
};
var createContainer = function (element) {
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
exports.parseTree = function (element) {
    var container = createContainer(element);
    container.flags |= 4 /* CREATES_REAL_STACKING_CONTEXT */;
    parseNodeTree(element, container, container);
    return container;
};
var createsRealStackingContext = function (node, container, root) {
    return (container.styles.isPositionedWithZIndex() ||
        container.styles.opacity < 1 ||
        container.styles.isTransformed() ||
        (exports.isBodyElement(node) && root.styles.isTransparent()));
};
var createsStackingContext = function (styles) { return styles.isPositioned() || styles.isFloating(); };
exports.isTextNode = function (node) { return node.nodeType === Node.TEXT_NODE; };
exports.isElementNode = function (node) { return node.nodeType === Node.ELEMENT_NODE; };
exports.isHTMLElementNode = function (node) {
    return typeof node.style !== 'undefined';
};
exports.isLIElement = function (node) { return node.tagName === 'LI'; };
exports.isOLElement = function (node) { return node.tagName === 'OL'; };
exports.isInputElement = function (node) { return node.tagName === 'INPUT'; };
exports.isHTMLElement = function (node) { return node.tagName === 'HTML'; };
exports.isSVGElement = function (node) { return node.tagName === 'svg'; };
exports.isBodyElement = function (node) { return node.tagName === 'BODY'; };
exports.isCanvasElement = function (node) { return node.tagName === 'CANVAS'; };
exports.isImageElement = function (node) { return node.tagName === 'IMG'; };
exports.isIFrameElement = function (node) { return node.tagName === 'IFRAME'; };
exports.isStyleElement = function (node) { return node.tagName === 'STYLE'; };
exports.isScriptElement = function (node) { return node.tagName === 'SCRIPT'; };
exports.isTextareaElement = function (node) { return node.tagName === 'TEXTAREA'; };
exports.isSelectElement = function (node) { return node.tagName === 'SELECT'; };
exports.isAnchorElement = function (node) { return node.tagName === 'A'; };
//# sourceMappingURL=node-parser.js.map