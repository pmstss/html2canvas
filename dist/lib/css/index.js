"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IPropertyDescriptor_1 = require("./IPropertyDescriptor");
const background_clip_1 = require("./property-descriptors/background-clip");
const background_color_1 = require("./property-descriptors/background-color");
const background_image_1 = require("./property-descriptors/background-image");
const background_origin_1 = require("./property-descriptors/background-origin");
const background_position_1 = require("./property-descriptors/background-position");
const background_repeat_1 = require("./property-descriptors/background-repeat");
const background_size_1 = require("./property-descriptors/background-size");
const border_color_1 = require("./property-descriptors/border-color");
const border_radius_1 = require("./property-descriptors/border-radius");
const border_style_1 = require("./property-descriptors/border-style");
const border_width_1 = require("./property-descriptors/border-width");
const color_1 = require("./property-descriptors/color");
const display_1 = require("./property-descriptors/display");
const float_1 = require("./property-descriptors/float");
const letter_spacing_1 = require("./property-descriptors/letter-spacing");
const line_break_1 = require("./property-descriptors/line-break");
const line_height_1 = require("./property-descriptors/line-height");
const list_style_image_1 = require("./property-descriptors/list-style-image");
const list_style_position_1 = require("./property-descriptors/list-style-position");
const list_style_type_1 = require("./property-descriptors/list-style-type");
const margin_1 = require("./property-descriptors/margin");
const overflow_1 = require("./property-descriptors/overflow");
const overflow_wrap_1 = require("./property-descriptors/overflow-wrap");
const padding_1 = require("./property-descriptors/padding");
const text_align_1 = require("./property-descriptors/text-align");
const position_1 = require("./property-descriptors/position");
const text_shadow_1 = require("./property-descriptors/text-shadow");
const text_transform_1 = require("./property-descriptors/text-transform");
const transform_1 = require("./property-descriptors/transform");
const transform_origin_1 = require("./property-descriptors/transform-origin");
const visibility_1 = require("./property-descriptors/visibility");
const word_break_1 = require("./property-descriptors/word-break");
const z_index_1 = require("./property-descriptors/z-index");
const parser_1 = require("./syntax/parser");
const tokenizer_1 = require("./syntax/tokenizer");
const color_2 = require("./types/color");
const angle_1 = require("./types/angle");
const image_1 = require("./types/image");
const opacity_1 = require("./property-descriptors/opacity");
const text_decoration_color_1 = require("./property-descriptors/text-decoration-color");
const text_decoration_line_1 = require("./property-descriptors/text-decoration-line");
const length_percentage_1 = require("./types/length-percentage");
const font_family_1 = require("./property-descriptors/font-family");
const font_size_1 = require("./property-descriptors/font-size");
const length_1 = require("./types/length");
const font_weight_1 = require("./property-descriptors/font-weight");
const font_variant_1 = require("./property-descriptors/font-variant");
const font_style_1 = require("./property-descriptors/font-style");
const bitwise_1 = require("../core/bitwise");
const content_1 = require("./property-descriptors/content");
const counter_increment_1 = require("./property-descriptors/counter-increment");
const counter_reset_1 = require("./property-descriptors/counter-reset");
const quotes_1 = require("./property-descriptors/quotes");
const box_shadow_1 = require("./property-descriptors/box-shadow");
class CSSParsedDeclaration {
    constructor(declaration) {
        this.backgroundClip = parse(background_clip_1.backgroundClip, declaration.backgroundClip);
        this.backgroundColor = parse(background_color_1.backgroundColor, declaration.backgroundColor);
        this.backgroundImage = parse(background_image_1.backgroundImage, declaration.backgroundImage);
        this.backgroundOrigin = parse(background_origin_1.backgroundOrigin, declaration.backgroundOrigin);
        this.backgroundPosition = parse(background_position_1.backgroundPosition, declaration.backgroundPosition);
        this.backgroundRepeat = parse(background_repeat_1.backgroundRepeat, declaration.backgroundRepeat);
        this.backgroundSize = parse(background_size_1.backgroundSize, declaration.backgroundSize);
        this.borderTopColor = parse(border_color_1.borderTopColor, declaration.borderTopColor);
        this.borderRightColor = parse(border_color_1.borderRightColor, declaration.borderRightColor);
        this.borderBottomColor = parse(border_color_1.borderBottomColor, declaration.borderBottomColor);
        this.borderLeftColor = parse(border_color_1.borderLeftColor, declaration.borderLeftColor);
        this.borderTopLeftRadius = parse(border_radius_1.borderTopLeftRadius, declaration.borderTopLeftRadius);
        this.borderTopRightRadius = parse(border_radius_1.borderTopRightRadius, declaration.borderTopRightRadius);
        this.borderBottomRightRadius = parse(border_radius_1.borderBottomRightRadius, declaration.borderBottomRightRadius);
        this.borderBottomLeftRadius = parse(border_radius_1.borderBottomLeftRadius, declaration.borderBottomLeftRadius);
        this.borderTopStyle = parse(border_style_1.borderTopStyle, declaration.borderTopStyle);
        this.borderRightStyle = parse(border_style_1.borderRightStyle, declaration.borderRightStyle);
        this.borderBottomStyle = parse(border_style_1.borderBottomStyle, declaration.borderBottomStyle);
        this.borderLeftStyle = parse(border_style_1.borderLeftStyle, declaration.borderLeftStyle);
        this.borderTopWidth = parse(border_width_1.borderTopWidth, declaration.borderTopWidth);
        this.borderRightWidth = parse(border_width_1.borderRightWidth, declaration.borderRightWidth);
        this.borderBottomWidth = parse(border_width_1.borderBottomWidth, declaration.borderBottomWidth);
        this.borderLeftWidth = parse(border_width_1.borderLeftWidth, declaration.borderLeftWidth);
        this.boxShadow = parse(box_shadow_1.boxShadow, declaration.boxShadow);
        this.color = parse(color_1.color, declaration.color);
        this.display = parse(display_1.display, declaration.display);
        this.float = parse(float_1.float, declaration.cssFloat);
        this.fontFamily = parse(font_family_1.fontFamily, declaration.fontFamily);
        this.fontSize = parse(font_size_1.fontSize, declaration.fontSize);
        this.fontStyle = parse(font_style_1.fontStyle, declaration.fontStyle);
        this.fontVariant = parse(font_variant_1.fontVariant, declaration.fontVariant);
        this.fontWeight = parse(font_weight_1.fontWeight, declaration.fontWeight);
        this.letterSpacing = parse(letter_spacing_1.letterSpacing, declaration.letterSpacing);
        this.lineBreak = parse(line_break_1.lineBreak, declaration.lineBreak);
        this.lineHeight = parse(line_height_1.lineHeight, declaration.lineHeight);
        this.listStyleImage = parse(list_style_image_1.listStyleImage, declaration.listStyleImage);
        this.listStylePosition = parse(list_style_position_1.listStylePosition, declaration.listStylePosition);
        this.listStyleType = parse(list_style_type_1.listStyleType, declaration.listStyleType);
        this.marginTop = parse(margin_1.marginTop, declaration.marginTop);
        this.marginRight = parse(margin_1.marginRight, declaration.marginRight);
        this.marginBottom = parse(margin_1.marginBottom, declaration.marginBottom);
        this.marginLeft = parse(margin_1.marginLeft, declaration.marginLeft);
        this.opacity = parse(opacity_1.opacity, declaration.opacity);
        const overflowTuple = parse(overflow_1.overflow, declaration.overflow);
        this.overflowX = overflowTuple[0];
        this.overflowY = overflowTuple[overflowTuple.length > 1 ? 1 : 0];
        this.overflowWrap = parse(overflow_wrap_1.overflowWrap, declaration.overflowWrap);
        this.paddingTop = parse(padding_1.paddingTop, declaration.paddingTop);
        this.paddingRight = parse(padding_1.paddingRight, declaration.paddingRight);
        this.paddingBottom = parse(padding_1.paddingBottom, declaration.paddingBottom);
        this.paddingLeft = parse(padding_1.paddingLeft, declaration.paddingLeft);
        this.position = parse(position_1.position, declaration.position);
        this.textAlign = parse(text_align_1.textAlign, declaration.textAlign);
        this.textDecorationColor = parse(text_decoration_color_1.textDecorationColor, declaration.textDecorationColor || declaration.color);
        this.textDecorationLine = parse(text_decoration_line_1.textDecorationLine, declaration.textDecorationLine);
        this.textShadow = parse(text_shadow_1.textShadow, declaration.textShadow);
        this.textTransform = parse(text_transform_1.textTransform, declaration.textTransform);
        this.transform = parse(transform_1.transform, declaration.transform);
        this.transformOrigin = parse(transform_origin_1.transformOrigin, declaration.transformOrigin);
        this.visibility = parse(visibility_1.visibility, declaration.visibility);
        this.wordBreak = parse(word_break_1.wordBreak, declaration.wordBreak);
        this.zIndex = parse(z_index_1.zIndex, declaration.zIndex);
    }
    isVisible() {
        return this.display > 0 && this.opacity > 0 && this.visibility === visibility_1.VISIBILITY.VISIBLE;
    }
    isTransparent() {
        return color_2.isTransparent(this.backgroundColor);
    }
    isTransformed() {
        return this.transform !== null;
    }
    isPositioned() {
        return this.position !== position_1.POSITION.STATIC;
    }
    isPositionedWithZIndex() {
        return this.isPositioned() && !this.zIndex.auto;
    }
    isFloating() {
        return this.float !== float_1.FLOAT.NONE;
    }
    isInlineLevel() {
        return (bitwise_1.contains(this.display, 4 /* INLINE */) ||
            bitwise_1.contains(this.display, 33554432 /* INLINE_BLOCK */) ||
            bitwise_1.contains(this.display, 268435456 /* INLINE_FLEX */) ||
            bitwise_1.contains(this.display, 536870912 /* INLINE_GRID */) ||
            bitwise_1.contains(this.display, 67108864 /* INLINE_LIST_ITEM */) ||
            bitwise_1.contains(this.display, 134217728 /* INLINE_TABLE */));
    }
}
exports.CSSParsedDeclaration = CSSParsedDeclaration;
class CSSParsedPseudoDeclaration {
    constructor(declaration) {
        this.content = parse(content_1.content, declaration.content);
        this.quotes = parse(quotes_1.quotes, declaration.quotes);
    }
}
exports.CSSParsedPseudoDeclaration = CSSParsedPseudoDeclaration;
class CSSParsedCounterDeclaration {
    constructor(declaration) {
        this.counterIncrement = parse(counter_increment_1.counterIncrement, declaration.counterIncrement);
        this.counterReset = parse(counter_reset_1.counterReset, declaration.counterReset);
    }
}
exports.CSSParsedCounterDeclaration = CSSParsedCounterDeclaration;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parse = (descriptor, style) => {
    const tokenizer = new tokenizer_1.Tokenizer();
    const value = style !== null && typeof style !== 'undefined' ? style.toString() : descriptor.initialValue;
    tokenizer.write(value);
    const parser = new parser_1.Parser(tokenizer.read());
    switch (descriptor.type) {
        case IPropertyDescriptor_1.PropertyDescriptorParsingType.IDENT_VALUE:
            const token = parser.parseComponentValue();
            return descriptor.parse(parser_1.isIdentToken(token) ? token.value : descriptor.initialValue);
        case IPropertyDescriptor_1.PropertyDescriptorParsingType.VALUE:
            return descriptor.parse(parser.parseComponentValue());
        case IPropertyDescriptor_1.PropertyDescriptorParsingType.LIST:
            return descriptor.parse(parser.parseComponentValues());
        case IPropertyDescriptor_1.PropertyDescriptorParsingType.TOKEN_VALUE:
            return parser.parseComponentValue();
        case IPropertyDescriptor_1.PropertyDescriptorParsingType.TYPE_VALUE:
            switch (descriptor.format) {
                case 'angle':
                    return angle_1.angle.parse(parser.parseComponentValue());
                case 'color':
                    return color_2.color.parse(parser.parseComponentValue());
                case 'image':
                    return image_1.image.parse(parser.parseComponentValue());
                case 'length':
                    const length = parser.parseComponentValue();
                    return length_1.isLength(length) ? length : length_percentage_1.ZERO_LENGTH;
                case 'length-percentage':
                    const value = parser.parseComponentValue();
                    return length_percentage_1.isLengthPercentage(value) ? value : length_percentage_1.ZERO_LENGTH;
            }
    }
    throw new Error(`Attempting to parse unsupported css format type`);
};
//# sourceMappingURL=index.js.map