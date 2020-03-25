"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bounds_1 = require("./css/layout/bounds");
const color_1 = require("./css/types/color");
const parser_1 = require("./css/syntax/parser");
const document_cloner_1 = require("./dom/document-cloner");
const node_parser_1 = require("./dom/node-parser");
const logger_1 = require("./core/logger");
const cache_storage_1 = require("./core/cache-storage");
const canvas_renderer_1 = require("./render/canvas/canvas-renderer");
const foreignobject_renderer_1 = require("./render/canvas/foreignobject-renderer");
const parseColor = (value) => color_1.color.parse(parser_1.Parser.create(value).parseComponentValue());
const html2canvas = (element, options = {}) => {
    return renderElement(element, options);
};
exports.default = html2canvas;
cache_storage_1.CacheStorage.setContext(window);
const renderElement = async (element, opts) => {
    const ownerDocument = element.ownerDocument;
    if (!ownerDocument) {
        throw new Error(`Element is not attached to a Document`);
    }
    const defaultView = ownerDocument.defaultView;
    if (!defaultView) {
        throw new Error(`Document is not attached to a Window`);
    }
    const instanceName = (Math.round(Math.random() * 1000) + Date.now()).toString(16);
    const { width, height, left, top } = node_parser_1.isBodyElement(element) || node_parser_1.isHTMLElement(element) ? bounds_1.parseDocumentSize(ownerDocument) : bounds_1.parseBounds(element);
    const defaultResourceOptions = {
        allowTaint: false,
        imageTimeout: 15000,
        proxy: undefined,
        useCORS: false
    };
    const resourceOptions = Object.assign(Object.assign({}, defaultResourceOptions), opts);
    const defaultOptions = {
        backgroundColor: '#ffffff',
        cache: opts.cache ? opts.cache : cache_storage_1.CacheStorage.create(instanceName, resourceOptions),
        logging: true,
        removeContainer: true,
        foreignObjectRendering: false,
        scale: defaultView.devicePixelRatio || 1,
        windowWidth: defaultView.innerWidth,
        windowHeight: defaultView.innerHeight,
        scrollX: defaultView.pageXOffset,
        scrollY: defaultView.pageYOffset,
        x: left,
        y: top,
        width: Math.ceil(width),
        height: Math.ceil(height),
        id: instanceName,
        cloneDisabled: false
    };
    const options = Object.assign(Object.assign(Object.assign({}, defaultOptions), resourceOptions), opts);
    const windowBounds = new bounds_1.Bounds(options.scrollX, options.scrollY, options.windowWidth, options.windowHeight);
    logger_1.Logger.create({ id: instanceName, enabled: options.logging });
    let clonedElement;
    let container = null;
    if (!options.cloneDisabled) {
        logger_1.Logger.getInstance(instanceName).debug(`Starting document clone`);
        const documentCloner = new document_cloner_1.DocumentCloner(element, {
            id: instanceName,
            onclone: options.onclone,
            ignoreElements: options.ignoreElements,
            inlineImages: options.foreignObjectRendering,
            copyStyles: options.foreignObjectRendering
        });
        clonedElement = documentCloner.clonedReferenceElement;
        container = await documentCloner.toIFrame(ownerDocument, windowBounds);
    }
    else {
        clonedElement = element;
    }
    if (!clonedElement) {
        return Promise.reject(`Unable to find element in cloned iframe`);
    }
    // http://www.w3.org/TR/css3-background/#special-backgrounds
    const documentBackgroundColor = ownerDocument.documentElement
        ? parseColor(getComputedStyle(ownerDocument.documentElement).backgroundColor)
        : color_1.COLORS.TRANSPARENT;
    const bodyBackgroundColor = ownerDocument.body
        ? parseColor(getComputedStyle(ownerDocument.body).backgroundColor)
        : color_1.COLORS.TRANSPARENT;
    const bgColor = opts.backgroundColor;
    const defaultBackgroundColor = typeof bgColor === 'string' ? parseColor(bgColor) : bgColor === null ? color_1.COLORS.TRANSPARENT : 0xffffffff;
    const backgroundColor = element === ownerDocument.documentElement
        ? color_1.isTransparent(documentBackgroundColor)
            ? color_1.isTransparent(bodyBackgroundColor)
                ? defaultBackgroundColor
                : bodyBackgroundColor
            : documentBackgroundColor
        : defaultBackgroundColor;
    const renderOptions = {
        id: instanceName,
        cache: options.cache,
        canvas: options.canvas,
        backgroundColor,
        scale: options.scale,
        x: options.x,
        y: options.y,
        scrollX: options.scrollX,
        scrollY: options.scrollY,
        width: options.width,
        height: options.height,
        windowWidth: options.windowWidth,
        windowHeight: options.windowHeight,
        linkCallback: options.linkCallback,
        shouldStopCallback: options.shouldStopCallback,
        shouldStopOnInner: options.shouldStopOnInner,
        shouldStopTimeframe: options.shouldStopTimeframe,
        nodeProgressClassName: options.nodeProgressClassName,
        nodeProgressCallback: options.nodeProgressCallback
    };
    let canvas;
    if (options.foreignObjectRendering) {
        logger_1.Logger.getInstance(instanceName).debug(`Document cloned, using foreign object rendering`);
        const renderer = new foreignobject_renderer_1.ForeignObjectRenderer(renderOptions);
        canvas = await renderer.render(clonedElement);
    }
    else {
        logger_1.Logger.getInstance(instanceName).debug(`Document cloned, using computed rendering`);
        cache_storage_1.CacheStorage.attachInstance(options.cache);
        logger_1.Logger.getInstance(instanceName).debug(`Starting DOM parsing`);
        const root = node_parser_1.parseTree(clonedElement);
        cache_storage_1.CacheStorage.detachInstance();
        if (backgroundColor === root.styles.backgroundColor) {
            root.styles.backgroundColor = color_1.COLORS.TRANSPARENT;
        }
        logger_1.Logger.getInstance(instanceName).debug(`Starting renderer`);
        const renderer = new canvas_renderer_1.CanvasRenderer(renderOptions);
        canvas = await renderer.render(root);
    }
    if (container && options.removeContainer === true) {
        if (!document_cloner_1.DocumentCloner.destroy(container)) {
            logger_1.Logger.getInstance(instanceName).error(`Cannot detach cloned iframe as it is not in the DOM anymore`);
        }
    }
    logger_1.Logger.getInstance(instanceName).debug(`Finished rendering`);
    logger_1.Logger.destroy(instanceName);
    cache_storage_1.CacheStorage.destroy(instanceName);
    return canvas;
};
//# sourceMappingURL=index.js.map