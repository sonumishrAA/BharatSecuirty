import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import type { LoginDto } from '../models/User.js';

/**
 * Auth Controller
 * Handles authentication endpoints
 */
export class AuthController {
    /**
     * POST /api/auth/login
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const dto: LoginDto = req.body;

            if (!dto.email || !dto.password) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Email and password are required',
                });
                return;
            }

            const result = await authService.login(dto);

            if (!result) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid email or password',
                });
                return;
            }

            // Allow both admin and user roles to login
            res.json(result);
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Login failed',
            });
        }
    }

    /**
     * GET /api/auth/me
     */
    async me(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Not authenticated',
                });
                return;
            }

            const user = await authService.getUserById(req.user.userId);

            if (!user) {
                res.status(404).json({
                    error: 'Not Found',
                    message: 'User not found',
                });
                return;
            }

            res.json(user);
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to get user',
            });
        }
    }

    /**
     * POST /api/auth/logout
     */
    async logout(_req: Request, res: Response): Promise<void> {
        // JWT is stateless, client just needs to remove token
        res.json({ message: 'Logged out successfully' });
    }

    /**
     * POST /api/auth/change-password
     */
    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const { newPassword } = req.body;
            if (!newPassword || newPassword.length < 8) {
                res.status(400).json({ error: 'Password must be at least 8 characters' });
                return;
            }

            await authService.changePassword(req.user.userId, newPassword);
            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ error: 'Failed to change password' });
        }
    }
}

export const authController = new AuthController();

