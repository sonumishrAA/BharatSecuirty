
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

async function clearNetData() {
    console.log('🔌 Connecting to database...');
    try {
        const client = await pool.connect();

        // 1. Check existing categories to confirm what we are dealing with
        const catRes = await client.query('SELECT DISTINCT category FROM posts');
        console.log('📊 Current Categories:', catRes.rows.map(r => r.category));

        // 2. Delete .net specific categories
        // We identified 'case_studies' as the key .net category.
        // Also check if there are others that might be .net related (e.g. 'service', 'client' if they were dynamic)

        const targetCategories = ['case_studies', 'service', 'client', 'technology'];

        console.log(`🗑️  Deleting posts with categories: ${targetCategories.join(', ')}`);

        const deleteRes = await client.query(
            'DELETE FROM posts WHERE category = ANY($1)',
            [targetCategories]
        );

        console.log(`✅ Deleted ${deleteRes.rowCount} rows.`);

        client.release();
    } catch (err) {
        console.error('❌ Error clearing DB:', err);
    } finally {
        await pool.end();
    }
}

clearNetData();
