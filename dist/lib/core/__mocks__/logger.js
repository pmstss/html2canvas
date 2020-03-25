"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logger {
    debug() { }
    static create() { }
    static destroy() { }
    static getInstance() {
        return logger;
    }
    info() { }
    error() { }
}
exports.Logger = Logger;
const logger = new Logger();
//# sourceMappingURL=logger.js.map