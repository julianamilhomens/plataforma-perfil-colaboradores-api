"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var UserController_1 = require("../controllers/UserController");
var auth_1 = require("../middlewares/auth");
var router = (0, express_1.Router)();
var userController = new UserController_1.UserController();
// Aplicar middleware de autenticação em todas as rotas
router.use(auth_1.authenticateToken);
// GET /api/users/me - Dados do usuário atual
router.get('/me', function (req, res, next) {
    userController.getCurrentUser(req, res, next);
});
// GET /api/users - Listar usuários (com filtros e paginação)
router.get('/', function (req, res, next) {
    userController.getUsers(req, res, next);
});
// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', function (req, res, next) {
    userController.getUserById(req, res, next);
});
// POST /api/users - Criar usuário (apenas managers)
router.post('/', auth_1.requireManager, function (req, res, next) {
    userController.createUser(req, res, next);
});
// PUT /api/users/:id - Atualizar usuário
router.put('/:id', function (req, res, next) {
    userController.updateUser(req, res, next);
});
// DELETE /api/users/:id - Excluir usuário (apenas managers)
router.delete('/:id', auth_1.requireManager, function (req, res, next) {
    userController.deleteUser(req, res, next);
});
exports.default = router;
