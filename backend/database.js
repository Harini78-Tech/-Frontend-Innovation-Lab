const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'harini@2002#$',
  database: process.env.DB_NAME || 'expense_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function connectDB() {
  try {
    console.log('🔄 Connecting to MySQL...');
    // Connect without database to ensure it exists
    const tmpConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await tmpConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log('✅ Database verified/created');
    await tmpConn.end();

    // Create pool that uses the database
    pool = mysql.createPool(dbConfig);

    // Initialize tables
    await initializeDatabase();
    console.log('✅ MySQL connected and tables ready');
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    throw error;
  }
}

async function initializeDatabase() {
  const connection = await pool.getConnection();

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category ENUM('food','transport','entertainment','shopping','bills','other') NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS incomes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      source VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  connection.release();
  console.log('✅ Tables initialized');
}

const dbHelpers = {
  all: async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },
  get: async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return rows[0] || null;
  },
  run: async (sql, params = []) => {
    const [result] = await pool.execute(sql, params);
    return result;
  },
};

module.exports = { connectDB, dbHelpers };
