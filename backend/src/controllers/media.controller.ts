import { Request, Response } from 'express';
import { mediaService } from '../services/media.service.js';
import { getFileUrl } from '../middleware/upload.middleware.js';

/**
 * Media Controller
 * Handles file upload and management endpoints
 */
export class MediaController {
    /**
     * POST /api/media/upload
     */
    async upload(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'No file uploaded',
                });
                return;
            }

            const isImage = req.file.mimetype.startsWith('image/');
            const type = isImage ? 'covers' : 'files';
            const url = getFileUrl(req.file.filename, type);

            res.status(201).json({
                name: req.file.originalname,
                filename: req.file.filename,
                url,
                type: isImage ? 'image' : 'file',
                size: req.file.size,
                mimetype: req.file.mimetype,
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to upload file',
            });
        }
    }

    /**
     * GET /api/media
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const media = await mediaService.listAll();
            res.json(media);
        } catch (error) {
            console.error('Get media error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to fetch media',
            });
        }
    }

    /**
     * GET /api/media/covers
     */
    async getCovers(req: Request, res: Response): Promise<void> {
        try {
            const covers = await mediaService.listCovers();
            res.json(covers);
        } catch (error) {
            console.error('Get covers error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to fetch covers',
            });
        }
    }

    /**
     * GET /api/media/files
     */
    async getFiles(req: Request, res: Response): Promise<void> {
        try {
            const files = await mediaService.listFiles();
            res.json(files);
        } catch (error) {
            console.error('Get files error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to fetch files',
            });
        }
    }

    /**
     * DELETE /api/media/:type/:filename
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const { type, filename } = req.params;

            if (type !== 'covers' && type !== 'files') {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid type. Use "covers" or "files"',
                });
                return;
            }

            const deleted = await mediaService.deleteFile(filename, type);

            if (!deleted) {
                res.status(404).json({
                    error: 'Not Found',
                    message: 'File not found',
                });
                return;
            }

            res.json({ message: 'File deleted successfully' });
        } catch (error) {
            console.error('Delete media error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to delete file',
            });
        }
    }
}

export const mediaController = new MediaController();
