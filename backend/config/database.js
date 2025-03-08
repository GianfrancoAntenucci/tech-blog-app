const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'ola',
    database: 'tech_blog',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    port: 3306,
    socketPath: '/tmp/mysql.sock'
});

const promisePool = pool.promise();

async function testConnection() {
    try {
        await promisePool.query('SELECT 1');
        console.log('MySQL connection established');
        
        await promisePool.query('CREATE DATABASE IF NOT EXISTS tech_blog');
        await promisePool.query('USE tech_blog');
        console.log('Using database: tech_blog');
    } catch (err) {
        console.error('Database connection error:', {
            message: err.message,
            code: err.code,
            errno: err.errno
        });
    }
}

testConnection();

module.exports = promisePool;