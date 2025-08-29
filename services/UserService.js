"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.UserService = void 0;
var bcryptjs_1 = require("bcryptjs");
var client_1 = require("@prisma/client");
var types_1 = require("../types");
var errorHandler_1 = require("../middlewares/errorHandler");
var logger_1 = require("../utils/logger");
var prisma = new client_1.PrismaClient();
var UserService = /** @class */ (function () {
    function UserService() {
    }
    UserService.prototype.createUser = function (userData, requestingUserRole) {
        return __awaiter(this, void 0, void 0, function () {
            var existingUser, areas, hashedPassword, newUser, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Verificar se apenas managers podem criar usuários
                        if (requestingUserRole !== types_1.UserRole.MANAGER) {
                            throw new errorHandler_1.CustomError('Apenas gestores podem criar usuários', 403);
                        }
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { email: userData.email }
                            })];
                    case 1:
                        existingUser = _a.sent();
                        if (existingUser) {
                            throw new errorHandler_1.CustomError('Email já cadastrado', 400);
                        }
                        return [4 /*yield*/, prisma.area.findMany({
                                where: { id: { in: userData.areaIds } }
                            })];
                    case 2:
                        areas = _a.sent();
                        if (areas.length !== userData.areaIds.length) {
                            throw new errorHandler_1.CustomError('Uma ou mais áreas não foram encontradas', 400);
                        }
                        return [4 /*yield*/, bcryptjs_1.default.hash(userData.password, 12)];
                    case 3:
                        hashedPassword = _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var user;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, tx.user.create({
                                                data: {
                                                    name: userData.name,
                                                    email: userData.email,
                                                    password: hashedPassword,
                                                    age: userData.age,
                                                    contractType: userData.contractType,
                                                    role: userData.role || types_1.UserRole.NORMAL
                                                }
                                            })];
                                        case 1:
                                            user = _a.sent();
                                            // Associar áreas
                                            return [4 /*yield*/, tx.userArea.createMany({
                                                    data: userData.areaIds.map(function (areaId) { return ({
                                                        userId: user.id,
                                                        areaId: areaId
                                                    }); })
                                                })];
                                        case 2:
                                            // Associar áreas
                                            _a.sent();
                                            return [2 /*return*/, user];
                                    }
                                });
                            }); })];
                    case 5:
                        newUser = _a.sent();
                        logger_1.logger.info("Usu\u00E1rio criado: ".concat(newUser.email, " por gestor"));
                        return [4 /*yield*/, this.getUserById(newUser.id, requestingUserRole)];
                    case 6: 
                    // Buscar usuário completo para retorno
                    return [2 /*return*/, _a.sent()];
                    case 7:
                        error_1 = _a.sent();
                        logger_1.logger.error('Erro ao criar usuário:', error_1);
                        throw new errorHandler_1.CustomError('Erro interno ao criar usuário', 500);
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.getUserById = function (userId, requestingUserRole) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.user.findUnique({
                            where: { id: userId },
                            include: {
                                areas: {
                                    include: { area: true }
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
                        return [2 /*return*/, this.formatUserResponse(user, requestingUserRole)];
                }
            });
        });
    };
    UserService.prototype.updateUser = function (userId, updateData, requestingUserRole, requestingUserId) {
        return __awaiter(this, void 0, void 0, function () {
            var canUpdate, existingUser, emailExists, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        canUpdate = requestingUserRole === types_1.UserRole.MANAGER || requestingUserId === userId;
                        if (!canUpdate) {
                            throw new errorHandler_1.CustomError('Sem permissão para atualizar este usuário', 403);
                        }
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { id: userId }
                            })];
                    case 1:
                        existingUser = _a.sent();
                        if (!existingUser) {
                            throw new errorHandler_1.CustomError('Usuário não encontrado', 404);
                        }
                        if (!(updateData.email && updateData.email !== existingUser.email)) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { email: updateData.email }
                            })];
                    case 2:
                        emailExists = _a.sent();
                        if (emailExists) {
                            throw new errorHandler_1.CustomError('Email já cadastrado', 400);
                        }
                        _a.label = 3;
                    case 3:
                        // Apenas managers podem alterar role
                        if (updateData.role && requestingUserRole !== types_1.UserRole.MANAGER) {
                            delete updateData.role;
                        }
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 7, , 8]);
                        return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var areas;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: 
                                        // Atualizar dados básicos
                                        return [4 /*yield*/, tx.user.update({
                                                where: { id: userId },
                                                data: __assign(__assign(__assign(__assign(__assign({}, (updateData.name && { name: updateData.name })), (updateData.email && { email: updateData.email })), (updateData.age && { age: updateData.age })), (updateData.contractType && { contractType: updateData.contractType })), (updateData.role && { role: updateData.role }))
                                            })];
                                        case 1:
                                            // Atualizar dados básicos
                                            _a.sent();
                                            if (!updateData.areaIds) return [3 /*break*/, 5];
                                            return [4 /*yield*/, tx.area.findMany({
                                                    where: { id: { in: updateData.areaIds } }
                                                })];
                                        case 2:
                                            areas = _a.sent();
                                            if (areas.length !== updateData.areaIds.length) {
                                                throw new errorHandler_1.CustomError('Uma ou mais áreas não foram encontradas', 400);
                                            }
                                            // Remover associações antigas
                                            return [4 /*yield*/, tx.userArea.deleteMany({
                                                    where: { userId: userId }
                                                })];
                                        case 3:
                                            // Remover associações antigas
                                            _a.sent();
                                            // Criar novas associações
                                            return [4 /*yield*/, tx.userArea.createMany({
                                                    data: updateData.areaIds.map(function (areaId) { return ({
                                                        userId: userId,
                                                        areaId: areaId
                                                    }); })
                                                })];
                                        case 4:
                                            // Criar novas associações
                                            _a.sent();
                                            _a.label = 5;
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 5:
                        _a.sent();
                        logger_1.logger.info("Usu\u00E1rio ".concat(userId, " atualizado"));
                        return [4 /*yield*/, this.getUserById(userId, requestingUserRole)];
                    case 6: return [2 /*return*/, _a.sent()];
                    case 7:
                        error_2 = _a.sent();
                        logger_1.logger.error('Erro ao atualizar usuário:', error_2);
                        throw error_2 instanceof errorHandler_1.CustomError ? error_2 : new errorHandler_1.CustomError('Erro interno ao atualizar usuário', 500);
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.deleteUser = function (userId, requestingUserRole) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (requestingUserRole !== types_1.UserRole.MANAGER) {
                            throw new errorHandler_1.CustomError('Apenas gestores podem excluir usuários', 403);
                        }
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { id: userId }
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new errorHandler_1.CustomError('Usuário não encontrado', 404);
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, prisma.user.delete({
                                where: { id: userId }
                            })];
                    case 3:
                        _a.sent();
                        logger_1.logger.info("Usu\u00E1rio ".concat(userId, " exclu\u00EDdo por gestor"));
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        logger_1.logger.error('Erro ao excluir usuário:', error_3);
                        throw new errorHandler_1.CustomError('Erro interno ao excluir usuário', 500);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.getUsers = function () {
        return __awaiter(this, arguments, void 0, function (filters, pagination, requestingUserRole) {
            var _a, page, _b, limit, skip, where, _c, users, total, formattedUsers, error_4;
            var _this = this;
            if (filters === void 0) { filters = {}; }
            if (pagination === void 0) { pagination = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = pagination.page, page = _a === void 0 ? 1 : _a, _b = pagination.limit, limit = _b === void 0 ? 10 : _b;
                        skip = (page - 1) * limit;
                        where = {};
                        // Aplicar filtros
                        if (filters.name) {
                            where.name = { contains: filters.name, mode: 'insensitive' };
                        }
                        if (filters.email) {
                            where.email = { contains: filters.email, mode: 'insensitive' };
                        }
                        if (filters.role) {
                            where.role = filters.role;
                        }
                        if (filters.areaId) {
                            where.areas = {
                                some: { areaId: filters.areaId }
                            };
                        }
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all([
                                prisma.user.findMany({
                                    where: where,
                                    include: {
                                        areas: {
                                            include: { area: true }
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
                                    },
                                    skip: skip,
                                    take: limit,
                                    orderBy: { name: 'asc' }
                                }),
                                prisma.user.count({ where: where })
                            ])];
                    case 2:
                        _c = _d.sent(), users = _c[0], total = _c[1];
                        formattedUsers = users.map(function (user) {
                            return _this.formatUserResponse(user, requestingUserRole);
                        });
                        return [2 /*return*/, {
                                data: formattedUsers,
                                pagination: {
                                    page: page,
                                    limit: limit,
                                    total: total,
                                    totalPages: Math.ceil(total / limit)
                                }
                            }];
                    case 3:
                        error_4 = _d.sent();
                        logger_1.logger.error('Erro ao buscar usuários:', error_4);
                        throw new errorHandler_1.CustomError('Erro interno ao buscar usuários', 500);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.formatUserResponse = function (user, requestingUserRole) {
        var _a, _b;
        // @ts-ignore - Suprimindo erro de tipo implícito any
        var formattedAreas = ((_a = user.areas) === null || _a === void 0 ? void 0 : _a.map(function (ua) {
            return __assign({ id: ua.area.id, name: ua.area.name }, (ua.area.description && { description: ua.area.description }));
        })) || [];
        // @ts-ignore - Suprimindo erro de tipo implícito any
        var formattedProjects = ((_b = user.projects) === null || _b === void 0 ? void 0 : _b.map(function (up) {
            return __assign({ id: up.project.id, name: up.project.name, status: up.project.status }, (up.roleInProject && { roleInProject: up.roleInProject }));
        })) || [];
        return __assign(__assign({ id: user.id, name: user.name, email: user.email, age: user.age }, (requestingUserRole === types_1.UserRole.MANAGER && { contractType: user.contractType })), { role: user.role, areas: formattedAreas, projects: formattedProjects, createdAt: user.createdAt, updatedAt: user.updatedAt });
    };
    return UserService;
}());
exports.UserService = UserService;
