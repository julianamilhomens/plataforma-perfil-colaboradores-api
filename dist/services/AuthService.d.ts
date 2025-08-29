import { JwtPayload } from 'jsonwebtoken';
import { LoginDTO, AuthResponseDTO, UserResponseDTO, UserRole } from '../types';
interface DecodedToken extends JwtPayload {
    userId: string;
    role: UserRole;
    email: string;
}
export declare class AuthService {
    login(loginData: LoginDTO): Promise<AuthResponseDTO>;
    validateToken(token: string): Promise<DecodedToken>;
    private generateToken;
    private validateUserRole;
    private validateContractType;
    private validateProjectStatus;
    getUserById(userId: string): Promise<UserResponseDTO>;
    getUserFromToken(token: string): Promise<{
        id: string;
        role: UserRole;
        email: string;
    }>;
}
export {};
