import pg from 'pg';
const { Pool } = pg;

// Production DB Connection String
const connectionString = 'postgresql://bharatsec_user:YB52hy7bk8iSiO07ZYAeTpcmcOBAiM7M@dpg-d5plh8shg0os739lk3gg-a.singapore-postgres.render.com:5432/bharatsecurity?ssl=true';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function fixUrls() {
    try {
        console.log('🔗 Connecting to Render DB to fix URLs...');

        // 1. Fix Cover Images in Posts table
        const updatePosts = await pool.query(`
      UPDATE posts 
      SET cover_image_url = REPLACE(cover_image_url, 'http://localhost:3000', 'https://bharatsecuirty-2o2g.onrender.com')
      WHERE cover_image_url LIKE 'http://localhost:3000%';
    `);
        console.log(`✅ Updated ${updatePosts.rowCount} post cover images.`);

        // 2. Fix JSON Content (Images inside blog body)
        const updateContent = await pool.query(`
        UPDATE posts
        SET content = (REPLACE(content::text, 'http://localhost:3000', 'https://bharatsecuirty-2o2g.onrender.com'))::jsonb
        WHERE content::text LIKE '%http://localhost:3000%';
    `);
        console.log(`✅ Updated ${updateContent.rowCount} posts content JSON.`);

        // 3. Fix Editor JSON (Canvas images)
        const updateEditor = await pool.query(`
        UPDATE posts
        SET editor_json = (REPLACE(editor_json::text, 'http://localhost:3000', 'https://bharatsecuirty-2o2g.onrender.com'))::jsonb
        WHERE editor_json::text LIKE '%http://localhost:3000%';
    `);
        console.log(`✅ Updated ${updateEditor.rowCount} posts editor JSON.`);

        // 4. Fix Media Files Table
        // Check if table exists first to avoid crashing
        const tableCheck = await pool.query(`SELECT to_regclass('public.media_files')`);
        if (tableCheck.rows[0].to_regclass) {
            const updateMedia = await pool.query(`
            UPDATE media_files
            SET url = REPLACE(url, 'http://localhost:3000', 'https://bharatsecuirty-2o2g.onrender.com')
            WHERE url LIKE 'http://localhost:3000%';
        `);
            console.log(`✅ Updated ${updateMedia.rowCount} media files.`);
        } else {
            console.log('⚠️ media_files table not found, skipping.');
        }

        console.log('\n🎉 URL Fix Complete!');

    } catch (err) {
        console.error('❌ Error fixing URLs:', err);
    } finally {
        await pool.end();
    }
}

fixUrls();
