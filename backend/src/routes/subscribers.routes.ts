import { Router } from 'express';
import { subscribersController } from '../controllers/subscribers.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public route to subscribe
router.post('/', subscribersController.subscribe);

// Admin route to view subscribers
router.get('/', authMiddleware, adminMiddleware, subscribersController.getAll);

export default router;
