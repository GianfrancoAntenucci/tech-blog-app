require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabase() {
    try {
        console.log('Connecting to Clever Cloud database...');
        
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_ADDON_HOST,
            user: process.env.MYSQL_ADDON_USER,
            password: process.env.MYSQL_ADDON_PASSWORD,
            database: process.env.MYSQL_ADDON_DB,
            ssl: {
                rejectUnauthorized: false
            }
        });

        // Test connection
        const [result] = await connection.query('SELECT 1');
        console.log('Database connection successful!');

        // Check tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log('\nExisting tables:');
        tables.forEach(table => {
            console.log(`- ${Object.values(table)[0]}`);
        });

        // Close connection
        await connection.end();
    } catch (error) {
        console.error('Database check failed:', {
            message: error.message,
            code: error.code,
            errno: error.errno
        });
        process.exit(1);
    }
}

checkDatabase();