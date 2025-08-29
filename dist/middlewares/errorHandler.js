"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.CustomError = void 0;
const logger_1 = require("../utils/logger");
class CustomError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
const errorHandler = (error, req, res, next) => {
    let { statusCode = 500, message } = error;
    // Log do erro
    logger_1.logger.error(`Error ${statusCode}: ${message}`, {
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
    const errorResponse = {
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    };
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map