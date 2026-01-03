import fs from 'fs';
import path from 'path';
import { query } from '../config/database.js';

async function runMigrations() {
    console.log('Running migrations...');
    const migrationsDir = path.join(process.cwd(), 'migrations');

    // Create migrations table if not exists
    await query(`
        CREATE TABLE IF NOT EXISTS migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Retroactively mark 001 as done if it exists in the system but not in definitions (hack for this env)
    // Actually simpler: just check if 'users' table exists. If so, mark 001 as done.
    const userTableCheck = await query("SELECT to_regclass('public.users')");
    if (userTableCheck.rows[0].to_regclass) {
        const check001 = await query("SELECT * FROM migrations WHERE name = '001_initial_schema.sql'");
        if (check001.rowCount === 0) {
            console.log("Existing DB detected. Marking 001_initial_schema.sql as already applied.");
            await query("INSERT INTO migrations (name) VALUES ('001_initial_schema.sql')");
        }
    }

    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
        if (!file.endsWith('.sql')) continue;

        const check = await query('SELECT * FROM migrations WHERE name = $1', [file]);
        if (check.rowCount > 0) {
            console.log(`Skipping ${file} (already run)`);
            continue;
        }

        console.log(`Running ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        try {
            await query('BEGIN');
            await query(sql);
            await query('INSERT INTO migrations (name) VALUES ($1)', [file]);
            await query('COMMIT');
            console.log(`Completed ${file}`);
        } catch (err) {
            await query('ROLLBACK');
            console.error(`Error running ${file}:`, err);
            process.exit(1);
        }
    }
    console.log('All migrations done.');
}

runMigrations().catch(console.error);
