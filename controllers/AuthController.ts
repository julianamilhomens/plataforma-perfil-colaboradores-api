import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/AuthService';
import { AuthenticatedRequest } from '../types';
import { CustomError } from '../middlewares/errorHandler';

const authService = new AuthService();

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

export class AuthController {
  
  async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
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
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new CustomError(
          `Dados inválidos: ${error.issues.map(e => e.message).join(', ')}`, // 👈 corrigido
          400
        ));
      } else {
        next(error);
      }
    }
  }

  async validateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Se chegou até aqui, o token é válido (middleware de auth já validou)
      const user = req.user;
      
      if (!user) {
        throw new CustomError('Token inválido', 401);
      }

      res.json({
        success: true,
        data: { user },
        message: 'Token válido'
      });
      
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Note: Com JWT, o logout é principalmente do lado cliente
      // Aqui podemos adicionar lógica como blacklist de tokens se necessário
      
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
      
    } catch (error) {
      next(error);
    }
  }
}
