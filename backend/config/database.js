const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.MYSQL_ADDON_HOST || process.env.DB_HOST,
    user: process.env.MYSQL_ADDON_USER || process.env.DB_USER,
    password: process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQL_ADDON_DB || process.env.DB_NAME,
    port: process.env.MYSQL_ADDON_PORT || 3306,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

async function testConnection() {
    try {
        await promisePool.query('SELECT 1');
        console.log('MySQL connection established');
        
        if (!process.env.MYSQL_ADDON_DB) {
            await promisePool.query('CREATE DATABASE IF NOT EXISTS tech_blog');
            await promisePool.query('USE tech_blog');
            console.log('Using database: tech_blog');
        } else {
            console.log(`Using Clever Cloud database: ${process.env.MYSQL_ADDON_DB}`);
        }
    } catch (err) {
        console.error('Database connection error:', {
            message: err.message,
            code: err.code,
            errno: err.errno,
            host: process.env.MYSQL_ADDON_HOST || process.env.DB_HOST,
            database: process.env.MYSQL_ADDON_DB || process.env.DB_NAME
        });
        throw new Error('Failed to connect to database');
    }
}

testConnection();

module.exports = promisePool;