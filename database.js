const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'online_diary',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based pool
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err.message);
    console.error('Please ensure:');
    console.error('1. MySQL server is running');
    console.error('2. Database "online_diary" exists');
    console.error('3. Credentials in .env are correct');
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL database successfully');
    connection.release();
  }
});

module.exports = pool;
module.exports.promisePool = promisePool;
