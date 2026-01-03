
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'cms_engine',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
});

async function checkOrgData() {
    console.log('🔌 Connecting to database...');
    try {
        const client = await pool.connect();

        // Count posts by category
        const res = await client.query(`
            SELECT category, COUNT(*) as count 
            FROM posts 
            GROUP BY category 
            ORDER BY count DESC
        `);

        console.log('\n📊 Database Summary (Org Blog Content):');
        console.log('----------------------------------------');
        if (res.rows.length === 0) {
            console.log('No posts found.');
        } else {
            res.rows.forEach(row => {
                console.log(`- ${row.category}: ${row.count} posts`);
            });
        }
        console.log('----------------------------------------');

        // Show a few examples
        const examples = await client.query('SELECT title, category FROM posts LIMIT 5');
        console.log('\n📝 Recent Examples:');
        examples.rows.forEach(r => {
            console.log(`[${r.category}] ${r.title}`);
        });

        client.release();
    } catch (err) {
        console.error('❌ Error checking DB:', err);
    } finally {
        await pool.end();
    }
}

checkOrgData();
