import { Router } from 'express';
import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';
import { authenticateToken } from '../middlewares/auth';
import { CustomError } from '../middlewares/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/areas - Listar todas as áreas
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const areas = await prisma.area.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: areas,
      message: 'Áreas encontradas'
    });
  } catch (error) {
    next(new CustomError('Erro ao buscar áreas', 500));
  }
});

export default router;