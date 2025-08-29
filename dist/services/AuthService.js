"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const types_1 = require("../types");
const errorHandler_1 = require("../middlewares/errorHandler");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
class AuthService {
    async login(loginData) {
        const { email, password } = loginData;
        // Buscar usuário por email
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                areas: {
                    include: {
                        area: {
                            select: {
                                id: true,
                                name: true,
                                description: true
                            }
                        }
                    }
                },
                projects: {
                    include: {
                        project: {
                            select: {
                                id: true,
                                name: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });
        if (!user) {
            logger_1.logger.warn(`Tentativa de login com email inexistente: ${email}`);
            throw new errorHandler_1.CustomError('Credenciais inválidas', 401);
        }
        // Verificar senha
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            logger_1.logger.warn(`Tentativa de login com senha incorreta para: ${email}`);
            throw new errorHandler_1.CustomError('Credenciais inválidas', 401);
        }
        // Validar e converter role
        const userRole = this.validateUserRole(user.role);
        const contractType = this.validateContractType(user.contractType);
        // Gerar token JWT
        const token = this.generateToken({
            userId: user.id,
            role: userRole,
            email: user.email
        });
        logger_1.logger.info(`Login realizado com sucesso: ${email}`);
        // Mapear áreas do formato Prisma para AreaResponseDTO
        const areas = user.areas.map((ua) => ({
            id: ua.area.id,
            name: ua.area.name,
            description: ua.area.description || undefined
        }));
        // Mapear projetos do formato Prisma para ProjectSummaryDTO
        const projects = user.projects.map((up) => ({
            id: up.project.id,
            name: up.project.name,
            status: this.validateProjectStatus(up.project.status),
            roleInProject: up.roleInProject || undefined
        }));
        // Preparar resposta no formato UserResponseDTO
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            age: user.age || 0, // Tratar null/undefined convertendo para 0 ou valor padrão
            contractType: contractType,
            role: userRole,
            areas: areas,
            projects: projects,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        return {
            user: userResponse,
            token
        };
    }
    async validateToken(token) {
        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new errorHandler_1.CustomError('Configuração JWT inválida', 500);
            }
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            // Validar se o payload tem a estrutura esperada
            if (!decoded.userId || !decoded.role || !decoded.email) {
                throw new errorHandler_1.CustomError('Token com payload inválido', 401);
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof errorHandler_1.CustomError) {
                throw error;
            }
            throw new errorHandler_1.CustomError('Token inválido', 401);
        }
    }
    generateToken(payload) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new errorHandler_1.CustomError('Configuração JWT não encontrada', 500);
        }
        // Força compatibilidade com o tipo do SignOptions
        const expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
        const options = { expiresIn };
        return jsonwebtoken_1.default.sign(payload, secret, options);
    }
    validateUserRole(role) {
        const validRoles = Object.values(types_1.UserRole);
        if (!validRoles.includes(role)) {
            throw new errorHandler_1.CustomError(`Role inválido: ${role}`, 500);
        }
        return role;
    }
    validateContractType(contractType) {
        if (!contractType) {
            return undefined;
        }
        const validContractTypes = Object.values(types_1.ContractType);
        if (!validContractTypes.includes(contractType)) {
            throw new errorHandler_1.CustomError(`Tipo de contrato inválido: ${contractType}`, 500);
        }
        return contractType;
    }
    validateProjectStatus(status) {
        const validStatuses = Object.values(types_1.ProjectStatus);
        if (!validStatuses.includes(status)) {
            // Se o status não for válido, usar um padrão ou lançar erro
            logger_1.logger.warn(`Status de projeto inválido encontrado: ${status}, usando PLANNING como padrão`);
            return types_1.ProjectStatus.PLANNING;
        }
        return status;
    }
    // Método auxiliar para buscar usuário pelo ID (útil para middleware de auth)
    async getUserById(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                age: true,
                contractType: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                areas: {
                    include: {
                        area: {
                            select: {
                                id: true,
                                name: true,
                                description: true
                            }
                        }
                    }
                },
                projects: {
                    include: {
                        project: {
                            select: {
                                id: true,
                                name: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });
        if (!user) {
            throw new errorHandler_1.CustomError('Usuário não encontrado', 404);
        }
        const areas = user.areas.map((ua) => ({
            id: ua.area.id,
            name: ua.area.name,
            description: ua.area.description || undefined
        }));
        const projects = user.projects.map((up) => ({
            id: up.project.id,
            name: up.project.name,
            status: this.validateProjectStatus(up.project.status),
            roleInProject: up.roleInProject || undefined
        }));
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            age: user.age || 0, // Tratar null/undefined convertendo para 0 ou valor padrão
            contractType: this.validateContractType(user.contractType),
            role: this.validateUserRole(user.role),
            areas: areas,
            projects: projects,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
    // Método auxiliar para extrair dados do usuário do token (para middleware)
    async getUserFromToken(token) {
        const decoded = await this.validateToken(token);
        return {
            id: decoded.userId,
            role: decoded.role,
            email: decoded.email
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map