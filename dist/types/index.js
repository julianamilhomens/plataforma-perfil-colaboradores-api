"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectStatus = exports.ContractType = exports.UserRole = void 0;
// Enums
var UserRole;
(function (UserRole) {
    UserRole["NORMAL"] = "NORMAL";
    UserRole["MANAGER"] = "MANAGER";
})(UserRole || (exports.UserRole = UserRole = {}));
var ContractType;
(function (ContractType) {
    ContractType["CLT"] = "CLT";
    ContractType["PJ"] = "PJ";
    ContractType["FREELANCER"] = "FREELANCER";
})(ContractType || (exports.ContractType = ContractType = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["PLANNING"] = "PLANNING";
    ProjectStatus["DEVELOPMENT"] = "DEVELOPMENT";
    ProjectStatus["COMPLETED"] = "COMPLETED";
    ProjectStatus["CANCELLED"] = "CANCELLED";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
//# sourceMappingURL=index.js.map