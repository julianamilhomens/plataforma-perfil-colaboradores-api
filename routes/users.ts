import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, requireManager } from '../middlewares/auth';

const router = Router();
const userController = new UserController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/users/me - Dados do usuário atual
router.get('/me', (req, res, next) => {
  userController.getCurrentUser(req, res, next);
});

// GET /api/users - Listar usuários (com filtros e paginação)
router.get('/', (req, res, next) => {
  userController.getUsers(req, res, next);
});

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', (req, res, next) => {
  userController.getUserById(req, res, next);
});

// POST /api/users - Criar usuário (apenas managers)
router.post('/', requireManager, (req, res, next) => {
  userController.createUser(req, res, next);
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', (req, res, next) => {
  userController.updateUser(req, res, next);
});

// DELETE /api/users/:id - Excluir usuário (apenas managers)
router.delete('/:id', requireManager, (req, res, next) => {
  userController.deleteUser(req, res, next);
});

export default router;