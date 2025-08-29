import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserService } from '../services/UserService';
import { AuthenticatedRequest, ContractType, UserRole } from '../types';
import { CustomError } from '../middlewares/errorHandler';

const userService = new UserService();

// Schemas de validação
const createUserSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }).max(100, { message: 'Nome muito longo' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  age: z.number().int().min(18, { message: 'Idade mínima é 18 anos' }).max(100, { message: 'Idade máxima é 100 anos' }),
  contractType: z.nativeEnum(ContractType).refine((val) => Object.values(ContractType).includes(val), {
    message: "Tipo de contrato inválido",
  }),
  role: z.nativeEnum(UserRole).optional(),
  areaIds: z.array(z.string().cuid({ message: 'ID de área inválido' })).min(1, { message: 'Pelo menos uma área deve ser selecionada' })
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  age: z.number().int().min(18).max(100).optional(),
  contractType: z.nativeEnum(ContractType).optional(),
  role: z.nativeEnum(UserRole).optional(),
  areaIds: z.array(z.string().cuid()).optional()
});

const getUsersQuerySchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  areaId: z.string().cuid().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional()
});

export class UserController {
  
  async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const requestingUserRole = req.user?.role!;
      
      const newUser = await userService.createUser(validatedData, requestingUserRole);
      
      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Usuário criado com sucesso'
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new CustomError(`Dados inválidos: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`, 400));
      } else {
        next(error);
      }
    }
  }

  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const queryParams = getUsersQuerySchema.parse(req.query);
      const requestingUserRole = req.user?.role!;
      
      const { page, limit, ...filters } = queryParams;
      
      const result = await userService.getUsers(
        filters,
        { page, limit },
        requestingUserRole
      );
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        message: 'Usuários encontrados'
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new CustomError(`Parâmetros inválidos: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`, 400));
      } else {
        next(error);
      }
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requestingUserRole = req.user?.role!;
      
      if (!id) {
        throw new CustomError('ID do usuário é obrigatório', 400);
      }
      
      const user = await userService.getUserById(id, requestingUserRole);
      
      res.json({
        success: true,
        data: user,
        message: 'Usuário encontrado'
      });
      
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateUserSchema.parse(req.body);
      const requestingUserRole = req.user?.role!;
      const requestingUserId = req.user?.id!;
      
      if (!id) {
        throw new CustomError('ID do usuário é obrigatório', 400);
      }
      
      const updatedUser = await userService.updateUser(
        id,
        validatedData,
        requestingUserRole,
        requestingUserId
      );
      
      res.json({
        success: true,
        data: updatedUser,
        message: 'Usuário atualizado com sucesso'
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new CustomError(`Dados inválidos: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`, 400));
      } else {
        next(error);
      }
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requestingUserRole = req.user?.role!;
      
      if (!id) {
        throw new CustomError('ID do usuário é obrigatório', 400);
      }
      
      await userService.deleteUser(id, requestingUserRole);
      
      res.json({
        success: true,
        message: 'Usuário excluído com sucesso'
      });
      
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;
      const requestingUserRole = req.user?.role!;
      
      const user = await userService.getUserById(userId, requestingUserRole);
      
      res.json({
        success: true,
        data: user,
        message: 'Dados do usuário atual'
      });
      
    } catch (error) {
      next(error);
    }
  }
}
