"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
// POST /api/auth/login - Login do usuário
router.post('/login', (req, res, next) => {
    authController.login(req, res, next);
});
// GET /api/auth/validate - Validar token
router.get('/validate', auth_1.authenticateToken, (req, res, next) => {
    authController.validateToken(req, res, next);
});
// POST /api/auth/logout - Logout do usuário
router.post('/logout', auth_1.authenticateToken, (req, res, next) => {
    authController.logout(req, res, next);
});
exports.default = router;
//# sourceMappingURL=auth.js.map