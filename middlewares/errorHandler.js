"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.CustomError = void 0;
var logger_1 = require("../utils/logger");
var CustomError = /** @class */ (function (_super) {
    __extends(CustomError, _super);
    function CustomError(message, statusCode) {
        if (statusCode === void 0) { statusCode = 500; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.isOperational = true;
        Error.captureStackTrace(_this, _this.constructor);
        return _this;
    }
    return CustomError;
}(Error));
exports.CustomError = CustomError;
var errorHandler = function (error, req, res, next) {
    var _a = error.statusCode, statusCode = _a === void 0 ? 500 : _a, message = error.message;
    // Log do erro
    logger_1.logger.error("Error ".concat(statusCode, ": ").concat(message), {
        url: req.url,
        method: req.method,
        stack: error.stack,
    });
    // Erro de validação do Prisma
    if (error.name === 'PrismaClientValidationError') {
        statusCode = 400;
        message = 'Dados inválidos fornecidos';
    }
    // Erro de constraint do Prisma (duplicação, etc)
    if (error.name === 'PrismaClientKnownRequestError') {
        statusCode = 400;
        message = 'Erro na operação com o banco de dados';
    }
    // JWT Error
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token inválido';
    }
    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expirado';
    }
    // Response de erro
    var errorResponse = __assign({ error: message }, (process.env.NODE_ENV === 'development' && { stack: error.stack }));
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
