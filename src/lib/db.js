import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let dbInstance = null;

async function getDB() {
  if (!dbInstance) {
    dbInstance = await open({
      // Save it at project root (or inside src) so github pushes it
      filename: path.resolve(process.cwd(), 'shadowos.sqlite'),
      driver: sqlite3.Database
    });

    console.log("SQLite: Connected!");

    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        vfs_data TEXT,
        used_storage INTEGER DEFAULT 0,
        quota INTEGER DEFAULT 5368709120,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("SQLite: Database initialized");
  }
  return dbInstance;
}

// Mimic mysql2 pool.execute
const pool = {
  async execute(sql, params = []) {
    const db = await getDB();
    
    // Convert named parameter syntax or ? to match if needed, but sqlite supports ?
    // Check if SELECT to return rows
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      const rows = await db.all(sql, params);
      return [rows]; // mimicking mysql2 [rows, fields]
    } else {
      const result = await db.run(sql, params);
      // add insertId mapping to match mysql2
      result.insertId = result.lastID;
      return [result]; // [result]
    }
  },
  async getConnection() {
    return {
      execute: this.execute.bind(this),
      release: () => {}
    };
  }
};

// Auto-init connection
getDB().catch(console.error);

export default pool;
