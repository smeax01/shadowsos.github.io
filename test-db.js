import mysql from 'mysql2/promise';

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'shadowos_user',
      password: 'dZ4rLdPw47?!mmlb',
      database: 'shadowos4_db'
    });
    console.log("SUCCESS: Connected to database");
    try {
      const [rows] = await conn.execute("SHOW TABLES;");
      console.log("TABLES:", rows);
    } catch (e) {
      console.log("TABLES query failed, maybe db doesn't exist?", e.message);
    }
    await conn.end();
  } catch (err) {
    console.error("FAILURE:", err.message);
  }
}
test();
