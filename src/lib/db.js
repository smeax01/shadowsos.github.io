import mysql from 'mysql2/promise';

const rawHost = process.env.DB_HOST || '127.0.0.1';
const [hostFromEnv, portFromHost] = rawHost.split(':');

const pool = mysql.createPool({
  host: hostFromEnv,
  port: Number(process.env.DB_PORT || portFromHost || 3306),
  user: process.env.DB_USER || 'shadowos_user',
  password: process.env.DB_PASSWORD || 'dZ4rLdPw47?!mmlb',
  database: process.env.DB_NAME || 'shadowos4_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  try {
    const conn = await pool.getConnection();
    console.log("MySQL: Connected!");

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        vfs_data LONGTEXT,
        used_storage BIGINT DEFAULT 0,
        quota BIGINT DEFAULT 5368709120, -- 5GB default
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    conn.release();
    console.log("MySQL: Database initialized");
  } catch (err) {
    console.error("MySQL Error:", err.message);
  }
}

initDB();

export default pool;
