
import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function createFinalUsers() {
    console.log('🔄 Creating Final Users...');

    const users = [
        {
            email: 'admin@bharatsecurity.com',
            password: 'BharatAdmin@123',
            role: 'admin',
            label: '🔴 ADMIN (Net-Admin)'
        },
        {
            email: 'org@bharatsecurity.com',
            password: 'BharatOrg@123',
            role: 'user',
            label: '🟢 ORG USER (Blog/User Portal)'
        }
    ];

    try {
        for (const u of users) {
            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(u.password, salt);

            const check = await pool.query('SELECT * FROM users WHERE email = $1', [u.email]);

            if (check.rows.length > 0) {
                await pool.query('UPDATE users SET password_hash = $1, role = $2 WHERE email = $3', [hashedPassword, u.role, u.email]);
                console.log(`✅ Updated ${u.label}: ${u.email}`);
            } else {
                await pool.query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)', [u.email, hashedPassword, u.role]);
                console.log(`✅ Created ${u.label}: ${u.email}`);
            }
        }

    } catch (err) {
        console.error('❌ Error creating users:', err);
    } finally {
        await pool.end();
    }
}

createFinalUsers();
