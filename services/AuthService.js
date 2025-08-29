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
exports.AuthService = void 0;
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var client_1 = require("@prisma/client");
var types_1 = require("../types");
var errorHandler_1 = require("../middlewares/errorHandler");
var logger_1 = require("../utils/logger");
var prisma = new client_1.PrismaClient();
var AuthService = /** @class */ (function () {
    function AuthService() {
    }
    AuthService.prototype.login = function (loginData) {
        return __awaiter(this, void 0, void 0, function () {
            var email, password, user, isValidPassword, userRole, contractType, token, areas, projects, userResponse;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        email = loginData.email, password = loginData.password;
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { email: email },
                                include: {
                                    areas: {
                                        include: {
                                            area: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    description: true
                                                }
                                            }
                                        }
                                    },
                                    projects: {
                                        include: {
                                            project: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    status: true
                                                }
                                            }
                                        }
                                    }
                                }
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            logger_1.logger.warn("Tentativa de login com email inexistente: ".concat(email));
                            throw new errorHandler_1.CustomError('Credenciais inválidas', 401);
                        }
                        return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password)];
                    case 2:
                        isValidPassword = _a.sent();
                        if (!isValidPassword) {
                            logger_1.logger.warn("Tentativa de login com senha incorreta para: ".concat(email));
                            throw new errorHandler_1.CustomError('Credenciais inválidas', 401);
                        }
                        userRole = this.validateUserRole(user.role);
                        contractType = this.validateContractType(user.contractType);
                        token = this.generateToken({
                            userId: user.id,
                            role: userRole,
                            email: user.email
                        });
                        logger_1.logger.info("Login realizado com sucesso: ".concat(email));
                        areas = user.areas.map(function (ua) { return ({
                            id: ua.area.id,
                            name: ua.area.name,
                            description: ua.area.description || undefined
                        }); });
                        projects = user.projects.map(function (up) { return ({
                            id: up.project.id,
                            name: up.project.name,
                            status: _this.validateProjectStatus(up.project.status),
                            roleInProject: up.roleInProject || undefined
                        }); });
                        userResponse = {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            age: user.age || 0, // Tratar null/undefined convertendo para 0 ou valor padrão
                            contractType: contractType,
                            role: userRole,
                            areas: areas,
                            projects: projects,
                            createdAt: user.createdAt,
                            updatedAt: user.updatedAt
                        };
                        return [2 /*return*/, {
                                user: userResponse,
                                token: token
                            }];
                }
            });
        });
    };
    AuthService.prototype.validateToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var secret, decoded;
            return __generator(this, function (_a) {
                try {
                    secret = process.env.JWT_SECRET;
                    if (!secret) {
                        throw new errorHandler_1.CustomError('Configuração JWT inválida', 500);
                    }
                    decoded = jsonwebtoken_1.default.verify(token, secret);
                    // Validar se o payload tem a estrutura esperada
                    if (!decoded.userId || !decoded.role || !decoded.email) {
                        throw new errorHandler_1.CustomError('Token com payload inválido', 401);
                    }
                    return [2 /*return*/, decoded];
                }
                catch (error) {
                    if (error instanceof errorHandler_1.CustomError) {
                        throw error;
                    }
                    throw new errorHandler_1.CustomError('Token inválido', 401);
                }
                return [2 /*return*/];
            });
        });
    };
    AuthService.prototype.generateToken = function (payload) {
        var secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new errorHandler_1.CustomError('Configuração JWT não encontrada', 500);
        }
        // Força compatibilidade com o tipo do SignOptions
        var expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
        var options = { expiresIn: expiresIn };
        return jsonwebtoken_1.default.sign(payload, secret, options);
    };
    AuthService.prototype.validateUserRole = function (role) {
        var validRoles = Object.values(types_1.UserRole);
        if (!validRoles.includes(role)) {
            throw new errorHandler_1.CustomError("Role inv\u00E1lido: ".concat(role), 500);
        }
        return role;
    };
    AuthService.prototype.validateContractType = function (contractType) {
        if (!contractType) {
            return undefined;
        }
        var validContractTypes = Object.values(types_1.ContractType);
        if (!validContractTypes.includes(contractType)) {
            throw new errorHandler_1.CustomError("Tipo de contrato inv\u00E1lido: ".concat(contractType), 500);
        }
        return contractType;
    };
    AuthService.prototype.validateProjectStatus = function (status) {
        var validStatuses = Object.values(types_1.ProjectStatus);
        if (!validStatuses.includes(status)) {
            // Se o status não for válido, usar um padrão ou lançar erro
            logger_1.logger.warn("Status de projeto inv\u00E1lido encontrado: ".concat(status, ", usando PLANNING como padr\u00E3o"));
            return types_1.ProjectStatus.PLANNING;
        }
        return status;
    };
    // Método auxiliar para buscar usuário pelo ID (útil para middleware de auth)
    AuthService.prototype.getUserById = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, areas, projects;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.user.findUnique({
                            where: { id: userId },
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                age: true,
                                contractType: true,
                                role: true,
                                createdAt: true,
                                updatedAt: true,
                                areas: {
                                    include: {
                                        area: {
                                            select: {
                                                id: true,
                                                name: true,
                                                description: true
                                            }
                                        }
                                    }
                                },
                                projects: {
                                    include: {
                                        project: {
                                            select: {
                                                id: true,
                                                name: true,
                                                status: true
                                            }
                                        }
                                    }
                                }
                            }
                        })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new errorHandler_1.CustomError('Usuário não encontrado', 404);
                        }
                        areas = user.areas.map(function (ua) { return ({
                            id: ua.area.id,
                            name: ua.area.name,
                            description: ua.area.description || undefined
                        }); });
                        projects = user.projects.map(function (up) { return ({
                            id: up.project.id,
                            name: up.project.name,
                            status: _this.validateProjectStatus(up.project.status),
                            roleInProject: up.roleInProject || undefined
                        }); });
                        return [2 /*return*/, {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                age: user.age || 0, // Tratar null/undefined convertendo para 0 ou valor padrão
                                contractType: this.validateContractType(user.contractType),
                                role: this.validateUserRole(user.role),
                                areas: areas,
                                projects: projects,
                                createdAt: user.createdAt,
                                updatedAt: user.updatedAt
                            }];
                }
            });
        });
    };
    // Método auxiliar para extrair dados do usuário do token (para middleware)
    AuthService.prototype.getUserFromToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.validateToken(token)];
                    case 1:
                        decoded = _a.sent();
                        return [2 /*return*/, {
                                id: decoded.userId,
                                role: decoded.role,
                                email: decoded.email
                            }];
                }
            });
        });
    };
    return AuthService;
}());
exports.AuthService = AuthService;
