"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_parser_1 = require("./node-parser");
const logger_1 = require("../core/logger");
const parser_1 = require("../css/syntax/parser");
const tokenizer_1 = require("../css/syntax/tokenizer");
const counter_1 = require("../css/types/functions/counter");
const list_style_type_1 = require("../css/property-descriptors/list-style-type");
const index_1 = require("../css/index");
const quotes_1 = require("../css/property-descriptors/quotes");
const IGNORE_ATTRIBUTE = 'data-html2canvas-ignore';
class DocumentCloner {
    constructor(element, options) {
        this.options = options;
        this.scrolledElements = [];
        this.referenceElement = element;
        this.counters = new counter_1.CounterState();
        this.quoteDepth = 0;
        if (!element.ownerDocument) {
            throw new Error('Cloned element does not have an owner document');
        }
        this.documentElement = this.cloneNode(element.ownerDocument.documentElement);
    }
    toIFrame(ownerDocument, windowSize) {
        const iframe = createIFrameContainer(ownerDocument, windowSize);
        if (!iframe.contentWindow) {
            return Promise.reject(`Unable to find iframe window`);
        }
        const scrollX = ownerDocument.defaultView.pageXOffset;
        const scrollY = ownerDocument.defaultView.pageYOffset;
        const cloneWindow = iframe.contentWindow;
        const documentClone = cloneWindow.document;
        /* Chrome doesn't detect relative background-images assigned in inline <style> sheets when fetched through getComputedStyle
         if window url is about:blank, we can assign the url to current by writing onto the document
         */
        const iframeLoad = iframeLoader(iframe).then(async () => {
            this.scrolledElements.forEach(restoreNodeScroll);
            if (cloneWindow) {
                cloneWindow.scrollTo(windowSize.left, windowSize.top);
                if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) &&
                    (cloneWindow.scrollY !== windowSize.top || cloneWindow.scrollX !== windowSize.left)) {
                    documentClone.documentElement.style.top = -windowSize.top + 'px';
                    documentClone.documentElement.style.left = -windowSize.left + 'px';
                    documentClone.documentElement.style.position = 'absolute';
                }
            }
            const onclone = this.options.onclone;
            if (typeof this.clonedReferenceElement === 'undefined') {
                return Promise.reject(`Error finding the ${this.referenceElement.nodeName} in the cloned document`);
            }
            if (documentClone.fonts && documentClone.fonts.ready) {
                await documentClone.fonts.ready;
            }
            if (typeof onclone === 'function') {
                return Promise.resolve()
                    .then(() => onclone(documentClone))
                    .then(() => iframe);
            }
            return iframe;
        });
        documentClone.open();
        documentClone.write(`${serializeDoctype(document.doctype)}<html></html>`);
        // Chrome scrolls the parent document for some reason after the write to the cloned window???
        restoreOwnerScroll(this.referenceElement.ownerDocument, scrollX, scrollY);
        documentClone.replaceChild(documentClone.adoptNode(this.documentElement), documentClone.documentElement);
        documentClone.close();
        return iframeLoad;
    }
    createElementClone(node) {
        if (node_parser_1.isCanvasElement(node)) {
            return this.createCanvasClone(node);
        }
        /*
        if (isIFrameElement(node)) {
            return this.createIFrameClone(node);
        }
*/
        if (node_parser_1.isStyleElement(node)) {
            return this.createStyleClone(node);
        }
        return node.cloneNode(false);
    }
    createStyleClone(node) {
        try {
            const sheet = node.sheet;
            if (sheet && sheet.cssRules) {
                const css = [].slice.call(sheet.cssRules, 0).reduce((css, rule) => {
                    if (rule && typeof rule.cssText === 'string') {
                        return css + rule.cssText;
                    }
                    return css;
                }, '');
                const style = node.cloneNode(false);
                style.textContent = css;
                return style;
            }
        }
        catch (e) {
            // accessing node.sheet.cssRules throws a DOMException
            logger_1.Logger.getInstance(this.options.id).error('Unable to access cssRules property', e);
            if (e.name !== 'SecurityError') {
                throw e;
            }
        }
        return node.cloneNode(false);
    }
    createCanvasClone(canvas) {
        if (this.options.inlineImages && canvas.ownerDocument) {
            const img = canvas.ownerDocument.createElement('img');
            try {
                img.src = canvas.toDataURL();
                return img;
            }
            catch (e) {
                logger_1.Logger.getInstance(this.options.id).info(`Unable to clone canvas contents, canvas is tainted`);
            }
        }
        const clonedCanvas = canvas.cloneNode(false);
        try {
            clonedCanvas.width = canvas.width;
            clonedCanvas.height = canvas.height;
            const ctx = canvas.getContext('2d');
            const clonedCtx = clonedCanvas.getContext('2d');
            if (clonedCtx) {
                if (ctx) {
                    clonedCtx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
                }
                else {
                    clonedCtx.drawImage(canvas, 0, 0);
                }
            }
            return clonedCanvas;
        }
        catch (e) { }
        return clonedCanvas;
    }
    /*
    createIFrameClone(iframe: HTMLIFrameElement) {
        const tempIframe = <HTMLIFrameElement>iframe.cloneNode(false);
        const iframeKey = generateIframeKey();
        tempIframe.setAttribute('data-html2canvas-internal-iframe-key', iframeKey);

        const {width, height} = parseBounds(iframe);

        this.resourceLoader.cache[iframeKey] = getIframeDocumentElement(iframe, this.options)
            .then(documentElement => {
                return this.renderer(
                    documentElement,
                    {
                        allowTaint: this.options.allowTaint,
                        backgroundColor: '#ffffff',
                        canvas: null,
                        imageTimeout: this.options.imageTimeout,
                        logging: this.options.logging,
                        proxy: this.options.proxy,
                        removeContainer: this.options.removeContainer,
                        scale: this.options.scale,
                        foreignObjectRendering: this.options.foreignObjectRendering,
                        useCORS: this.options.useCORS,
                        target: new CanvasRenderer(),
                        width,
                        height,
                        x: 0,
                        y: 0,
                        windowWidth: documentElement.ownerDocument.defaultView.innerWidth,
                        windowHeight: documentElement.ownerDocument.defaultView.innerHeight,
                        scrollX: documentElement.ownerDocument.defaultView.pageXOffset,
                        scrollY: documentElement.ownerDocument.defaultView.pageYOffset
                    },
                );
            })
            .then(
                (canvas: HTMLCanvasElement) =>
                    new Promise((resolve, reject) => {
                        const iframeCanvas = document.createElement('img');
                        iframeCanvas.onload = () => resolve(canvas);
                        iframeCanvas.onerror = (event) => {
                            // Empty iframes may result in empty "data:," URLs, which are invalid from the <img>'s point of view
                            // and instead of `onload` cause `onerror` and unhandled rejection warnings
                            // https://github.com/niklasvh/html2canvas/issues/1502
                            iframeCanvas.src == 'data:,' ? resolve(canvas) : reject(event);
                        };
                        iframeCanvas.src = canvas.toDataURL();
                        if (tempIframe.parentNode && iframe.ownerDocument && iframe.ownerDocument.defaultView) {
                            tempIframe.parentNode.replaceChild(
                                copyCSSStyles(
                                    iframe.ownerDocument.defaultView.getComputedStyle(iframe),
                                    iframeCanvas
                                ),
                                tempIframe
                            );
                        }
                    })
            );
        return tempIframe;
    }
*/
    cloneNode(node) {
        if (node_parser_1.isTextNode(node)) {
            return document.createTextNode(node.data);
        }
        if (!node.ownerDocument) {
            return node.cloneNode(false);
        }
        const window = node.ownerDocument.defaultView;
        if (node_parser_1.isHTMLElementNode(node) && window) {
            const clone = this.createElementClone(node);
            const style = window.getComputedStyle(node);
            const styleBefore = window.getComputedStyle(node, ':before');
            const styleAfter = window.getComputedStyle(node, ':after');
            if (this.referenceElement === node) {
                this.clonedReferenceElement = clone;
            }
            if (node_parser_1.isBodyElement(clone)) {
                createPseudoHideStyles(clone);
            }
            const counters = this.counters.parse(new index_1.CSSParsedCounterDeclaration(style));
            const before = this.resolvePseudoContent(node, clone, styleBefore, PseudoElementType.BEFORE);
            for (let child = node.firstChild; child; child = child.nextSibling) {
                if (!node_parser_1.isElementNode(child) ||
                    (!node_parser_1.isScriptElement(child) &&
                        !child.hasAttribute(IGNORE_ATTRIBUTE) &&
                        (typeof this.options.ignoreElements !== 'function' || !this.options.ignoreElements(child)))) {
                    if (!this.options.copyStyles || !node_parser_1.isElementNode(child) || !node_parser_1.isStyleElement(child)) {
                        clone.appendChild(this.cloneNode(child));
                    }
                }
            }
            if (before) {
                clone.insertBefore(before, clone.firstChild);
            }
            const after = this.resolvePseudoContent(node, clone, styleAfter, PseudoElementType.AFTER);
            if (after) {
                clone.appendChild(after);
            }
            this.counters.pop(counters);
            if (style && this.options.copyStyles && !node_parser_1.isIFrameElement(node)) {
                exports.copyCSSStyles(style, clone);
            }
            //this.inlineAllImages(clone);
            if (node.scrollTop !== 0 || node.scrollLeft !== 0) {
                this.scrolledElements.push([clone, node.scrollLeft, node.scrollTop]);
            }
            if ((node_parser_1.isTextareaElement(node) || node_parser_1.isSelectElement(node)) &&
                (node_parser_1.isTextareaElement(clone) || node_parser_1.isSelectElement(clone))) {
                clone.value = node.value;
            }
            return clone;
        }
        return node.cloneNode(false);
    }
    resolvePseudoContent(node, clone, style, pseudoElt) {
        if (!style) {
            return;
        }
        const value = style.content;
        const document = clone.ownerDocument;
        if (!document || !value || value === 'none' || value === '-moz-alt-content' || style.display === 'none') {
            return;
        }
        this.counters.parse(new index_1.CSSParsedCounterDeclaration(style));
        const declaration = new index_1.CSSParsedPseudoDeclaration(style);
        const anonymousReplacedElement = document.createElement('html2canvaspseudoelement');
        exports.copyCSSStyles(style, anonymousReplacedElement);
        declaration.content.forEach(token => {
            if (token.type === tokenizer_1.TokenType.STRING_TOKEN) {
                anonymousReplacedElement.appendChild(document.createTextNode(token.value));
            }
            else if (token.type === tokenizer_1.TokenType.URL_TOKEN) {
                const img = document.createElement('img');
                img.src = token.value;
                img.style.opacity = '1';
                anonymousReplacedElement.appendChild(img);
            }
            else if (token.type === tokenizer_1.TokenType.FUNCTION) {
                if (token.name === 'attr') {
                    const attr = token.values.filter(parser_1.isIdentToken);
                    if (attr.length) {
                        anonymousReplacedElement.appendChild(document.createTextNode(node.getAttribute(attr[0].value) || ''));
                    }
                }
                else if (token.name === 'counter') {
                    const [counter, counterStyle] = token.values.filter(parser_1.nonFunctionArgSeparator);
                    if (counter && parser_1.isIdentToken(counter)) {
                        const counterState = this.counters.getCounterValue(counter.value);
                        const counterType = counterStyle && parser_1.isIdentToken(counterStyle)
                            ? list_style_type_1.listStyleType.parse(counterStyle.value)
                            : list_style_type_1.LIST_STYLE_TYPE.DECIMAL;
                        anonymousReplacedElement.appendChild(document.createTextNode(counter_1.createCounterText(counterState, counterType, false)));
                    }
                }
                else if (token.name === 'counters') {
                    const [counter, delim, counterStyle] = token.values.filter(parser_1.nonFunctionArgSeparator);
                    if (counter && parser_1.isIdentToken(counter)) {
                        const counterStates = this.counters.getCounterValues(counter.value);
                        const counterType = counterStyle && parser_1.isIdentToken(counterStyle)
                            ? list_style_type_1.listStyleType.parse(counterStyle.value)
                            : list_style_type_1.LIST_STYLE_TYPE.DECIMAL;
                        const separator = delim && delim.type === tokenizer_1.TokenType.STRING_TOKEN ? delim.value : '';
                        const text = counterStates
                            .map(value => counter_1.createCounterText(value, counterType, false))
                            .join(separator);
                        anonymousReplacedElement.appendChild(document.createTextNode(text));
                    }
                }
                else {
                    //   console.log('FUNCTION_TOKEN', token);
                }
            }
            else if (token.type === tokenizer_1.TokenType.IDENT_TOKEN) {
                switch (token.value) {
                    case 'open-quote':
                        anonymousReplacedElement.appendChild(document.createTextNode(quotes_1.getQuote(declaration.quotes, this.quoteDepth++, true)));
                        break;
                    case 'close-quote':
                        anonymousReplacedElement.appendChild(document.createTextNode(quotes_1.getQuote(declaration.quotes, --this.quoteDepth, false)));
                        break;
                    default:
                        // safari doesn't parse string tokens correctly because of lack of quotes
                        anonymousReplacedElement.appendChild(document.createTextNode(token.value));
                }
            }
        });
        anonymousReplacedElement.className = `${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE} ${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}`;
        clone.className +=
            pseudoElt === PseudoElementType.BEFORE
                ? ` ${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE}`
                : ` ${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}`;
        return anonymousReplacedElement;
    }
    static destroy(container) {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
            return true;
        }
        return false;
    }
}
exports.DocumentCloner = DocumentCloner;
var PseudoElementType;
(function (PseudoElementType) {
    PseudoElementType[PseudoElementType["BEFORE"] = 0] = "BEFORE";
    PseudoElementType[PseudoElementType["AFTER"] = 1] = "AFTER";
})(PseudoElementType || (PseudoElementType = {}));
const createIFrameContainer = (ownerDocument, bounds) => {
    const cloneIframeContainer = ownerDocument.createElement('iframe');
    cloneIframeContainer.className = 'html2canvas-container';
    cloneIframeContainer.style.visibility = 'hidden';
    cloneIframeContainer.style.position = 'fixed';
    cloneIframeContainer.style.left = '-10000px';
    cloneIframeContainer.style.top = '0px';
    cloneIframeContainer.style.border = '0';
    cloneIframeContainer.width = bounds.width.toString();
    cloneIframeContainer.height = bounds.height.toString();
    cloneIframeContainer.scrolling = 'no'; // ios won't scroll without it
    cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE, 'true');
    ownerDocument.body.appendChild(cloneIframeContainer);
    return cloneIframeContainer;
};
const iframeLoader = (iframe) => {
    return new Promise((resolve, reject) => {
        const cloneWindow = iframe.contentWindow;
        if (!cloneWindow) {
            return reject(`No window assigned for iframe`);
        }
        const documentClone = cloneWindow.document;
        cloneWindow.onload = iframe.onload = documentClone.onreadystatechange = () => {
            cloneWindow.onload = iframe.onload = documentClone.onreadystatechange = null;
            const interval = setInterval(() => {
                if (documentClone.body.childNodes.length > 0 && documentClone.readyState === 'complete') {
                    clearInterval(interval);
                    resolve(iframe);
                }
            }, 50);
        };
    });
};
exports.copyCSSStyles = (style, target) => {
    // Edge does not provide value for cssText
    for (let i = style.length - 1; i >= 0; i--) {
        const property = style.item(i);
        // Safari shows pseudoelements if content is set
        if (property !== 'content') {
            target.style.setProperty(property, style.getPropertyValue(property));
        }
    }
    return target;
};
const serializeDoctype = (doctype) => {
    let str = '';
    if (doctype) {
        str += '<!DOCTYPE ';
        if (doctype.name) {
            str += doctype.name;
        }
        if (doctype.internalSubset) {
            str += doctype.internalSubset;
        }
        if (doctype.publicId) {
            str += `"${doctype.publicId}"`;
        }
        if (doctype.systemId) {
            str += `"${doctype.systemId}"`;
        }
        str += '>';
    }
    return str;
};
const restoreOwnerScroll = (ownerDocument, x, y) => {
    if (ownerDocument &&
        ownerDocument.defaultView &&
        (x !== ownerDocument.defaultView.pageXOffset || y !== ownerDocument.defaultView.pageYOffset)) {
        ownerDocument.defaultView.scrollTo(x, y);
    }
};
const restoreNodeScroll = ([element, x, y]) => {
    element.scrollLeft = x;
    element.scrollTop = y;
};
const PSEUDO_BEFORE = ':before';
const PSEUDO_AFTER = ':after';
const PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = '___html2canvas___pseudoelement_before';
const PSEUDO_HIDE_ELEMENT_CLASS_AFTER = '___html2canvas___pseudoelement_after';
const PSEUDO_HIDE_ELEMENT_STYLE = `{
    content: "" !important;
    display: none !important;
}`;
const createPseudoHideStyles = (body) => {
    createStyles(body, `.${PSEUDO_HIDE_ELEMENT_CLASS_BEFORE}${PSEUDO_BEFORE}${PSEUDO_HIDE_ELEMENT_STYLE}
         .${PSEUDO_HIDE_ELEMENT_CLASS_AFTER}${PSEUDO_AFTER}${PSEUDO_HIDE_ELEMENT_STYLE}`);
};
const createStyles = (body, styles) => {
    const document = body.ownerDocument;
    if (document) {
        const style = document.createElement('style');
        style.textContent = styles;
        body.appendChild(style);
    }
};
//# sourceMappingURL=document-cloner.js.map