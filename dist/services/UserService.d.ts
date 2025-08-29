import { CreateUserDTO, UpdateUserDTO, UserResponseDTO, UserRole, UserFilters, PaginationParams, PaginatedResponse } from '../types';
export declare class UserService {
    createUser(userData: CreateUserDTO, requestingUserRole: UserRole): Promise<UserResponseDTO>;
    getUserById(userId: string, requestingUserRole: UserRole): Promise<UserResponseDTO>;
    updateUser(userId: string, updateData: UpdateUserDTO, requestingUserRole: UserRole, requestingUserId: string): Promise<UserResponseDTO>;
    deleteUser(userId: string, requestingUserRole: UserRole): Promise<void>;
    getUsers(filters: UserFilters | undefined, pagination: PaginationParams | undefined, requestingUserRole: UserRole): Promise<PaginatedResponse<UserResponseDTO>>;
    private formatUserResponse;
}
