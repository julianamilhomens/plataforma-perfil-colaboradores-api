import dotenv from 'dotenv';
import app from './app';
import { logger } from './utils/logger';

// Carregar variáveis de ambiente
dotenv.config();

const PORT = process.env.PORT || 3001;

// Inicializar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  logger.info(`📊 API disponível em: http://localhost:${PORT}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});