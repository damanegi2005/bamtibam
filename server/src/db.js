import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL || 'mysql://bamtibam:bamtibam@localhost:3307/bamtibam'

// Parse DATABASE_URL
function parseDatabaseUrl(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  if (!match) {
    throw new Error('Invalid DATABASE_URL format')
  }
  return {
    host: match[3],
    port: parseInt(match[4]),
    user: match[1],
    password: match[2],
    database: match[5],
    charset: 'utf8mb4'
  }
}

const config = parseDatabaseUrl(DATABASE_URL)

// Create connection pool
const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+09:00' // 한국 시간대 설정
})

// 연결 시 timezone 설정
pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+09:00'")
})

// Test connection
pool.getConnection()
  .then(connection => {
    console.log(`✅ MySQL 연결 성공 → ${config.host}:${config.port}/${config.database}`)
    connection.release()
  })
  .catch(err => {
    console.error('❌ MySQL 연결 실패:', err.message)
    console.error('DATABASE_URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'))
  })

export default pool

