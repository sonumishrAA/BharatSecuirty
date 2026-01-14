
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function fixBlogImages() {
    try {
        console.log('🖼️  Fixing Blog Images...');

        const postsRes = await pool.query('SELECT id, title, cover_image_url FROM posts');

        for (const post of postsRes.rows) {
            let newImage = null;

            if (post.title.includes('Welcome')) {
                newImage = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800';
            } else if (post.title.includes('OSINT')) {
                newImage = 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800';
            }

            if (newImage) {
                await pool.query('UPDATE posts SET cover_image_url = $1 WHERE id = $2', [newImage, post.id]);
                console.log(`✅ Updated image for: ${post.title}`);
            }
        }
        console.log('✨ Blog images updated.');

    } catch (error) {
        console.error('❌ Fix Failed:', error);
    } finally {
        await pool.end();
    }
}

fixBlogImages();
