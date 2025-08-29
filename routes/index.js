"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_1 = require("./auth");
var users_1 = require("./users");
var areas_1 = require("./areas");
// import projectRoutes from './projects';
var router = (0, express_1.Router)();
// Rotas de autenticação
router.use('/auth', auth_1.default);
// Rotas de usuários
router.use('/users', users_1.default);
// Rotas de áreas
router.use('/areas', areas_1.default);
// Rotas de projetos (a implementar)
// router.use('/projects', projectRoutes);
exports.default = router;
