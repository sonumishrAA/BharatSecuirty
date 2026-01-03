import { Router } from 'express';
import { postsController } from '../controllers/posts.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * Posts Routes
 * ------------
 * GET    /api/posts                    - List all posts (public)
 * GET    /api/posts/categories/grouped - Posts by category (public)
 * GET    /api/posts/:id                - Single post by ID (public)
 * GET    /api/posts/slug/:slug         - Single post by slug (public)
 * POST   /api/posts                    - Create post (admin)
 * PUT    /api/posts/:id                - Update post (admin)
 * DELETE /api/posts/:id                - Delete post (admin)
 * PATCH  /api/posts/:id/status         - Toggle status (admin)
 */

// Public routes
router.get('/', (req, res) => postsController.getAll(req, res));
router.get('/categories/grouped', (req, res) => postsController.getGroupedByCategory(req, res));
router.get('/slug/:slug', (req, res) => postsController.getBySlug(req, res));
router.get('/:id', (req, res) => postsController.getById(req, res));

// Protected routes (admin only)
router.post('/', authMiddleware, adminMiddleware, (req, res) => postsController.create(req, res));
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => postsController.update(req, res));
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => postsController.delete(req, res));
router.patch('/:id/status', authMiddleware, adminMiddleware, (req, res) => postsController.toggleStatus(req, res));

export default router;
