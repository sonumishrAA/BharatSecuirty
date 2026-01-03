
import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

async function resetAdmin() {
    console.log('🔄 Resetting Admin Password...');

    const email = 'admin@bharatsecurity.org';
    const password = 'admin123';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        // Check if user exists
        const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (check.rows.length > 0) {
            await pool.query('UPDATE users SET password_hash = $1, role = $2 WHERE email = $3', [hashedPassword, 'admin', email]);
            console.log('✅ Admin password updated successfully!');
        } else {
            await pool.query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)', [email, hashedPassword, 'admin']);
            console.log('✅ Admin user created successfully!');
        }
    } catch (err) {
        console.error('❌ Error resetting password:', err);
    } finally {
        await pool.end();
    }
}

resetAdmin();
