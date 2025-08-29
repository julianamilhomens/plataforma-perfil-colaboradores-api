"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const users_1 = __importDefault(require("./users"));
const areas_1 = __importDefault(require("./areas"));
// import projectRoutes from './projects';
const router = (0, express_1.Router)();
// Rotas de autenticação
router.use('/auth', auth_1.default);
// Rotas de usuários
router.use('/users', users_1.default);
// Rotas de áreas
router.use('/areas', areas_1.default);
// Rotas de projetos (a implementar)
// router.use('/projects', projectRoutes);
exports.default = router;
//# sourceMappingURL=index.js.map