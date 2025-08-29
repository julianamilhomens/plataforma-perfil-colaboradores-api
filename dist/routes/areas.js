"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middlewares/auth");
const errorHandler_1 = require("../middlewares/errorHandler");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Aplicar middleware de autenticação em todas as rotas
router.use(auth_1.authenticateToken);
// GET /api/areas - Listar todas as áreas
router.get('/', async (req, res, next) => {
    try {
        const areas = await prisma.area.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({
            success: true,
            data: areas,
            message: 'Áreas encontradas'
        });
    }
    catch (error) {
        next(new errorHandler_1.CustomError('Erro ao buscar áreas', 500));
    }
});
exports.default = router;
//# sourceMappingURL=areas.js.map