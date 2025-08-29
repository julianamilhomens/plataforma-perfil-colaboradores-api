import { Request } from 'express';
export declare enum UserRole {
    NORMAL = "NORMAL",
    MANAGER = "MANAGER"
}
export declare enum ContractType {
    CLT = "CLT",
    PJ = "PJ",
    FREELANCER = "FREELANCER"
}
export declare enum ProjectStatus {
    PLANNING = "PLANNING",
    DEVELOPMENT = "DEVELOPMENT",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
    age: number;
    contractType: ContractType;
    role?: UserRole;
    areaIds: string[];
}
export interface UpdateUserDTO {
    name?: string;
    email?: string;
    age?: number;
    contractType?: ContractType;
    role?: UserRole;
    areaIds?: string[];
}
export interface CreateProjectDTO {
    name: string;
    description?: string;
    deadline?: string;
    technologies?: string[];
    collaboratorIds: string[];
}
export interface UpdateProjectDTO {
    name?: string;
    description?: string;
    deadline?: string;
    technologies?: string[];
    status?: ProjectStatus;
    collaboratorIds?: string[];
}
export interface LoginDTO {
    email: string;
    password: string;
}
export interface UserResponseDTO {
    id: string;
    name: string;
    email: string;
    age: number;
    contractType?: ContractType;
    role: UserRole;
    areas: AreaResponseDTO[];
    projects?: ProjectSummaryDTO[];
    createdAt: Date;
    updatedAt: Date;
}
export interface AreaResponseDTO {
    id: string;
    name: string;
    description?: string;
}
export interface ProjectResponseDTO {
    id: string;
    name: string;
    description?: string;
    deadline?: Date;
    technologies?: string[];
    status: ProjectStatus;
    collaborators: UserSummaryDTO[];
    createdAt: Date;
    updatedAt: Date;
}
export interface ProjectSummaryDTO {
    id: string;
    name: string;
    status: ProjectStatus;
    roleInProject?: string;
}
export interface UserSummaryDTO {
    id: string;
    name: string;
    email: string;
    areas: AreaResponseDTO[];
    roleInProject?: string;
}
export interface AuthResponseDTO {
    user: UserResponseDTO;
    token: string;
}
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
        email: string;
    };
}
export interface UserFilters {
    name?: string;
    email?: string;
    role?: UserRole;
    areaId?: string;
}
export interface ProjectFilters {
    name?: string;
    status?: ProjectStatus;
    collaboratorId?: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}
export interface PaginationParams {
    page?: number;
    limit?: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
