import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import type { LoginDto } from '../models/User.js';

/**
 * Auth Controller
 * Handles authentication endpoints with security hardening
 */

// Input validation helpers
const sanitizeInput = (input: string): string => {
    if (!input) return '';
    // Remove dangerous characters that could be used for injection
    return input
        .trim()
        .replace(/[<>'"`;\\]/g, '') // Remove XSS/injection chars
        .substring(0, 255); // Limit length
};

const isValidEmail = (email: string): boolean => {
    // Strict email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 255;
};

const isValidPassword = (password: string): boolean => {
    // Password must be 6-128 chars, no injection characters
    return password.length >= 6 &&
        password.length <= 128 &&
        !/[<>'"`;\\]/.test(password);
};

export class AuthController {
    /**
     * POST /api/auth/login
     * Security: Input validation, rate limiting should be added at nginx/middleware level
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Email and password are required',
                });
                return;
            }

            // Sanitize and validate email
            const sanitizedEmail = sanitizeInput(email.toLowerCase());
            if (!isValidEmail(sanitizedEmail)) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid email format',
                });
                return;
            }

            // Validate password format (prevent injection)
            if (!isValidPassword(password)) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid password format',
                });
                return;
            }

            // Use sanitized email for login
            const dto: LoginDto = { email: sanitizedEmail, password };
            const result = await authService.login(dto);

            if (!result) {
                // Generic error to prevent user enumeration
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid credentials',
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

