"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const zod_1 = require("zod");
const AuthService_1 = require("../services/AuthService");
const errorHandler_1 = require("../middlewares/errorHandler");
const authService = new AuthService_1.AuthService();
// Schemas de validação
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});
class AuthController {
    async login(req, res, next) {
        try {
            // Validar dados de entrada
            const validatedData = loginSchema.parse(req.body);
            // Realizar login
            const result = await authService.login(validatedData);
            res.json({
                success: true,
                data: result,
                message: 'Login realizado com sucesso'
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                next(new errorHandler_1.CustomError(`Dados inválidos: ${error.issues.map(e => e.message).join(', ')}`, // 👈 corrigido
                400));
            }
            else {
                next(error);
            }
        }
    }
    async validateToken(req, res, next) {
        try {
            // Se chegou até aqui, o token é válido (middleware de auth já validou)
            const user = req.user;
            if (!user) {
                throw new errorHandler_1.CustomError('Token inválido', 401);
            }
            res.json({
                success: true,
                data: { user },
                message: 'Token válido'
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            // Note: Com JWT, o logout é principalmente do lado cliente
            // Aqui podemos adicionar lógica como blacklist de tokens se necessário
            res.json({
                success: true,
                message: 'Logout realizado com sucesso'
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map