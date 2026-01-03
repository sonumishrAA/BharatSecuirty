import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../config/auth.js';

/**
 * Extend Express Request to include user
 */
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;
    console.log('[AuthMiddleware] Header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[AuthMiddleware] No Bearer token');
        res.status(401).json({
            error: 'Unauthorized',
            message: 'No token provided',
        });
        return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
        console.log('[AuthMiddleware] Token verification failed');
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
        });
        return;
    }

    console.log('[AuthMiddleware] User authenticated:', payload.email, payload.role);
    req.user = payload;
    next();
}

/**
 * Admin Only Middleware
 * Requires user to have admin role
 */
export function adminMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (!req.user) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
        });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required',
        });
        return;
    }

    next();
}

export default { authMiddleware, adminMiddleware };
