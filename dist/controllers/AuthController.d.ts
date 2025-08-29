import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class AuthController {
    login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    validateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
