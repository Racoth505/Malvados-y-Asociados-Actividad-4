const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Racoth6534-',
  database: 'stocko'
});

module.exports = db;
