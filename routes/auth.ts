import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

// POST /api/auth/login - Login do usuário
router.post('/login', (req, res, next) => {
  authController.login(req, res, next);
});

// GET /api/auth/validate - Validar token
router.get('/validate', authenticateToken, (req, res, next) => {
  authController.validateToken(req, res, next);
});

// POST /api/auth/logout - Logout do usuário
router.post('/logout', authenticateToken, (req, res, next) => {
  authController.logout(req, res, next);
});

export default router;