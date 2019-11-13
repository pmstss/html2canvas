import {CSSParsedDeclaration} from '../css/index';
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
            if (!node.ownerDocument) {
                continue;
            }

            const r = node.ownerDocument.createRange();
            let textNode = childNode;
            r.selectNodeContents(textNode);

            const textNodes = [];
            if (r.getClientRects().length > 1) {
                let i = 0;
                while (textNode && ++i < textNode.data.length) {
                    r.setEnd(textNode, i);
                    if (r.getClientRects().length > 1) {
                        textNode = textNode.splitText(i - 1);
                        textNodes.push(textNode.previousSibling);
                        r.selectNodeContents(textNode);
                        i = 0;
                    }
                }

                if (textNode.data.length) {
                    textNodes.push(textNode);
                }
            } else {
                /*
                  Well, for node that already has single client rect, for properly inherited background color,
                  aux ElementContainer should be created too.
                */
                textNodes.push(textNode);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const styles = new CSSParsedDeclaration(window.getComputedStyle((node as any) as Element, null));
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

            // TODO: trivial space normalization, could be wrong in some cases; improve
            const getNormalizedText = (txt: Text): string => {
                const parent = txt.parentElement as HTMLElement;
                return (txt.textContent || '').includes(parent.innerText)
                    ? parent.innerText
                    : (txt.textContent || '').replace(/[\t\n\r ]+/g, ' ');
            };

            parent.elements.push(
                ...textNodes.map((n: Text) => {
                    r.selectNodeContents(n);
                    const bounds = Bounds.fromClientRect(r.getBoundingClientRect());
                    const auxTextContainer = new ElementContainer(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (null as any) as Element,
                        styles,
                        bounds
                    );
                    auxTextContainer.textNodes.push(new TextContainer(n, styles, [new TextBounds(getNormalizedText(n), bounds)]));
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
