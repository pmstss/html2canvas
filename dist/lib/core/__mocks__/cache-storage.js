"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MockCache {
    constructor() {
        this._cache = {};
    }
    addImage(src) {
        const result = Promise.resolve();
        this._cache[src] = result;
        return result;
    }
}
const current = new MockCache();
class CacheStorage {
    static getInstance() {
        return current;
    }
}
exports.CacheStorage = CacheStorage;
//# sourceMappingURL=cache-storage.js.map