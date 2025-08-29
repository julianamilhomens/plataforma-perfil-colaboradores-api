"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireManager = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const types_1 = require("../types");
const errorHandler_1 = require("./errorHandler");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            throw new errorHandler_1.CustomError('Token de acesso não fornecido', 401);
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new errorHandler_1.CustomError('Configuração JWT inválida', 500);
        }
        // Verificar e decodificar o token
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Verificar se o usuário ainda existe no banco
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true, email: true }
        });
        if (!user) {
            throw new errorHandler_1.CustomError('Usuário não encontrado', 401);
        }
        // Adicionar dados do usuário à requisição
        req.user = {
            id: user.id,
            role: user.role,
            email: user.email
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorHandler_1.CustomError('Token inválido', 401));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errorHandler_1.CustomError('Token expirado', 401));
        }
        else {
            next(error);
        }
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.CustomError('Usuário não autenticado', 401));
        }
        if (!roles.includes(req.user.role)) {
            logger_1.logger.warn(`Acesso negado para usuário ${req.user.email} com role ${req.user.role}`);
            return next(new errorHandler_1.CustomError('Acesso negado', 403));
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireManager = (0, exports.requireRole)([types_1.UserRole.MANAGER]);
//# sourceMappingURL=auth.js.map