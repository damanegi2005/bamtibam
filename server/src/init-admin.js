import pool from './db.js'
import bcrypt from 'bcryptjs'

// admin123의 bcrypt 해시 (cost 10)
const ADMIN_PASSWORD_HASH = '$2b$10$rQY5qZQ5qZQ5qZQ5qZQ5qu5qZQ5qZQ5qZQ5qZQ5qZQ5qZQ5qZQ5qZQ5q'

async function initAdmin() {
  try {
    // Check if admin exists
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@devshop.com']
    )
    
    if (users.length === 0) {
      // Create admin user with admin123 password
      const passwordHash = await bcrypt.hash('admin123', 10)
      await pool.execute(
        'INSERT INTO users (name, email, password_hash, role, is_admin) VALUES (?, ?, ?, ?, ?)',
        ['관리자', 'admin@devshop.com', passwordHash, 'admin', 1]
      )
      console.log('✅ 관리자 계정 생성 완료: admin@devshop.com / admin123')
    } else {
      // Update admin password to admin123
      const passwordHash = await bcrypt.hash('admin123', 10)
      await pool.execute(
        'UPDATE users SET password_hash = ?, role = ?, is_admin = 1 WHERE email = ?',
        [passwordHash, 'admin', 'admin@devshop.com']
      )
      console.log('✅ 관리자 계정 비밀번호 업데이트 완료: admin123')
    }
  } catch (err) {
    console.error('❌ 관리자 계정 초기화 실패:', err.message)
  }
}

initAdmin().then(() => {
  process.exit(0)
})





