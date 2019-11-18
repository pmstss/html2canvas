"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Logger = /** @class */ (function () {
    function Logger(_a) {
        var id = _a.id, enabled = _a.enabled;
        this.id = id;
        this.enabled = enabled;
        this.start = Date.now();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.enabled) {
            // eslint-disable-next-line no-console
            if (typeof window !== 'undefined' && window.console && typeof console.debug === 'function') {
                // eslint-disable-next-line no-console
                console.debug.apply(console, __spreadArrays([this.id, this.getTime() + "ms"], args));
            }
            else {
                this.info.apply(this, args);
            }
        }
    };
    Logger.prototype.getTime = function () {
        return Date.now() - this.start;
    };
    Logger.create = function (options) {
        Logger.instances[options.id] = new Logger(options);
    };
    Logger.destroy = function (id) {
        delete Logger.instances[id];
    };
    Logger.getInstance = function (id) {
        var instance = Logger.instances[id];
        if (typeof instance === 'undefined') {
            throw new Error("No logger instance found with id " + id);
        }
        return instance;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.enabled) {
            // eslint-disable-next-line no-console
            if (typeof window !== 'undefined' && window.console && typeof console.info === 'function') {
                // eslint-disable-next-line no-console
                console.info.apply(console, __spreadArrays([this.id, this.getTime() + "ms"], args));
            }
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.enabled) {
            // eslint-disable-next-line no-console
            if (typeof window !== 'undefined' && window.console && typeof console.error === 'function') {
                // eslint-disable-next-line no-console
                console.error.apply(console, __spreadArrays([this.id, this.getTime() + "ms"], args));
            }
            else {
                this.info.apply(this, args);
            }
        }
    };
    Logger.instances = {};
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map