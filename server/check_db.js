const { pool } = require('./db');
async function checkSchema() {
    try {
        const res = await pool.query("SELECT * FROM assistance_requests LIMIT 5");
        console.log("Rows in assistance_requests:", JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkSchema();
