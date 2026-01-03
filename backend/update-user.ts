
import { query } from './src/config/database';

async function update() {
    try {
        const email = 'sonuraj1abcd@gmail.com';
        await query('UPDATE users SET must_change_password = false WHERE email = $1', [email]);
        console.log(`Cleared must_change_password for ${email}`);
        process.exit(0);
    } catch (e) {
        console.error('Update failed:', e);
        process.exit(1);
    }
}

update();
