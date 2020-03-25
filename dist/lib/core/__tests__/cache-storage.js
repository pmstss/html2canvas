"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const features_1 = require("../features");
const cache_storage_1 = require("../cache-storage");
const logger_1 = require("../logger");
const proxy = 'http://example.com/proxy';
const createMockContext = (origin, opts = {}) => {
    const context = {
        location: {
            href: origin
        },
        document: {
            createElement(_name) {
                let _href = '';
                return {
                    set href(value) {
                        _href = value;
                    },
                    get href() {
                        return _href;
                    },
                    get protocol() {
                        return new URL(_href).protocol;
                    },
                    get hostname() {
                        return new URL(_href).hostname;
                    },
                    get port() {
                        return new URL(_href).port;
                    }
                };
            }
        }
    };
    cache_storage_1.CacheStorage.setContext(context);
    logger_1.Logger.create({ id: 'test', enabled: false });
    return cache_storage_1.CacheStorage.create('test', Object.assign({ imageTimeout: 0, useCORS: false, allowTaint: false, proxy }, opts));
};
const images = [];
const xhr = [];
const sleep = async (timeout) => await new Promise(resolve => setTimeout(resolve, timeout));
class ImageMock {
    constructor() {
        images.push(this);
    }
}
class XMLHttpRequestMock {
    constructor() {
        this.sent = false;
        this.status = 500;
        this.timeout = 5000;
        xhr.push(this);
    }
    async load(status, response) {
        this.response = response;
        this.status = status;
        if (this.onload) {
            this.onload();
        }
        await sleep(0);
    }
    open(method, url) {
        this.method = method;
        this.url = url;
    }
    send() {
        this.sent = true;
    }
}
Object.defineProperty(global, 'Image', { value: ImageMock, writable: true });
Object.defineProperty(global, 'XMLHttpRequest', {
    value: XMLHttpRequestMock,
    writable: true
});
const setFeatures = (opts = {}) => {
    const defaults = {
        SUPPORT_SVG_DRAWING: true,
        SUPPORT_CORS_IMAGES: true,
        SUPPORT_CORS_XHR: true,
        SUPPORT_RESPONSE_TYPE: false
    };
    Object.keys(defaults).forEach(key => {
        Object.defineProperty(features_1.FEATURES, key, {
            value: typeof opts[key] === 'boolean' ? opts[key] : defaults[key],
            writable: true
        });
    });
};
describe('cache-storage', () => {
    beforeEach(() => setFeatures());
    afterEach(() => {
        xhr.splice(0, xhr.length);
        images.splice(0, images.length);
    });
    it('addImage adds images to cache', async () => {
        const cache = createMockContext('http://example.com', { proxy: null });
        await cache.addImage('http://example.com/test.jpg');
        await cache.addImage('http://example.com/test2.jpg');
        assert_1.deepStrictEqual(images.length, 2);
        assert_1.deepStrictEqual(images[0].src, 'http://example.com/test.jpg');
        assert_1.deepStrictEqual(images[1].src, 'http://example.com/test2.jpg');
    });
    it('addImage should not add duplicate entries', async () => {
        const cache = createMockContext('http://example.com');
        await cache.addImage('http://example.com/test.jpg');
        await cache.addImage('http://example.com/test.jpg');
        assert_1.deepStrictEqual(images.length, 1);
        assert_1.deepStrictEqual(images[0].src, 'http://example.com/test.jpg');
    });
    describe('svg', () => {
        it('should add svg images correctly', async () => {
            const cache = createMockContext('http://example.com');
            await cache.addImage('http://example.com/test.svg');
            await cache.addImage('http://example.com/test2.svg');
            assert_1.deepStrictEqual(images.length, 2);
            assert_1.deepStrictEqual(images[0].src, 'http://example.com/test.svg');
            assert_1.deepStrictEqual(images[1].src, 'http://example.com/test2.svg');
        });
        it('should omit svg images if not supported', async () => {
            setFeatures({ SUPPORT_SVG_DRAWING: false });
            const cache = createMockContext('http://example.com');
            await cache.addImage('http://example.com/test.svg');
            await cache.addImage('http://example.com/test2.svg');
            assert_1.deepStrictEqual(images.length, 0);
        });
    });
    describe('cross-origin', () => {
        it('addImage should not add images it cannot load/render', async () => {
            const cache = createMockContext('http://example.com', {
                proxy: undefined
            });
            await cache.addImage('http://html2canvas.hertzen.com/test.jpg');
            assert_1.deepStrictEqual(images.length, 0);
        });
        it('addImage should add images if tainting enabled', async () => {
            const cache = createMockContext('http://example.com', {
                allowTaint: true,
                proxy: undefined
            });
            await cache.addImage('http://html2canvas.hertzen.com/test.jpg');
            assert_1.deepStrictEqual(images.length, 1);
            assert_1.deepStrictEqual(images[0].src, 'http://html2canvas.hertzen.com/test.jpg');
            assert_1.deepStrictEqual(images[0].crossOrigin, undefined);
        });
        it('addImage should add images if cors enabled', async () => {
            const cache = createMockContext('http://example.com', { useCORS: true });
            await cache.addImage('http://html2canvas.hertzen.com/test.jpg');
            assert_1.deepStrictEqual(images.length, 1);
            assert_1.deepStrictEqual(images[0].src, 'http://html2canvas.hertzen.com/test.jpg');
            assert_1.deepStrictEqual(images[0].crossOrigin, 'anonymous');
        });
        it('addImage should not add images if cors enabled but not supported', async () => {
            setFeatures({ SUPPORT_CORS_IMAGES: false });
            const cache = createMockContext('http://example.com', {
                useCORS: true,
                proxy: undefined
            });
            await cache.addImage('http://html2canvas.hertzen.com/test.jpg');
            assert_1.deepStrictEqual(images.length, 0);
        });
        it('addImage should not add images to proxy if cors enabled', async () => {
            const cache = createMockContext('http://example.com', { useCORS: true });
            await cache.addImage('http://html2canvas.hertzen.com/test.jpg');
            assert_1.deepStrictEqual(images.length, 1);
            assert_1.deepStrictEqual(images[0].src, 'http://html2canvas.hertzen.com/test.jpg');
            assert_1.deepStrictEqual(images[0].crossOrigin, 'anonymous');
        });
        it('addImage should use proxy ', async () => {
            const cache = createMockContext('http://example.com');
            await cache.addImage('http://html2canvas.hertzen.com/test.jpg');
            assert_1.deepStrictEqual(xhr.length, 1);
            assert_1.deepStrictEqual(xhr[0].url, `${proxy}?url=${encodeURIComponent('http://html2canvas.hertzen.com/test.jpg')}&responseType=text`);
            await xhr[0].load(200, '<data response>');
            assert_1.deepStrictEqual(images.length, 1);
            assert_1.deepStrictEqual(images[0].src, '<data response>');
        });
        it('proxy should respect imageTimeout', async () => {
            const cache = createMockContext('http://example.com', {
                imageTimeout: 10
            });
            await cache.addImage('http://html2canvas.hertzen.com/test.jpg');
            assert_1.deepStrictEqual(xhr.length, 1);
            assert_1.deepStrictEqual(xhr[0].url, `${proxy}?url=${encodeURIComponent('http://html2canvas.hertzen.com/test.jpg')}&responseType=text`);
            assert_1.deepStrictEqual(xhr[0].timeout, 10);
            if (xhr[0].ontimeout) {
                xhr[0].ontimeout();
            }
            try {
                await cache.match('http://html2canvas.hertzen.com/test.jpg');
                assert_1.fail('Expected result to timeout');
            }
            catch (e) { }
        });
    });
    it('match should return cache entry', async () => {
        const cache = createMockContext('http://example.com');
        await cache.addImage('http://example.com/test.jpg');
        if (images[0].onload) {
            images[0].onload();
        }
        const response = await cache.match('http://example.com/test.jpg');
        assert_1.deepStrictEqual(response.src, 'http://example.com/test.jpg');
    });
    it('image should respect imageTimeout', async () => {
        const cache = createMockContext('http://example.com', { imageTimeout: 10 });
        cache.addImage('http://example.com/test.jpg');
        try {
            await cache.match('http://example.com/test.jpg');
            assert_1.fail('Expected result to timeout');
        }
        catch (e) { }
    });
});
//# sourceMappingURL=cache-storage.js.map