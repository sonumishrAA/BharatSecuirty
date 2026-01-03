import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * Auth Routes
 * -----------
 * POST /api/auth/login   - Login (public)
 * POST /api/auth/logout  - Logout (public)
 * GET  /api/auth/me      - Current user (protected)
 */

// Public routes
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

// Protected routes
router.get('/me', authMiddleware, (req, res) => authController.me(req, res));
router.post('/change-password', authMiddleware, (req, res) => authController.changePassword(req, res));

export default router;
