"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./utils/logger");
// Carregar variáveis de ambiente
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
// Inicializar servidor
app_1.default.listen(PORT, () => {
    logger_1.logger.info(`🚀 Servidor rodando na porta ${PORT}`);
    logger_1.logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
    logger_1.logger.info(`📊 API disponível em: http://localhost:${PORT}`);
});
// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map