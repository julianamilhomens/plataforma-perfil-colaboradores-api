"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var AuthController_1 = require("../controllers/AuthController");
var auth_1 = require("../middlewares/auth");
var router = (0, express_1.Router)();
var authController = new AuthController_1.AuthController();
// POST /api/auth/login - Login do usuário
router.post('/login', function (req, res, next) {
    authController.login(req, res, next);
});
// GET /api/auth/validate - Validar token
router.get('/validate', auth_1.authenticateToken, function (req, res, next) {
    authController.validateToken(req, res, next);
});
// POST /api/auth/logout - Logout do usuário
router.post('/logout', auth_1.authenticateToken, function (req, res, next) {
    authController.logout(req, res, next);
});
exports.default = router;
