import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, UserRole } from '../types';
import { CustomError } from './errorHandler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface JWTPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new CustomError('Token de acesso não fornecido', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new CustomError('Configuração JWT inválida', 500);
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, secret) as JWTPayload;

    // Verificar se o usuário ainda existe no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true }
    });

    if (!user) {
      throw new CustomError('Usuário não encontrado', 401);
    }

    // Adicionar dados do usuário à requisição
    req.user = {
      id: user.id,
      role: user.role as UserRole,
      email: user.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Token inválido', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError('Token expirado', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new CustomError('Usuário não autenticado', 401));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Acesso negado para usuário ${req.user.email} com role ${req.user.role}`);
      return next(new CustomError('Acesso negado', 403));
    }

    next();
  };
};

export const requireManager = requireRole([UserRole.MANAGER]);