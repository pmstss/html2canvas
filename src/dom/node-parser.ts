import {CSSParsedDeclaration} from '../css';
import {ElementContainer, FLAGS} from './element-container';
import {TextContainer} from './text-container';
import {ImageElementContainer} from './replaced-elements/image-element-container';
import {CanvasElementContainer} from './replaced-elements/canvas-element-container';
import {SVGElementContainer} from './replaced-elements/svg-element-container';
import {LIElementContainer} from './elements/li-element-container';
import {OLElementContainer} from './elements/ol-element-container';
import {InputElementContainer} from './replaced-elements/input-element-container';
import {SelectElementContainer} from './elements/select-element-container';
import {TextareaElementContainer} from './elements/textarea-element-container';
import {IFrameElementContainer} from './replaced-elements/iframe-element-container';
import {AnchorElementContainer} from './elements/anchor-element-container';
import {WORD_BREAK} from '../css/property-descriptors/word-break';
import {Bounds} from '../css/layout/bounds';
import {TextBounds} from '../css/layout/text';

const LIST_OWNERS = ['OL', 'UL', 'MENU'];
const EPS = 0.01;

// TODO: move to options
const useTextSplitDnc = '*'.charCodeAt(0) === 42; // to avoid trim from dist build

/**
 * Split text node into multiple text nodes according to visual line wraps
 * @param textNode Text node to split
 * @param range pre-created Range
 * @see splitTextByLineWrapsDnc()
 */
const splitTextByLineWrapsLinear = (textNode: Text, range: Range): Text[] => {
    range.selectNodeContents(textNode);
    if (range.getClientRects().length < 2) {
        return [textNode];
    }

    const textNodes: Text[] = [];
    let i = 0;
    while (textNode && ++i <= textNode.data.length) {
        range.setEnd(textNode, i);
        if (range.getClientRects().length > 1) {
            textNode = textNode.splitText(i - 1);
            textNodes.push(textNode.previousSibling as Text);
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
const splitTextIntoSingleRectNodes = (textNode: Text, range: Range): Text[] => {
    range.selectNodeContents(textNode);

    // this is the most expensive operation, that should be minimized
    const clientRects = Array.from(range.getClientRects());

    // filtering empty/hidden/etc nodes for proper expectedPartLength
    const numberOfLines = clientRects.filter(r => r.width > 1 && r.height > 1).length;

    if (numberOfLines < 2) {
        return [textNode];
    }

    const textNodes: Text[] = [];
    // as getClientRects() is expensive, instead of binary split recursive calls,
    // minimizing its usage by splitting into N parts at once
    const expectedPartLength = Math.floor(textNode.data.length / numberOfLines);
    let i = 0;
    while (++i < numberOfLines) {
        const secondPart = textNode.splitText(expectedPartLength);
        textNodes.push(textNode);
        textNode = secondPart;
    }
    textNodes.push(textNode);

    return textNodes.reduce(
        (res: Text[], subTextNode) => [...res, ...splitTextIntoSingleRectNodes(subTextNode, range)],
        []
    );
};

/**
 * "Divide and conquer" approach for split by lines wrap in contrast to splitTextByLineWrapsLinear()
 * @param textNode Text node to split
 * @param range pre-created Range
 * @see splitTextByLineWrapsLinear()
 */
const splitTextByLineWrapsDnc = (textNode: Text, range: Range): Text[] => {
    range.selectNodeContents(textNode);
    if (range.getClientRects().length < 2) {
        return [textNode];
    }

    // preprocess for performance reasons
    let textNodes: Text[] = splitByNewLines(textNode);

    // actual "Divide and conquer" calls
    textNodes = textNodes.reduce(
        (res: Text[], subTextNode) => [...res, ...splitTextIntoSingleRectNodes(subTextNode, range)],
        []
    );

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
const splitByNewLines = (textNode: Text): Text[] => {
    if (textNode.data.includes('\n')) {
        const textNodes = [];
        while (textNode.data.includes('\n')) {
            const idx = textNode.data.indexOf('\n');
            const secondPart = textNode.splitText(idx + 1);
            textNodes.push(textNode);
            textNode = secondPart;
        }
        textNodes.push(textNode);
        return textNodes;
    }
    return [textNode];
};

/**
 * Merge adjacent (by x axis) text nodes
 * @param textNodes Text[] to run merge on
 * @param range pre-created Range
 */
const mergeAdjacentOneLinesNodes = (textNodes: Text[], range: Range): Text[] => {
    return textNodes.reduce((res: Text[], textNode: Text) => {
        const prevTextNode = res.length > 0 ? res[res.length - 1] : null;
        if (prevTextNode) {
            range.selectNodeContents(prevTextNode);
            const prevClientRect = range.getClientRects()[0];
            range.selectNodeContents(textNode);
            const clientRect = range.getClientRects()[0];
            if (
                Math.abs(prevClientRect.x + prevClientRect.width - clientRect.x) < EPS &&
                Math.abs(prevClientRect.y - clientRect.y) < EPS
            ) {
                prevTextNode.appendData(textNode.data);
                (textNode.parentNode as Node).removeChild(textNode);
            } else {
                res.push(textNode);
            }
        } else {
            res.push(textNode);
        }

        return res;
    }, []);
};

/**
 * "Normalize" spacing in adjacent per-line text nodes by moving them from line start to line end
 * @param textNodes Text[] to "normalize"
 */
const moveSpacesToLineEnds = (textNodes: Text[]): void => {
    textNodes.forEach((textNode: Text, idx: number) => {
        if (idx > 0) {
            let spacePrefix = null;
            textNode.data = textNode.data.replace(/^\s+/, (token: string) => {
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
const getNormalizedText = (txt: Text): string => {
    const parent = txt.parentElement as HTMLElement;
    return (txt.textContent || '').includes(parent.innerText)
        ? parent.innerText
        : (txt.textContent || '').replace(/[\t\n\r ]+/g, ' ');
};

const parseNodeTree = (node: Node, parent: ElementContainer, root: ElementContainer) => {
    for (let childNode = node.firstChild, nextNode; childNode; childNode = nextNode) {
        nextNode = childNode.nextSibling;

        if (isTextNode(childNode) && childNode.data.trim().length > 0) {
            /*
              If node has more than 1 client rect, its bounding polygon is not always rect,
              so using getBoundingClientRect() further for drawing background leads to incorrect results.
              Workaround: split text node into single-rect text nodes with putting each one into aux ElementContainer,
              that inherits background props (color, etc) from parent node.
            */
            const range = (node.ownerDocument as Document).createRange();
            const textNodes = useTextSplitDnc
                ? splitTextByLineWrapsDnc(childNode, range)
                : splitTextByLineWrapsLinear(childNode, range);

            const styles = new CSSParsedDeclaration(window.getComputedStyle(node as Element, null));
            /*
              After "manual" dividing into single client rect element, reset word-break property to avoid
              redundant additional processing by LineBreaker (see breakText())
             */
            styles.wordBreak = WORD_BREAK.NORMAL;

            /*
              Aux ElementContainer will inherit background color, so parent color can be omited to avoid
              drawing "invalid" BoundingClientRect.
             */
            parent.styles.backgroundColor = 0;

            parent.elements.push(
                ...textNodes.map((n: Text) => {
                    range.selectNodeContents(n);
                    const bounds = Bounds.fromClientRect(range.getBoundingClientRect());
                    const auxTextContainer = new ElementContainer(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (null as any) as Element,
                        styles,
                        bounds
                    );
                    auxTextContainer.textNodes.push(
                        new TextContainer(n, styles, [new TextBounds(getNormalizedText(n), bounds)])
                    );
                    return auxTextContainer;
                })
            );
        } else if (isElementNode(childNode)) {
            const container = createContainer(childNode);
            if (container.styles.isVisible()) {
                if (createsRealStackingContext(childNode, container, root)) {
                    container.flags |= FLAGS.CREATES_REAL_STACKING_CONTEXT;
                } else if (createsStackingContext(container.styles)) {
                    container.flags |= FLAGS.CREATES_STACKING_CONTEXT;
                }

                if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
                    container.flags |= FLAGS.IS_LIST_OWNER;
                }

                parent.elements.push(container);
                if (!isTextareaElement(childNode) && !isSVGElement(childNode) && !isSelectElement(childNode)) {
                    parseNodeTree(childNode, container, root);
                }
            }
        }
    }
};

const createContainer = (element: Element): ElementContainer => {
    if (isImageElement(element)) {
        return new ImageElementContainer(element);
    }

    if (isCanvasElement(element)) {
        return new CanvasElementContainer(element);
    }

    if (isSVGElement(element)) {
        return new SVGElementContainer(element);
    }

    if (isLIElement(element)) {
        return new LIElementContainer(element);
    }

    if (isOLElement(element)) {
        return new OLElementContainer(element);
    }

    if (isInputElement(element)) {
        return new InputElementContainer(element);
    }

    if (isSelectElement(element)) {
        return new SelectElementContainer(element);
    }

    if (isTextareaElement(element)) {
        return new TextareaElementContainer(element);
    }

    if (isIFrameElement(element)) {
        return new IFrameElementContainer(element);
    }

    if (isAnchorElement(element)) {
        return new AnchorElementContainer(element);
    }

    return new ElementContainer(element);
};

export const parseTree = (element: HTMLElement): ElementContainer => {
    const container = createContainer(element);
    container.flags |= FLAGS.CREATES_REAL_STACKING_CONTEXT;
    parseNodeTree(element, container, container);
    return container;
};

const createsRealStackingContext = (node: Element, container: ElementContainer, root: ElementContainer): boolean => {
    return (
        container.styles.isPositionedWithZIndex() ||
        container.styles.opacity < 1 ||
        container.styles.isTransformed() ||
        (isBodyElement(node) && root.styles.isTransparent())
    );
};

const createsStackingContext = (styles: CSSParsedDeclaration): boolean => styles.isPositioned() || styles.isFloating();

export const isTextNode = (node: Node): node is Text => node.nodeType === Node.TEXT_NODE;
export const isElementNode = (node: Node): node is Element => node.nodeType === Node.ELEMENT_NODE;
export const isHTMLElementNode = (node: Node): node is HTMLElement =>
    typeof (node as HTMLElement).style !== 'undefined';

export const isLIElement = (node: Element): node is HTMLLIElement => node.tagName === 'LI';
export const isOLElement = (node: Element): node is HTMLOListElement => node.tagName === 'OL';
export const isInputElement = (node: Element): node is HTMLInputElement => node.tagName === 'INPUT';
export const isHTMLElement = (node: Element): node is HTMLHtmlElement => node.tagName === 'HTML';
export const isSVGElement = (node: Element): node is SVGSVGElement => node.tagName === 'svg';
export const isBodyElement = (node: Element): node is HTMLBodyElement => node.tagName === 'BODY';
export const isCanvasElement = (node: Element): node is HTMLCanvasElement => node.tagName === 'CANVAS';
export const isImageElement = (node: Element): node is HTMLImageElement => node.tagName === 'IMG';
export const isIFrameElement = (node: Element): node is HTMLIFrameElement => node.tagName === 'IFRAME';
export const isStyleElement = (node: Element): node is HTMLStyleElement => node.tagName === 'STYLE';
export const isScriptElement = (node: Element): node is HTMLScriptElement => node.tagName === 'SCRIPT';
export const isTextareaElement = (node: Element): node is HTMLTextAreaElement => node.tagName === 'TEXTAREA';
export const isSelectElement = (node: Element): node is HTMLSelectElement => node.tagName === 'SELECT';
export const isAnchorElement = (node: Element): node is HTMLAnchorElement => node.tagName === 'A';
