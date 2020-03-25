"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const canvas_renderer_1 = require("../render/canvas/canvas-renderer");
const document_cloner_1 = require("../dom/document-cloner");
const color_1 = require("../css/types/color");
jest.mock('../core/logger');
jest.mock('../css/layout/bounds');
jest.mock('../dom/document-cloner');
jest.mock('../dom/node-parser', () => {
    return {
        isBodyElement: () => false,
        isHTMLElement: () => false,
        parseTree: jest.fn().mockImplementation(() => {
            return { styles: {} };
        })
    };
});
jest.mock('../render/stacking-context');
jest.mock('../render/canvas/canvas-renderer');
describe('html2canvas', () => {
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    const element = {
        ownerDocument: {
            defaultView: {
                pageXOffset: 12,
                pageYOffset: 34
            }
        }
    };
    it('should render with an element', async () => {
        document_cloner_1.DocumentCloner.destroy = jest.fn().mockReturnValue(true);
        await index_1.default(element);
        expect(canvas_renderer_1.CanvasRenderer).toHaveBeenLastCalledWith(expect.objectContaining({
            backgroundColor: 0xffffffff,
            scale: 1,
            height: 50,
            width: 200,
            x: 0,
            y: 0,
            scrollX: 12,
            scrollY: 34,
            canvas: undefined
        }));
        expect(document_cloner_1.DocumentCloner.destroy).toBeCalled();
    });
    it('should have transparent background with backgroundColor: null', async () => {
        await index_1.default(element, { backgroundColor: null });
        expect(canvas_renderer_1.CanvasRenderer).toHaveBeenLastCalledWith(expect.objectContaining({
            backgroundColor: color_1.COLORS.TRANSPARENT
        }));
    });
    it('should use existing canvas when given as option', async () => {
        // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
        const canvas = {};
        await index_1.default(element, { canvas });
        expect(canvas_renderer_1.CanvasRenderer).toHaveBeenLastCalledWith(expect.objectContaining({
            canvas
        }));
    });
    it('should not remove cloned window when removeContainer: false', async () => {
        document_cloner_1.DocumentCloner.destroy = jest.fn();
        await index_1.default(element, { removeContainer: false });
        expect(canvas_renderer_1.CanvasRenderer).toHaveBeenLastCalledWith(expect.objectContaining({
            backgroundColor: 0xffffffff,
            scale: 1,
            height: 50,
            width: 200,
            x: 0,
            y: 0,
            scrollX: 12,
            scrollY: 34,
            canvas: undefined
        }));
        expect(document_cloner_1.DocumentCloner.destroy).not.toBeCalled();
    });
});
//# sourceMappingURL=index.js.map