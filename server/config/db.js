const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.MYSQLHOST     || process.env.DB_HOST,
  user:     process.env.MYSQLUSER     || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASS,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  port:     process.env.DB_PORT       || process.env.MYSQLPORT || 3306,
});

module.exports = pool.promise();
