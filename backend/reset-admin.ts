import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function resetAdmin() {
    const email = 'admin@bharatsecurity.net';
    const newPassword = 'Bharat@2026';

    console.log(`Resetting password for ${email}...`);

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        const checkRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (checkRes.rows.length === 0) {
            console.log('User not found. Creating new admin user...');
            await pool.query(
                'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
                [email, hash, 'admin']
            );
        } else {
            console.log('User found. Updating password...');
            await pool.query(
                'UPDATE users SET password_hash = $1 WHERE email = $2',
                [hash, email]
            );
        }

        console.log('✅ Password reset successfully!');
        console.log('Email: admin@bharatsecurity.org');
        console.log('Password: admin123');

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

resetAdmin();
