import {ElementContainer} from '../element-container';

export class AnchorElementContainer extends ElementContainer {
    readonly href: string;
    constructor(element: HTMLAnchorElement) {
        super(element);
        this.href = element.href;
    }
}
