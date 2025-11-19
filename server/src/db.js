// db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+09:00",
  charset: "utf8mb4"
});

pool.on("connection", (conn) => {
  conn.query("SET time_zone = '+09:00'");
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log(`✅ MySQL 연결 성공 (${process.env.DB_HOST})`);
    conn.release();
  } catch (err) {
    console.error("❌ MySQL 연결 실패:", err.message);
  }
})();

export default pool;
