require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_ADDON_HOST,
            user: process.env.MYSQL_ADDON_USER,
            password: process.env.MYSQL_ADDON_PASSWORD,
            database: process.env.MYSQL_ADDON_DB,
            ssl: { rejectUnauthorized: false }
        });

        console.log('Connected to database');

        const schemaSQL = await fs.readFile(
            path.join(__dirname, 'init-db.sql'),
            'utf8'
        );

        const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
                console.log('Executed:', statement.trim().split('\n')[0]);
            }
        }

        console.log('Database initialization complete');
        await connection.end();

    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase();