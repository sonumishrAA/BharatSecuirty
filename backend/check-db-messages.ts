
import { query } from './src/config/database.js';

async function checkMessages() {
    try {
        console.log('Checking messages in DB...');
        const result = await query('SELECT * FROM booking_messages ORDER BY created_at DESC LIMIT 5');
        console.log('Messages found:', result.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkMessages();
