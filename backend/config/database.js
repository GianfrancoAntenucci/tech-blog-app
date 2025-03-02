const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1', // Use explicit IPv4 instead of localhost
    user: 'root',
    password: 'ola',
    database: 'tech_blog',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

testConnection();

module.exports = pool;