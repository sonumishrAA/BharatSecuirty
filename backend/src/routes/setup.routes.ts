import { Router } from 'express';
import { runMigrations } from '../scripts/run-migrations.js';
import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

const router = Router();

// Secure setup route
router.get('/setup-db-production-789', async (req, res) => {
    try {
        console.log('Starting DB Setup...');

        // 1. Run Migrations manually (reading file content)
        // Since we can't easily run the script file from dist, we'll execute SQL directly here for critical tables

        // Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Posts Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                excerpt TEXT NOT NULL,
                content JSONB DEFAULT '{}',
                editor_json JSONB DEFAULT '{}', 
                cover_image_url TEXT,
                meta_title VARCHAR(255),
                meta_description TEXT,
                category VARCHAR(50) NOT NULL DEFAULT 'blog',
                status VARCHAR(20) NOT NULL DEFAULT 'draft',
                author_name VARCHAR(100),
                author_bio TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Check/Create Admin
        const email = 'admin@bharatsecurity.org';
        const hashedPassword = await bcrypt.hash('Bh@r@tS3cur1ty#2024!', 12);

        await pool.query(`
            INSERT INTO users (email, password_hash, role)
            VALUES ($1, $2, 'admin')
            ON CONFLICT (email) DO UPDATE 
            SET password_hash = $2;
        `, [email, hashedPassword]);

        res.json({ message: 'Database setup complete! Admin user created/reset.' });
    } catch (error: any) {
        console.error('Setup failed:', error);
        res.status(500).json({ error: error.message });
    }
});

export const setupRoutes = router;
