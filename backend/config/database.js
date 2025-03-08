const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    port: process.env.MYSQL_ADDON_PORT || 3306,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    authPlugins: {
        mysql_native_password: () => () => Buffer.from(process.env.MYSQL_ADDON_PASSWORD + '\0')
    }
});

const promisePool = pool.promise();

async function testConnection() {
    try {
        await promisePool.query('SELECT 1');
        console.log('MySQL connection established');
        console.log('Connected to Clever Cloud database:', process.env.MYSQL_ADDON_DB);
    } catch (err) {
        console.error('Database connection error:', {
            message: err.message,
            code: err.code,
            errno: err.errno
        });
        throw err;
    }
}

testConnection();

module.exports = promisePool;