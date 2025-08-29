"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const userController = new UserController_1.UserController();
// Aplicar middleware de autenticação em todas as rotas
router.use(auth_1.authenticateToken);
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
router.post('/', auth_1.requireManager, (req, res, next) => {
    userController.createUser(req, res, next);
});
// PUT /api/users/:id - Atualizar usuário
router.put('/:id', (req, res, next) => {
    userController.updateUser(req, res, next);
});
// DELETE /api/users/:id - Excluir usuário (apenas managers)
router.delete('/:id', auth_1.requireManager, (req, res, next) => {
    userController.deleteUser(req, res, next);
});
exports.default = router;
//# sourceMappingURL=users.js.map