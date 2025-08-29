"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireManager = exports.requireRole = exports.authenticateToken = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var client_1 = require("@prisma/client");
var types_1 = require("../types");
var errorHandler_1 = require("./errorHandler");
var logger_1 = require("../utils/logger");
var prisma = new client_1.PrismaClient();
var authenticateToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var authHeader, token, secret, decoded, user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                authHeader = req.headers.authorization;
                token = authHeader && authHeader.split(' ')[1];
                if (!token) {
                    throw new errorHandler_1.CustomError('Token de acesso não fornecido', 401);
                }
                secret = process.env.JWT_SECRET;
                if (!secret) {
                    throw new errorHandler_1.CustomError('Configuração JWT inválida', 500);
                }
                decoded = jsonwebtoken_1.default.verify(token, secret);
                return [4 /*yield*/, prisma.user.findUnique({
                        where: { id: decoded.userId },
                        select: { id: true, role: true, email: true }
                    })];
            case 1:
                user = _a.sent();
                if (!user) {
                    throw new errorHandler_1.CustomError('Usuário não encontrado', 401);
                }
                // Adicionar dados do usuário à requisição
                req.user = {
                    id: user.id,
                    role: user.role,
                    email: user.email
                };
                next();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                if (error_1 instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    next(new errorHandler_1.CustomError('Token inválido', 401));
                }
                else if (error_1 instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    next(new errorHandler_1.CustomError('Token expirado', 401));
                }
                else {
                    next(error_1);
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.authenticateToken = authenticateToken;
var requireRole = function (roles) {
    return function (req, res, next) {
        if (!req.user) {
            return next(new errorHandler_1.CustomError('Usuário não autenticado', 401));
        }
        if (!roles.includes(req.user.role)) {
            logger_1.logger.warn("Acesso negado para usu\u00E1rio ".concat(req.user.email, " com role ").concat(req.user.role));
            return next(new errorHandler_1.CustomError('Acesso negado', 403));
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireManager = (0, exports.requireRole)([types_1.UserRole.MANAGER]);
