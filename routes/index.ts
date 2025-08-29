import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import areaRoutes from './areas';
// import projectRoutes from './projects';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de usuários
router.use('/users', userRoutes);

// Rotas de áreas
router.use('/areas', areaRoutes);

// Rotas de projetos (a implementar)
// router.use('/projects', projectRoutes);

export default router;