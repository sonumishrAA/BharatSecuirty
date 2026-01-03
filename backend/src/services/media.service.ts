import fs from 'fs';
import path from 'path';
import { getFileUrl } from '../middleware/upload.middleware.js';

export interface MediaFile {
    name: string;
    url: string;
    type: 'image' | 'file';
    size?: number;
}

/**
 * Media Service
 * Handles file management operations
 */
export class MediaService {
    private uploadDir: string;
    private coversDir: string;
    private filesDir: string;

    constructor() {
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
        this.coversDir = path.join(this.uploadDir, 'covers');
        this.filesDir = path.join(this.uploadDir, 'files');
    }

    /**
     * List all cover images
     */
    async listCovers(): Promise<MediaFile[]> {
        return this.listDirectory(this.coversDir, 'covers', 'image');
    }

    /**
     * List all uploaded files
     */
    async listFiles(): Promise<MediaFile[]> {
        return this.listDirectory(this.filesDir, 'files', 'file');
    }

    /**
     * List all media (covers + files)
     */
    async listAll(): Promise<{ covers: MediaFile[]; files: MediaFile[] }> {
        const [covers, files] = await Promise.all([
            this.listCovers(),
            this.listFiles(),
        ]);
        return { covers, files };
    }

    /**
     * Delete a file
     */
    async deleteFile(filename: string, type: 'covers' | 'files'): Promise<boolean> {
        const dir = type === 'covers' ? this.coversDir : this.filesDir;
        const filepath = path.join(dir, filename);

        try {
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }

    /**
     * Helper to list files in a directory
     */
    private async listDirectory(
        dir: string,
        type: 'covers' | 'files',
        fileType: 'image' | 'file'
    ): Promise<MediaFile[]> {
        if (!fs.existsSync(dir)) {
            return [];
        }

        const files = fs.readdirSync(dir);
        return files.map((name) => {
            const filepath = path.join(dir, name);
            const stats = fs.statSync(filepath);

            return {
                name,
                url: getFileUrl(name, type),
                type: fileType,
                size: stats.size,
            };
        });
    }
}

export const mediaService = new MediaService();
