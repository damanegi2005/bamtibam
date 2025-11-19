// db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// DATABASE_URL 읽기
const DATABASE_URL = process.env.DATABASE_URL;

// mysql://user:pass@host:port/db  파싱 함수
function parseDatabaseUrl(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error("Invalid DATABASE_URL format");
  }
  return {
    host: match[3],
    port: parseInt(match[4]),
    user: match[1],
    password: match[2],
    database: match[5],
    charset: "utf8mb4"
  };
}

const config = parseDatabaseUrl(DATABASE_URL);

// Connection pool 생성
const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+09:00"
});

// 연결 시 timezone 설정
pool.on("connection", (connection) => {
  connection.query("SET time_zone = '+09:00'");
});

// 연결 테스트
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log(`✅ MySQL 연결 성공 → ${config.host}:${config.port}/${config.database}`);
    conn.release();
  } catch (err) {
    console.error("❌ MySQL 연결 실패:", err.message);
  }
})();

export default pool;
