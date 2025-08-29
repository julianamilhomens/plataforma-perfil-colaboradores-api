"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const zod_1 = require("zod");
const UserService_1 = require("../services/UserService");
const types_1 = require("../types");
const errorHandler_1 = require("../middlewares/errorHandler");
const userService = new UserService_1.UserService();
// Schemas de validação
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }).max(100, { message: 'Nome muito longo' }),
    email: zod_1.z.string().email({ message: 'Email inválido' }),
    password: zod_1.z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
    age: zod_1.z.number().int().min(18, { message: 'Idade mínima é 18 anos' }).max(100, { message: 'Idade máxima é 100 anos' }),
    contractType: zod_1.z.nativeEnum(types_1.ContractType).refine((val) => Object.values(types_1.ContractType).includes(val), {
        message: "Tipo de contrato inválido",
    }),
    role: zod_1.z.nativeEnum(types_1.UserRole).optional(),
    areaIds: zod_1.z.array(zod_1.z.string().cuid({ message: 'ID de área inválido' })).min(1, { message: 'Pelo menos uma área deve ser selecionada' })
});
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    email: zod_1.z.string().email().optional(),
    age: zod_1.z.number().int().min(18).max(100).optional(),
    contractType: zod_1.z.nativeEnum(types_1.ContractType).optional(),
    role: zod_1.z.nativeEnum(types_1.UserRole).optional(),
    areaIds: zod_1.z.array(zod_1.z.string().cuid()).optional()
});
const getUsersQuerySchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    role: zod_1.z.nativeEnum(types_1.UserRole).optional(),
    areaId: zod_1.z.string().cuid().optional(),
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional()
});
class UserController {
    async createUser(req, res, next) {
        try {
            const validatedData = createUserSchema.parse(req.body);
            const requestingUserRole = req.user?.role;
            const newUser = await userService.createUser(validatedData, requestingUserRole);
            res.status(201).json({
                success: true,
                data: newUser,
                message: 'Usuário criado com sucesso'
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                next(new errorHandler_1.CustomError(`Dados inválidos: ${error.issues.map((e) => e.message).join(', ')}`, 400));
            }
            else {
                next(error);
            }
        }
    }
    async getUsers(req, res, next) {
        try {
            const queryParams = getUsersQuerySchema.parse(req.query);
            const requestingUserRole = req.user?.role;
            const { page, limit, ...filters } = queryParams;
            const result = await userService.getUsers(filters, { page, limit }, requestingUserRole);
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                message: 'Usuários encontrados'
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                next(new errorHandler_1.CustomError(`Parâmetros inválidos: ${error.issues.map((e) => e.message).join(', ')}`, 400));
            }
            else {
                next(error);
            }
        }
    }
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const requestingUserRole = req.user?.role;
            if (!id) {
                throw new errorHandler_1.CustomError('ID do usuário é obrigatório', 400);
            }
            const user = await userService.getUserById(id, requestingUserRole);
            res.json({
                success: true,
                data: user,
                message: 'Usuário encontrado'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = updateUserSchema.parse(req.body);
            const requestingUserRole = req.user?.role;
            const requestingUserId = req.user?.id;
            if (!id) {
                throw new errorHandler_1.CustomError('ID do usuário é obrigatório', 400);
            }
            const updatedUser = await userService.updateUser(id, validatedData, requestingUserRole, requestingUserId);
            res.json({
                success: true,
                data: updatedUser,
                message: 'Usuário atualizado com sucesso'
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                next(new errorHandler_1.CustomError(`Dados inválidos: ${error.issues.map((e) => e.message).join(', ')}`, 400));
            }
            else {
                next(error);
            }
        }
    }
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const requestingUserRole = req.user?.role;
            if (!id) {
                throw new errorHandler_1.CustomError('ID do usuário é obrigatório', 400);
            }
            await userService.deleteUser(id, requestingUserRole);
            res.json({
                success: true,
                message: 'Usuário excluído com sucesso'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getCurrentUser(req, res, next) {
        try {
            const userId = req.user?.id;
            const requestingUserRole = req.user?.role;
            const user = await userService.getUserById(userId, requestingUserRole);
            res.json({
                success: true,
                data: user,
                message: 'Dados do usuário atual'
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map