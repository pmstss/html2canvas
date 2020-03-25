"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stacking_context_1 = require("../stacking-context");
const color_1 = require("../../css/types/color");
const logger_1 = require("../../core/logger");
const border_style_1 = require("../../css/property-descriptors/border-style");
const path_1 = require("../path");
const background_clip_1 = require("../../css/property-descriptors/background-clip");
const bound_curves_1 = require("../bound-curves");
const bezier_curve_1 = require("../bezier-curve");
const vector_1 = require("../vector");
const image_1 = require("../../css/types/image");
const border_1 = require("../border");
const background_1 = require("../background");
const parser_1 = require("../../css/syntax/parser");
const text_1 = require("../../css/layout/text");
const css_line_break_1 = require("css-line-break");
const image_element_container_1 = require("../../dom/replaced-elements/image-element-container");
const box_sizing_1 = require("../box-sizing");
const canvas_element_container_1 = require("../../dom/replaced-elements/canvas-element-container");
const svg_element_container_1 = require("../../dom/replaced-elements/svg-element-container");
const effects_1 = require("../effects");
const bitwise_1 = require("../../core/bitwise");
const gradient_1 = require("../../css/types/functions/gradient");
const length_percentage_1 = require("../../css/types/length-percentage");
const font_metrics_1 = require("../font-metrics");
const bounds_1 = require("../../css/layout/bounds");
const list_style_type_1 = require("../../css/property-descriptors/list-style-type");
const line_height_1 = require("../../css/property-descriptors/line-height");
const input_element_container_1 = require("../../dom/replaced-elements/input-element-container");
const text_align_1 = require("../../css/property-descriptors/text-align");
const textarea_element_container_1 = require("../../dom/elements/textarea-element-container");
const select_element_container_1 = require("../../dom/elements/select-element-container");
const iframe_element_container_1 = require("../../dom/replaced-elements/iframe-element-container");
const anchor_element_container_1 = require("../../dom/elements/anchor-element-container");
const MASK_OFFSET = 10000;
class CanvasRenderer {
    constructor(options) {
        this._activeEffects = [];
        this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.options = options;
        if (!options.canvas) {
            this.canvas.width = Math.floor(options.width * options.scale);
            this.canvas.height = Math.floor(options.height * options.scale);
            this.canvas.style.width = `${options.width}px`;
            this.canvas.style.height = `${options.height}px`;
        }
        this.fontMetrics = new font_metrics_1.FontMetrics(document);
        this.ctx.scale(this.options.scale, this.options.scale);
        this.ctx.translate(-options.x + options.scrollX, -options.y + options.scrollY);
        this.ctx.textBaseline = 'bottom';
        this._activeEffects = [];
        logger_1.Logger.getInstance(options.id).debug(`Canvas renderer initialized (${options.width}x${options.height} at ${options.x},${options.y}) with scale ${options.scale}`);
    }
    applyEffects(effects, target) {
        while (this._activeEffects.length) {
            this.popEffect();
        }
        effects.filter(effect => bitwise_1.contains(effect.target, target)).forEach(effect => this.applyEffect(effect));
    }
    applyEffect(effect) {
        this.ctx.save();
        if (effects_1.isTransformEffect(effect)) {
            this.ctx.translate(effect.offsetX, effect.offsetY);
            this.ctx.transform(effect.matrix[0], effect.matrix[1], effect.matrix[2], effect.matrix[3], effect.matrix[4], effect.matrix[5]);
            this.ctx.translate(-effect.offsetX, -effect.offsetY);
        }
        if (effects_1.isClipEffect(effect)) {
            this.path(effect.path);
            this.ctx.clip();
        }
        this._activeEffects.push(effect);
    }
    popEffect() {
        this._activeEffects.pop();
        this.ctx.restore();
    }
    async renderStack(stack, root = false) {
        const styles = stack.element.container.styles;
        if (styles.isVisible()) {
            this.ctx.globalAlpha = styles.opacity;
            await this.renderStackContent(stack, root);
        }
    }
    async renderNode(paint) {
        if (paint.container.styles.isVisible()) {
            await this.renderNodeBackgroundAndBorders(paint);
            await this.renderNodeContent(paint);
        }
    }
    renderTextWithLetterSpacing(text, letterSpacing) {
        if (letterSpacing === 0) {
            this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
        }
        else {
            const letters = css_line_break_1.toCodePoints(text.text).map(i => css_line_break_1.fromCodePoint(i));
            letters.reduce((left, letter) => {
                this.ctx.fillText(letter, left, text.bounds.top + text.bounds.height);
                return left + this.ctx.measureText(letter).width;
            }, text.bounds.left);
        }
    }
    createFontStyle(styles) {
        const fontVariant = styles.fontVariant
            .filter(variant => variant === 'normal' || variant === 'small-caps')
            .join('');
        const fontFamily = styles.fontFamily.join(', ');
        const fontSize = parser_1.isDimensionToken(styles.fontSize)
            ? `${styles.fontSize.number}${styles.fontSize.unit}`
            : `${styles.fontSize.number}px`;
        return [
            [styles.fontStyle, fontVariant, styles.fontWeight, fontSize, fontFamily].join(' '),
            fontFamily,
            fontSize
        ];
    }
    async renderTextNode(text, styles) {
        const [font, fontFamily, fontSize] = this.createFontStyle(styles);
        this.ctx.font = font;
        text.textBounds.forEach(text => {
            this.ctx.fillStyle = color_1.asString(styles.color);
            this.renderTextWithLetterSpacing(text, styles.letterSpacing);
            const textShadows = styles.textShadow;
            if (textShadows.length && text.text.trim().length) {
                textShadows
                    .slice(0)
                    .reverse()
                    .forEach(textShadow => {
                    this.ctx.shadowColor = color_1.asString(textShadow.color);
                    this.ctx.shadowOffsetX = textShadow.offsetX.number * this.options.scale;
                    this.ctx.shadowOffsetY = textShadow.offsetY.number * this.options.scale;
                    this.ctx.shadowBlur = textShadow.blur.number;
                    this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
                });
                this.ctx.shadowColor = '';
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
                this.ctx.shadowBlur = 0;
            }
            if (styles.textDecorationLine.length) {
                this.ctx.fillStyle = color_1.asString(styles.textDecorationColor || styles.color);
                styles.textDecorationLine.forEach(textDecorationLine => {
                    switch (textDecorationLine) {
                        case 1 /* UNDERLINE */:
                            // Draws a line at the baseline of the font
                            // TODO As some browsers display the line as more than 1px if the font-size is big,
                            // need to take that into account both in position and size
                            const { baseline } = this.fontMetrics.getMetrics(fontFamily, fontSize);
                            this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top + baseline), text.bounds.width, 1);
                            break;
                        case 2 /* OVERLINE */:
                            this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top), text.bounds.width, 1);
                            break;
                        case 3 /* LINE_THROUGH */:
                            // TODO try and find exact position for line-through
                            // const {middle} = this.fontMetrics.getMetrics(fontFamily, fontSize);
                            const middle = Math.floor(text.bounds.height / 2) + 1;
                            this.ctx.fillRect(text.bounds.left, Math.ceil(text.bounds.top + middle), text.bounds.width, 1);
                            break;
                    }
                });
            }
        });
    }
    renderReplacedElement(container, _curves, image) {
        if (image && container.intrinsicWidth > 0 && container.intrinsicHeight > 0) {
            const box = box_sizing_1.contentBox(container);
            // const path = calculatePaddingBoxPath(curves);
            // this.path(path);
            // this.ctx.save();
            // this.ctx.clip();
            this.ctx.drawImage(image, 0, 0, container.intrinsicWidth, container.intrinsicHeight, box.left, box.top, box.width, box.height);
            // this.ctx.restore();
        }
    }
    async renderNodeContent(paint) {
        this.applyEffects(paint.effects, 4 /* CONTENT */);
        const container = paint.container;
        const curves = paint.curves;
        const styles = container.styles;
        if (container instanceof anchor_element_container_1.AnchorElementContainer && this.options.linkCallback) {
            this.options.linkCallback(container.href, container.bounds);
        }
        for (const child of container.textNodes) {
            await this.renderTextNode(child, styles);
        }
        if (container instanceof image_element_container_1.ImageElementContainer) {
            try {
                const image = await this.options.cache.match(container.src);
                this.renderReplacedElement(container, curves, image);
            }
            catch (e) {
                logger_1.Logger.getInstance(this.options.id).error(`Error loading image ${container.src}`);
            }
        }
        if (container instanceof canvas_element_container_1.CanvasElementContainer) {
            this.renderReplacedElement(container, curves, container.canvas);
        }
        if (container instanceof svg_element_container_1.SVGElementContainer) {
            try {
                const image = await this.options.cache.match(container.svg);
                this.renderReplacedElement(container, curves, image);
            }
            catch (e) {
                logger_1.Logger.getInstance(this.options.id).error(`Error loading svg ${container.svg.substring(0, 255)}`);
            }
        }
        if (container instanceof iframe_element_container_1.IFrameElementContainer && container.tree) {
            const iframeRenderer = new CanvasRenderer({
                id: this.options.id,
                scale: this.options.scale,
                backgroundColor: container.backgroundColor,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                width: container.width,
                height: container.height,
                cache: this.options.cache,
                windowWidth: container.width,
                windowHeight: container.height
            });
            const canvas = await iframeRenderer.render(container.tree);
            if (container.width && container.height) {
                this.ctx.drawImage(canvas, 0, 0, container.width, container.height, container.bounds.left, container.bounds.top, container.bounds.width, container.bounds.height);
            }
        }
        if (container instanceof input_element_container_1.InputElementContainer) {
            const size = Math.min(container.bounds.width, container.bounds.height);
            if (container.type === input_element_container_1.CHECKBOX) {
                if (container.checked) {
                    this.ctx.save();
                    this.path([
                        new vector_1.Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79),
                        new vector_1.Vector(container.bounds.left + size * 0.16, container.bounds.top + size * 0.5549),
                        new vector_1.Vector(container.bounds.left + size * 0.27347, container.bounds.top + size * 0.44071),
                        new vector_1.Vector(container.bounds.left + size * 0.39694, container.bounds.top + size * 0.5649),
                        new vector_1.Vector(container.bounds.left + size * 0.72983, container.bounds.top + size * 0.23),
                        new vector_1.Vector(container.bounds.left + size * 0.84, container.bounds.top + size * 0.34085),
                        new vector_1.Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79)
                    ]);
                    this.ctx.fillStyle = color_1.asString(input_element_container_1.INPUT_COLOR);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
            else if (container.type === input_element_container_1.RADIO) {
                if (container.checked) {
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.arc(container.bounds.left + size / 2, container.bounds.top + size / 2, size / 4, 0, Math.PI * 2, true);
                    this.ctx.fillStyle = color_1.asString(input_element_container_1.INPUT_COLOR);
                    this.ctx.fill();
                    this.ctx.restore();
                }
            }
        }
        if (isTextInputElement(container) && container.value.length) {
            [this.ctx.font] = this.createFontStyle(styles);
            this.ctx.fillStyle = color_1.asString(styles.color);
            this.ctx.textBaseline = 'middle';
            this.ctx.textAlign = canvasTextAlign(container.styles.textAlign);
            const bounds = box_sizing_1.contentBox(container);
            let x = 0;
            switch (container.styles.textAlign) {
                case text_align_1.TEXT_ALIGN.CENTER:
                    x += bounds.width / 2;
                    break;
                case text_align_1.TEXT_ALIGN.RIGHT:
                    x += bounds.width;
                    break;
            }
            const textBounds = bounds.add(x, 0, 0, -bounds.height / 2 + 1);
            this.ctx.save();
            this.path([
                new vector_1.Vector(bounds.left, bounds.top),
                new vector_1.Vector(bounds.left + bounds.width, bounds.top),
                new vector_1.Vector(bounds.left + bounds.width, bounds.top + bounds.height),
                new vector_1.Vector(bounds.left, bounds.top + bounds.height)
            ]);
            this.ctx.clip();
            this.renderTextWithLetterSpacing(new text_1.TextBounds(container.value, textBounds), styles.letterSpacing);
            this.ctx.restore();
            this.ctx.textBaseline = 'bottom';
            this.ctx.textAlign = 'left';
        }
        if (bitwise_1.contains(container.styles.display, 2048 /* LIST_ITEM */)) {
            if (container.styles.listStyleImage !== null) {
                const img = container.styles.listStyleImage;
                if (img.type === image_1.CSSImageType.URL) {
                    let image;
                    const url = img.url;
                    try {
                        image = await this.options.cache.match(url);
                        this.ctx.drawImage(image, container.bounds.left - (image.width + 10), container.bounds.top);
                    }
                    catch (e) {
                        logger_1.Logger.getInstance(this.options.id).error(`Error loading list-style-image ${url}`);
                    }
                }
            }
            else if (paint.listValue && container.styles.listStyleType !== list_style_type_1.LIST_STYLE_TYPE.NONE) {
                [this.ctx.font] = this.createFontStyle(styles);
                this.ctx.fillStyle = color_1.asString(styles.color);
                this.ctx.textBaseline = 'middle';
                this.ctx.textAlign = 'right';
                const bounds = new bounds_1.Bounds(container.bounds.left, container.bounds.top + length_percentage_1.getAbsoluteValue(container.styles.paddingTop, container.bounds.width), container.bounds.width, line_height_1.computeLineHeight(styles.lineHeight, styles.fontSize.number) / 2 + 1);
                this.renderTextWithLetterSpacing(new text_1.TextBounds(paint.listValue, bounds), styles.letterSpacing);
                this.ctx.textBaseline = 'bottom';
                this.ctx.textAlign = 'left';
            }
        }
    }
    async renderStackContent(stack, root) {
        const stopEnabled = this.options.shouldStopCallback && (this.options.shouldStopOnInner || root);
        const timeframe = typeof this.options.shouldStopTimeframe === 'number' ? this.options.shouldStopTimeframe : 200;
        let lastCall = Date.now();
        const shouldStop = async () => {
            if (!stopEnabled) {
                return false;
            }
            const res = this.options.shouldStopCallback && this.options.shouldStopCallback();
            if (res) {
                return true;
            }
            // for main thread throttle
            const currentCall = Date.now();
            if (root && currentCall - lastCall > timeframe) {
                await new Promise(r => setTimeout(r, 0));
            }
            lastCall = currentCall;
            return false;
        };
        // https://www.w3.org/TR/css-position-3/#painting-order
        // 1. the background and borders of the element forming the stacking context.
        await this.renderNodeBackgroundAndBorders(stack.element);
        // 2. the child stacking contexts with negative stack levels (most negative first).
        for (const child of stack.negativeZIndex) {
            if (await shouldStop()) {
                break;
            }
            await this.renderStack(child);
        }
        if (await shouldStop()) {
            return;
        }
        // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
        await this.renderNodeContent(stack.element);
        for (const child of stack.nonInlineLevel) {
            if (await shouldStop()) {
                break;
            }
            await this.renderNode(child);
        }
        if (await shouldStop()) {
            return;
        }
        // 4. All non-positioned floating descendants, in tree order. For each one of these,
        // treat the element as if it created a new stacking context, but any positioned descendants and descendants
        // which actually create a new stacking context should be considered part of the parent stacking context,
        // not this new one.
        for (const child of stack.nonPositionedFloats) {
            if (await shouldStop()) {
                break;
            }
            await this.renderStack(child);
        }
        if (await shouldStop()) {
            return;
        }
        // 5. the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.
        for (const child of stack.nonPositionedInlineLevel) {
            if (await shouldStop()) {
                break;
            }
            await this.renderStack(child);
        }
        if (await shouldStop()) {
            return;
        }
        for (const child of stack.inlineLevel) {
            if (await shouldStop()) {
                break;
            }
            await this.renderNode(child);
        }
        if (await shouldStop()) {
            return;
        }
        // 6. All positioned, opacity or transform descendants, in tree order that fall into the following categories:
        //  All positioned descendants with 'z-index: auto' or 'z-index: 0', in tree order.
        //  For those with 'z-index: auto', treat the element as if it created a new stacking context,
        //  but any positioned descendants and descendants which actually create a new stacking context should be
        //  considered part of the parent stacking context, not this new one. For those with 'z-index: 0',
        //  treat the stacking context generated atomically.
        //
        //  All opacity descendants with opacity less than 1
        //
        //  All transform descendants with transform other than none
        for (const child of stack.zeroOrAutoZIndexOrTransformedOrOpacity) {
            if (await shouldStop()) {
                break;
            }
            await this.renderStack(child);
        }
        if (await shouldStop()) {
            return;
        }
        // 7. Stacking contexts formed by positioned descendants with z-indices greater than or equal to 1 in z-index
        // order (smallest first) then tree order.
        for (const child of stack.positiveZIndex) {
            if (await shouldStop()) {
                break;
            }
            await this.renderStack(child);
        }
    }
    mask(paths) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.canvas.width, 0);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(0, 0);
        this.formatPath(paths.slice(0).reverse());
        this.ctx.closePath();
    }
    path(paths) {
        this.ctx.beginPath();
        this.formatPath(paths);
        this.ctx.closePath();
    }
    formatPath(paths) {
        paths.forEach((point, index) => {
            const start = bezier_curve_1.isBezierCurve(point) ? point.start : point;
            if (index === 0) {
                this.ctx.moveTo(start.x, start.y);
            }
            else {
                this.ctx.lineTo(start.x, start.y);
            }
            if (bezier_curve_1.isBezierCurve(point)) {
                this.ctx.bezierCurveTo(point.startControl.x, point.startControl.y, point.endControl.x, point.endControl.y, point.end.x, point.end.y);
            }
        });
    }
    renderRepeat(path, pattern, offsetX, offsetY) {
        this.path(path);
        this.ctx.fillStyle = pattern;
        this.ctx.translate(offsetX, offsetY);
        this.ctx.fill();
        this.ctx.translate(-offsetX, -offsetY);
    }
    resizeImage(image, width, height) {
        if (image.width === width && image.height === height) {
            return image;
        }
        const canvas = this.canvas.ownerDocument.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
        return canvas;
    }
    async renderBackgroundImage(container) {
        let index = container.styles.backgroundImage.length - 1;
        for (const backgroundImage of container.styles.backgroundImage.slice(0).reverse()) {
            if (backgroundImage.type === image_1.CSSImageType.URL) {
                let image;
                const url = backgroundImage.url;
                try {
                    image = await this.options.cache.match(url);
                }
                catch (e) {
                    logger_1.Logger.getInstance(this.options.id).error(`Error loading background-image ${url}`);
                }
                if (image) {
                    const [path, x, y, width, height] = background_1.calculateBackgroundRendering(container, index, [
                        image.width,
                        image.height,
                        image.width / image.height
                    ]);
                    const pattern = this.ctx.createPattern(this.resizeImage(image, width, height), 'repeat');
                    this.renderRepeat(path, pattern, x, y);
                }
            }
            else if (image_1.isLinearGradient(backgroundImage)) {
                const [path, x, y, width, height] = background_1.calculateBackgroundRendering(container, index, [null, null, null]);
                const [lineLength, x0, x1, y0, y1] = gradient_1.calculateGradientDirection(backgroundImage.angle, width, height);
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
                gradient_1.processColorStops(backgroundImage.stops, lineLength).forEach(colorStop => gradient.addColorStop(colorStop.stop, color_1.asString(colorStop.color)));
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                if (width > 0 && height > 0) {
                    const pattern = this.ctx.createPattern(canvas, 'repeat');
                    this.renderRepeat(path, pattern, x, y);
                }
            }
            else if (image_1.isRadialGradient(backgroundImage)) {
                const [path, left, top, width, height] = background_1.calculateBackgroundRendering(container, index, [
                    null,
                    null,
                    null
                ]);
                const position = backgroundImage.position.length === 0 ? [length_percentage_1.FIFTY_PERCENT] : backgroundImage.position;
                const x = length_percentage_1.getAbsoluteValue(position[0], width);
                const y = length_percentage_1.getAbsoluteValue(position[position.length - 1], height);
                const [rx, ry] = gradient_1.calculateRadius(backgroundImage, x, y, width, height);
                if (rx > 0 && rx > 0) {
                    const radialGradient = this.ctx.createRadialGradient(left + x, top + y, 0, left + x, top + y, rx);
                    gradient_1.processColorStops(backgroundImage.stops, rx * 2).forEach(colorStop => radialGradient.addColorStop(colorStop.stop, color_1.asString(colorStop.color)));
                    this.path(path);
                    this.ctx.fillStyle = radialGradient;
                    if (rx !== ry) {
                        // transforms for elliptical radial gradient
                        const midX = container.bounds.left + 0.5 * container.bounds.width;
                        const midY = container.bounds.top + 0.5 * container.bounds.height;
                        const f = ry / rx;
                        const invF = 1 / f;
                        this.ctx.save();
                        this.ctx.translate(midX, midY);
                        this.ctx.transform(1, 0, 0, f, 0, 0);
                        this.ctx.translate(-midX, -midY);
                        this.ctx.fillRect(left, invF * (top - midY) + midY, width, height * invF);
                        this.ctx.restore();
                    }
                    else {
                        this.ctx.fill();
                    }
                }
            }
            index--;
        }
    }
    async renderBorder(color, side, curvePoints) {
        this.path(border_1.parsePathForBorder(curvePoints, side));
        this.ctx.fillStyle = color_1.asString(color);
        this.ctx.fill();
    }
    async renderNodeBackgroundAndBorders(paint) {
        this.applyEffects(paint.effects, 2 /* BACKGROUND_BORDERS */);
        const styles = paint.container.styles;
        const hasBackground = !color_1.isTransparent(styles.backgroundColor) || styles.backgroundImage.length;
        const borders = [
            { style: styles.borderTopStyle, color: styles.borderTopColor },
            { style: styles.borderRightStyle, color: styles.borderRightColor },
            { style: styles.borderBottomStyle, color: styles.borderBottomColor },
            { style: styles.borderLeftStyle, color: styles.borderLeftColor }
        ];
        const backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(background_1.getBackgroundValueForIndex(styles.backgroundClip, 0), paint.curves);
        if (hasBackground || styles.boxShadow.length) {
            this.ctx.save();
            this.path(backgroundPaintingArea);
            this.ctx.clip();
            if (!color_1.isTransparent(styles.backgroundColor)) {
                this.ctx.fillStyle = color_1.asString(styles.backgroundColor);
                this.ctx.fill();
            }
            await this.renderBackgroundImage(paint.container);
            this.ctx.restore();
            styles.boxShadow
                .slice(0)
                .reverse()
                .forEach(shadow => {
                this.ctx.save();
                const borderBoxArea = bound_curves_1.calculateBorderBoxPath(paint.curves);
                const maskOffset = shadow.inset ? 0 : MASK_OFFSET;
                const shadowPaintingArea = path_1.transformPath(borderBoxArea, -maskOffset + (shadow.inset ? 1 : -1) * shadow.spread.number, (shadow.inset ? 1 : -1) * shadow.spread.number, shadow.spread.number * (shadow.inset ? -2 : 2), shadow.spread.number * (shadow.inset ? -2 : 2));
                if (shadow.inset) {
                    this.path(borderBoxArea);
                    this.ctx.clip();
                    this.mask(shadowPaintingArea);
                }
                else {
                    this.mask(borderBoxArea);
                    this.ctx.clip();
                    this.path(shadowPaintingArea);
                }
                this.ctx.shadowOffsetX = shadow.offsetX.number + maskOffset;
                this.ctx.shadowOffsetY = shadow.offsetY.number;
                this.ctx.shadowColor = color_1.asString(shadow.color);
                this.ctx.shadowBlur = shadow.blur.number;
                this.ctx.fillStyle = shadow.inset ? color_1.asString(shadow.color) : 'rgba(0,0,0,1)';
                this.ctx.fill();
                this.ctx.restore();
            });
        }
        let side = 0;
        for (const border of borders) {
            if (border.style !== border_style_1.BORDER_STYLE.NONE && !color_1.isTransparent(border.color)) {
                await this.renderBorder(border.color, side, paint.curves);
            }
            side++;
        }
    }
    async render(element) {
        if (this.options.backgroundColor) {
            this.ctx.fillStyle = color_1.asString(this.options.backgroundColor);
            this.ctx.fillRect(this.options.x - this.options.scrollX, this.options.y - this.options.scrollY, this.options.width, this.options.height);
        }
        const stack = stacking_context_1.parseStackingContexts(element);
        if (this.options.shouldStopCallback && this.options.shouldStopCallback()) {
            return this.canvas;
        }
        await this.renderStack(stack, true);
        if (this.options.shouldStopCallback && this.options.shouldStopCallback()) {
            return this.canvas;
        }
        this.applyEffects([], 2 /* BACKGROUND_BORDERS */);
        return this.canvas;
    }
}
exports.CanvasRenderer = CanvasRenderer;
const isTextInputElement = (container) => {
    if (container instanceof textarea_element_container_1.TextareaElementContainer) {
        return true;
    }
    else if (container instanceof select_element_container_1.SelectElementContainer) {
        return true;
    }
    else if (container instanceof input_element_container_1.InputElementContainer && container.type !== input_element_container_1.RADIO && container.type !== input_element_container_1.CHECKBOX) {
        return true;
    }
    return false;
};
const calculateBackgroundCurvedPaintingArea = (clip, curves) => {
    switch (clip) {
        case background_clip_1.BACKGROUND_CLIP.BORDER_BOX:
            return bound_curves_1.calculateBorderBoxPath(curves);
        case background_clip_1.BACKGROUND_CLIP.CONTENT_BOX:
            return bound_curves_1.calculateContentBoxPath(curves);
        case background_clip_1.BACKGROUND_CLIP.PADDING_BOX:
        default:
            return bound_curves_1.calculatePaddingBoxPath(curves);
    }
};
const canvasTextAlign = (textAlign) => {
    switch (textAlign) {
        case text_align_1.TEXT_ALIGN.CENTER:
            return 'center';
        case text_align_1.TEXT_ALIGN.RIGHT:
            return 'right';
        case text_align_1.TEXT_ALIGN.LEFT:
        default:
            return 'left';
    }
};
//# sourceMappingURL=canvas-renderer.js.map