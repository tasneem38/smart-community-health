const { pool } = require('./db');
const fs = require('fs');
const path = require('path');

async function initDB() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema...');
        await pool.query(schema);
        console.log('Database initialized successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to initialize DB:', err);
        process.exit(1);
    }
}

initDB();
