import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

/**
 * Media Routes
 * ------------
 * GET    /api/media         - List all media (admin)
 * GET    /api/media/covers  - List cover images (admin)
 * GET    /api/media/files   - List uploaded files (admin)
 * POST   /api/media/upload  - Upload file (admin)
 * DELETE /api/media/:type/:filename - Delete file (admin)
 */

// All routes require admin authentication
router.use(authMiddleware, adminMiddleware);

router.get('/', (req, res) => mediaController.getAll(req, res));
router.get('/covers', (req, res) => mediaController.getCovers(req, res));
router.get('/files', (req, res) => mediaController.getFiles(req, res));
router.post('/upload', upload.single('file'), (req, res) => mediaController.upload(req, res));
router.delete('/:type/:filename', (req, res) => mediaController.delete(req, res));

export default router;
