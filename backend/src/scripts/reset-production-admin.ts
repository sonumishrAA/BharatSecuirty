/**
 * Reset Production Admin Password
 * Run this script to set a strong admin password for production
 * 
 * Usage: npx tsx src/scripts/reset-production-admin.ts
 */

import bcrypt from 'bcryptjs';
import { query, pool } from '../config/database.js';

async function resetProductionAdmin() {
    console.log('🔐 Resetting Production Admin Password...\n');

    const email = 'admin@bharatsecurity.org';
    const newPassword = 'Bh@r@tS3cur1ty#2024!'; // STRONG password - change this!

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Check if user exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            // Update existing user
            await query(
                'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
                [hashedPassword, email]
            );
            console.log('✅ Admin password UPDATED successfully!\n');
        } else {
            // Create new admin user
            await query(
                `INSERT INTO users (email, password_hash, role) 
                 VALUES ($1, $2, 'admin')`,
                [email, hashedPassword]
            );
            console.log('✅ Admin user CREATED successfully!\n');
        }

        console.log('📧 Email:', email);
        console.log('🔑 Password:', newPassword);
        console.log('\n⚠️  IMPORTANT: Change this password after first login!');
        console.log('⚠️  Store credentials securely and delete this script from production.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

resetProductionAdmin();
