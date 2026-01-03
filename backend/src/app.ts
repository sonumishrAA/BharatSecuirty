import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { testConnection } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import postsRoutes from './routes/posts.routes.js';
import mediaRoutes from './routes/media.routes.js';
import contentRoutes from './routes/content.routes.js';
import { businessRoutes } from './routes/business.routes.js';
import clientRoutes from './routes/client.routes.js';
import { systemRoutes } from './routes/system.routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware
 */
const defaultOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    'http://localhost:4204', // org-blog
    'http://localhost:4203', // org-blog app
    'http://localhost:4201', // admin panel
    'http://localhost:4202', // client portal (net-user)
    'http://localhost:50629',
    'http://127.0.0.1:5500', // Common implementation for Live Server
    'http://localhost:5500'
];

const envOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];

app.use(cors({
    origin: [...defaultOrigins, ...envOrigins],
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * Static files (uploads)
 */
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin/system', systemRoutes);
app.use('/api', contentRoutes);

/**
 * Health check
 */
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

/**
 * 404 Handler
 */
app.use((_req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found',
    });
});

/**
 * Error Handler
 */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

/**
 * Start Server
 */
async function start() {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.error('❌ Failed to connect to database. Exiting...');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════╗
║  🚀 CMS Engine Backend                        ║
║  ─────────────────────────────────────────────║
║  Port:     ${PORT}                              ║
║  Mode:     ${process.env.NODE_ENV || 'development'}                    ║
║  API:      http://localhost:${PORT}/api         ║
╚═══════════════════════════════════════════════╝
    `);
    });
}

start();
