
import { query } from './src/config/database';

async function check() {
    try {
        console.log('Fetching users...');
        const res = await query('SELECT id, email, role FROM users');
        console.table(res.rows);
        process.exit(0);
    } catch (e) {
        console.error('Query failed:', e);
        process.exit(1);
    }
}

check();
