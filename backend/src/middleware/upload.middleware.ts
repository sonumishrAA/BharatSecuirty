import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Ensure upload directories exist
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const coversDir = path.join(uploadDir, 'covers');
const filesDir = path.join(uploadDir, 'files');

[uploadDir, coversDir, filesDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * Multer Storage Configuration
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isImage = file.mimetype.startsWith('image/');
        const dest = isImage ? coversDir : filesDir;
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    },
});

/**
 * File Filter
 */
const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const allowedFileTypes = [
        'application/pdf',
        'application/zip',
        'application/x-rar-compressed',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ...allowedImageTypes,
    ];

    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed'));
    }
};

/**
 * Multer Upload Instance
 */
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    },
});

/**
 * Get public URL for uploaded file
 */
export function getFileUrl(filename: string, type: 'covers' | 'files'): string {
    const baseUrl = process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${type}/${filename}`;
}

export default { upload, getFileUrl };
