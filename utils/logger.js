"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var ConsoleLogger = /** @class */ (function () {
    function ConsoleLogger() {
    }
    ConsoleLogger.prototype.formatMessage = function (level, message) {
        var timestamp = new Date().toISOString();
        return "[".concat(timestamp, "] ").concat(level, ": ").concat(message);
    };
    ConsoleLogger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log.apply(console, __spreadArray([this.formatMessage('INFO', message)], args, false));
    };
    ConsoleLogger.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.error.apply(console, __spreadArray([this.formatMessage('ERROR', message)], args, false));
    };
    ConsoleLogger.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.warn.apply(console, __spreadArray([this.formatMessage('WARN', message)], args, false));
    };
    ConsoleLogger.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (process.env.NODE_ENV === 'development') {
            console.debug.apply(console, __spreadArray([this.formatMessage('DEBUG', message)], args, false));
        }
    };
    return ConsoleLogger;
}());
exports.logger = new ConsoleLogger();
