import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireRole: (roles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireManager: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
