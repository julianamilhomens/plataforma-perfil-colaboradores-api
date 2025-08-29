"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
var app_1 = require("./app");
var logger_1 = require("./utils/logger");
// Carregar variáveis de ambiente
dotenv_1.default.config();
var PORT = process.env.PORT || 3001;
// Inicializar servidor
app_1.default.listen(PORT, function () {
    logger_1.logger.info("\uD83D\uDE80 Servidor rodando na porta ".concat(PORT));
    logger_1.logger.info("\uD83C\uDF0D Ambiente: ".concat(process.env.NODE_ENV));
    logger_1.logger.info("\uD83D\uDCCA API dispon\u00EDvel em: http://localhost:".concat(PORT));
});
// Tratamento de erros não capturados
process.on('unhandledRejection', function (reason, promise) {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
process.on('uncaughtException', function (error) {
    logger_1.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
