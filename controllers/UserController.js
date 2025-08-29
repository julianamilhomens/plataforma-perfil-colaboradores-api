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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
var zod_1 = require("zod");
var UserService_1 = require("../services/UserService");
var types_1 = require("../types");
var errorHandler_1 = require("../middlewares/errorHandler");
var userService = new UserService_1.UserService();
// Schemas de validação
var createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }).max(100, { message: 'Nome muito longo' }),
    email: zod_1.z.string().email({ message: 'Email inválido' }),
    password: zod_1.z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
    age: zod_1.z.number().int().min(18, { message: 'Idade mínima é 18 anos' }).max(100, { message: 'Idade máxima é 100 anos' }),
    contractType: zod_1.z.nativeEnum(types_1.ContractType).refine(function (val) { return Object.values(types_1.ContractType).includes(val); }, {
        message: "Tipo de contrato inválido",
    }),
    role: zod_1.z.nativeEnum(types_1.UserRole).optional(),
    areaIds: zod_1.z.array(zod_1.z.string().cuid({ message: 'ID de área inválido' })).min(1, { message: 'Pelo menos uma área deve ser selecionada' })
});
var updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    email: zod_1.z.string().email().optional(),
    age: zod_1.z.number().int().min(18).max(100).optional(),
    contractType: zod_1.z.nativeEnum(types_1.ContractType).optional(),
    role: zod_1.z.nativeEnum(types_1.UserRole).optional(),
    areaIds: zod_1.z.array(zod_1.z.string().cuid()).optional()
});
var getUsersQuerySchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    role: zod_1.z.nativeEnum(types_1.UserRole).optional(),
    areaId: zod_1.z.string().cuid().optional(),
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional()
});
var UserController = /** @class */ (function () {
    function UserController() {
    }
    UserController.prototype.createUser = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedData, requestingUserRole, newUser, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        validatedData = createUserSchema.parse(req.body);
                        requestingUserRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
                        return [4 /*yield*/, userService.createUser(validatedData, requestingUserRole)];
                    case 1:
                        newUser = _b.sent();
                        res.status(201).json({
                            success: true,
                            data: newUser,
                            message: 'Usuário criado com sucesso'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        if (error_1 instanceof zod_1.z.ZodError) {
                            next(new errorHandler_1.CustomError("Dados inv\u00E1lidos: ".concat(error_1.issues.map(function (e) { return e.message; }).join(', ')), 400));
                        }
                        else {
                            next(error_1);
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserController.prototype.getUsers = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var queryParams, requestingUserRole, page, limit, filters, result, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        queryParams = getUsersQuerySchema.parse(req.query);
                        requestingUserRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
                        page = queryParams.page, limit = queryParams.limit, filters = __rest(queryParams, ["page", "limit"]);
                        return [4 /*yield*/, userService.getUsers(filters, { page: page, limit: limit }, requestingUserRole)];
                    case 1:
                        result = _b.sent();
                        res.json({
                            success: true,
                            data: result.data,
                            pagination: result.pagination,
                            message: 'Usuários encontrados'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        if (error_2 instanceof zod_1.z.ZodError) {
                            next(new errorHandler_1.CustomError("Par\u00E2metros inv\u00E1lidos: ".concat(error_2.issues.map(function (e) { return e.message; }).join(', ')), 400));
                        }
                        else {
                            next(error_2);
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserController.prototype.getUserById = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, requestingUserRole, user, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        requestingUserRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
                        if (!id) {
                            throw new errorHandler_1.CustomError('ID do usuário é obrigatório', 400);
                        }
                        return [4 /*yield*/, userService.getUserById(id, requestingUserRole)];
                    case 1:
                        user = _b.sent();
                        res.json({
                            success: true,
                            data: user,
                            message: 'Usuário encontrado'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        next(error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserController.prototype.updateUser = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, validatedData, requestingUserRole, requestingUserId, updatedUser, error_4;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        validatedData = updateUserSchema.parse(req.body);
                        requestingUserRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
                        requestingUserId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                        if (!id) {
                            throw new errorHandler_1.CustomError('ID do usuário é obrigatório', 400);
                        }
                        return [4 /*yield*/, userService.updateUser(id, validatedData, requestingUserRole, requestingUserId)];
                    case 1:
                        updatedUser = _c.sent();
                        res.json({
                            success: true,
                            data: updatedUser,
                            message: 'Usuário atualizado com sucesso'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _c.sent();
                        if (error_4 instanceof zod_1.z.ZodError) {
                            next(new errorHandler_1.CustomError("Dados inv\u00E1lidos: ".concat(error_4.issues.map(function (e) { return e.message; }).join(', ')), 400));
                        }
                        else {
                            next(error_4);
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserController.prototype.deleteUser = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, requestingUserRole, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        requestingUserRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
                        if (!id) {
                            throw new errorHandler_1.CustomError('ID do usuário é obrigatório', 400);
                        }
                        return [4 /*yield*/, userService.deleteUser(id, requestingUserRole)];
                    case 1:
                        _b.sent();
                        res.json({
                            success: true,
                            message: 'Usuário excluído com sucesso'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        next(error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserController.prototype.getCurrentUser = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, requestingUserRole, user, error_6;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        requestingUserRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                        return [4 /*yield*/, userService.getUserById(userId, requestingUserRole)];
                    case 1:
                        user = _c.sent();
                        res.json({
                            success: true,
                            data: user,
                            message: 'Dados do usuário atual'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _c.sent();
                        next(error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return UserController;
}());
exports.UserController = UserController;
