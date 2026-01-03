
import bcrypt from 'bcryptjs';
import { query } from './src/config/database';

async function reset() {
    try {
        const email = 'sonuraj1abcd@gmail.com';
        const newPassword = 'password123';
        const hash = await bcrypt.hash(newPassword, 12);

        await query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);
        console.log(`Password for ${email} reset to ${newPassword}`);
        process.exit(0);
    } catch (e) {
        console.error('Reset failed:', e);
        process.exit(1);
    }
}

reset();
