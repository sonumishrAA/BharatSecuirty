import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://bharatsec_user:YB52hy7bk8iSiO07ZYAeTpcmcOBAiM7M@dpg-d5plh8shg0os739lk3gg-a.singapore-postgres.render.com:5432/bharatsecurity?ssl=true';

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkDb() {
    try {
        console.log('Connecting to Render DB...');

        // Check tables
        const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('\n📊 Tables found:', tables.rows.map(r => r.table_name));

        if (tables.rows.find(r => r.table_name === 'posts')) {
            const posts = await pool.query('SELECT count(*) FROM posts');
            console.log('📝 Total Posts:', posts.rows[0].count);

            const published = await pool.query("SELECT count(*) FROM posts WHERE status = 'published'");
            console.log('✅ Published Posts:', published.rows[0].count);
        } else {
            console.log('❌ "posts" table does NOT exist yet (Migrations needed)');
        }

        if (tables.rows.find(r => r.table_name === 'users')) {
            const users = await pool.query('SELECT email, role FROM users');
            console.log('\nbust👥 Users found:', users.rows);
        }

    } catch (err) {
        console.error('Error connecting:', err);
    } finally {
        await pool.end();
    }
}

checkDb();
