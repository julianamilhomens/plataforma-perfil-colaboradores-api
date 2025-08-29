"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const types_1 = require("../types");
const errorHandler_1 = require("../middlewares/errorHandler");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
class UserService {
    async createUser(userData, requestingUserRole) {
        // Verificar se apenas managers podem criar usuários
        if (requestingUserRole !== types_1.UserRole.MANAGER) {
            throw new errorHandler_1.CustomError('Apenas gestores podem criar usuários', 403);
        }
        // Verificar se email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });
        if (existingUser) {
            throw new errorHandler_1.CustomError('Email já cadastrado', 400);
        }
        // Verificar se todas as áreas existem
        const areas = await prisma.area.findMany({
            where: { id: { in: userData.areaIds } }
        });
        if (areas.length !== userData.areaIds.length) {
            throw new errorHandler_1.CustomError('Uma ou mais áreas não foram encontradas', 400);
        }
        // Hash da senha
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
        try {
            // Criar usuário com transação
            const newUser = await prisma.$transaction(async (tx) => {
                // Criar o usuário
                const user = await tx.user.create({
                    data: {
                        name: userData.name,
                        email: userData.email,
                        password: hashedPassword,
                        age: userData.age,
                        contractType: userData.contractType,
                        role: userData.role || types_1.UserRole.NORMAL
                    }
                });
                // Associar áreas
                await tx.userArea.createMany({
                    data: userData.areaIds.map((areaId) => ({
                        userId: user.id,
                        areaId
                    }))
                });
                return user;
            });
            logger_1.logger.info(`Usuário criado: ${newUser.email} por gestor`);
            // Buscar usuário completo para retorno
            return await this.getUserById(newUser.id, requestingUserRole);
        }
        catch (error) {
            logger_1.logger.error('Erro ao criar usuário:', error);
            throw new errorHandler_1.CustomError('Erro interno ao criar usuário', 500);
        }
    }
    async getUserById(userId, requestingUserRole) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                areas: {
                    include: { area: true }
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
        return this.formatUserResponse(user, requestingUserRole);
    }
    async updateUser(userId, updateData, requestingUserRole, requestingUserId) {
        // Verificar permissões
        const canUpdate = requestingUserRole === types_1.UserRole.MANAGER || requestingUserId === userId;
        if (!canUpdate) {
            throw new errorHandler_1.CustomError('Sem permissão para atualizar este usuário', 403);
        }
        // Verificar se usuário existe
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            throw new errorHandler_1.CustomError('Usuário não encontrado', 404);
        }
        // Verificar se email já existe (se estiver sendo alterado)
        if (updateData.email && updateData.email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email: updateData.email }
            });
            if (emailExists) {
                throw new errorHandler_1.CustomError('Email já cadastrado', 400);
            }
        }
        // Apenas managers podem alterar role
        if (updateData.role && requestingUserRole !== types_1.UserRole.MANAGER) {
            delete updateData.role;
        }
        try {
            await prisma.$transaction(async (tx) => {
                // Atualizar dados básicos
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        ...(updateData.name && { name: updateData.name }),
                        ...(updateData.email && { email: updateData.email }),
                        ...(updateData.age && { age: updateData.age }),
                        ...(updateData.contractType && { contractType: updateData.contractType }),
                        ...(updateData.role && { role: updateData.role })
                    }
                });
                // Atualizar áreas se fornecidas
                if (updateData.areaIds) {
                    // Verificar se áreas existem
                    const areas = await tx.area.findMany({
                        where: { id: { in: updateData.areaIds } }
                    });
                    if (areas.length !== updateData.areaIds.length) {
                        throw new errorHandler_1.CustomError('Uma ou mais áreas não foram encontradas', 400);
                    }
                    // Remover associações antigas
                    await tx.userArea.deleteMany({
                        where: { userId }
                    });
                    // Criar novas associações
                    await tx.userArea.createMany({
                        data: updateData.areaIds.map((areaId) => ({
                            userId,
                            areaId
                        }))
                    });
                }
            });
            logger_1.logger.info(`Usuário ${userId} atualizado`);
            return await this.getUserById(userId, requestingUserRole);
        }
        catch (error) {
            logger_1.logger.error('Erro ao atualizar usuário:', error);
            throw error instanceof errorHandler_1.CustomError ? error : new errorHandler_1.CustomError('Erro interno ao atualizar usuário', 500);
        }
    }
    async deleteUser(userId, requestingUserRole) {
        if (requestingUserRole !== types_1.UserRole.MANAGER) {
            throw new errorHandler_1.CustomError('Apenas gestores podem excluir usuários', 403);
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errorHandler_1.CustomError('Usuário não encontrado', 404);
        }
        try {
            await prisma.user.delete({
                where: { id: userId }
            });
            logger_1.logger.info(`Usuário ${userId} excluído por gestor`);
        }
        catch (error) {
            logger_1.logger.error('Erro ao excluir usuário:', error);
            throw new errorHandler_1.CustomError('Erro interno ao excluir usuário', 500);
        }
    }
    async getUsers(filters = {}, pagination = {}, requestingUserRole) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;
        // Tipagem explícita para o objeto where
        const where = {};
        // Aplicar filtros
        if (filters.name) {
            where.name = { contains: filters.name, mode: 'insensitive' };
        }
        if (filters.email) {
            where.email = { contains: filters.email, mode: 'insensitive' };
        }
        if (filters.role) {
            where.role = filters.role;
        }
        if (filters.areaId) {
            where.areas = {
                some: { areaId: filters.areaId }
            };
        }
        try {
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    include: {
                        areas: {
                            include: { area: true }
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
                    },
                    skip,
                    take: limit,
                    orderBy: { name: 'asc' }
                }),
                prisma.user.count({ where })
            ]);
            const formattedUsers = users.map((user) => this.formatUserResponse(user, requestingUserRole));
            return {
                data: formattedUsers,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar usuários:', error);
            throw new errorHandler_1.CustomError('Erro interno ao buscar usuários', 500);
        }
    }
    formatUserResponse(user, requestingUserRole) {
        // @ts-ignore - Suprimindo erro de tipo implícito any
        const formattedAreas = user.areas?.map((ua) => {
            return {
                id: ua.area.id,
                name: ua.area.name,
                ...(ua.area.description && { description: ua.area.description })
            };
        }) || [];
        // @ts-ignore - Suprimindo erro de tipo implícito any
        const formattedProjects = user.projects?.map((up) => {
            return {
                id: up.project.id,
                name: up.project.name,
                status: up.project.status,
                ...(up.roleInProject && { roleInProject: up.roleInProject })
            };
        }) || [];
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            age: user.age,
            // Apenas managers podem ver tipo de contrato
            ...(requestingUserRole === types_1.UserRole.MANAGER && { contractType: user.contractType }),
            role: user.role,
            areas: formattedAreas,
            projects: formattedProjects,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map