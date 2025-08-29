"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var morgan_1 = require("morgan");
var routes_1 = require("./routes");
var errorHandler_1 = require("./middlewares/errorHandler");
var logger_1 = require("./utils/logger");
var app = (0, express_1.default)();
// Middlewares de segurança
app.use((0, helmet_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
// Log de requisições
app.use((0, morgan_1.default)('combined', {
    stream: { write: function (message) { return logger_1.logger.info(message.trim()); } }
}));
// Parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', function (req, res) {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
// Rotas da API
app.use('/api', routes_1.default);
// Middleware de tratamento de erros
app.use(errorHandler_1.errorHandler);
// Rota 404 (ajustada para não quebrar com path-to-regexp)
app.use(function (req, res) {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.originalUrl
    });
});
exports.default = app;
