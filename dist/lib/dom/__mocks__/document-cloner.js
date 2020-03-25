"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DocumentCloner {
    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
        this.clonedReferenceElement = {};
    }
    toIFrame() {
        return Promise.resolve({});
    }
    static destroy() {
        return true;
    }
}
exports.DocumentCloner = DocumentCloner;
//# sourceMappingURL=document-cloner.js.map