import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class UserController {
    createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
