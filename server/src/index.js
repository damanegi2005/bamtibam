import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
<<<<<<< HEAD
import pool from './db.js'

dotenv.config()

=======
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import pool from './db.js'
import {
  validateSignupPayload,
  passwordPolicyText,
  normalizeEmail,
  validateEmail
} from './validators.js'

dotenv.config()

const ADMIN_ROLE = 'admin'
const CUSTOMER_ROLE = 'customer'

>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
const app = express()
const PORT = process.env.PORT || 4000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000'
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret_change_me'
<<<<<<< HEAD

app.use(morgan('dev'))
app.use(express.json())
=======
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12)

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: '잠시 후 다시 시도해 주세요.' }
})

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
)
app.use(morgan('dev'))
app.use(express.json({ limit: '1mb' }))
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
<<<<<<< HEAD

function generateToken(user) {
  const role = user.is_admin === 1 || user.role === 'admin' ? 'admin' : 'user'
=======
app.use(['/auth/login', '/auth/signup'], authLimiter)

function resolveRole(user) {
  return user.is_admin === 1 || user.role === ADMIN_ROLE ? ADMIN_ROLE : CUSTOMER_ROLE
}

function generateToken(user) {
  const role = resolveRole(user)
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
  return jwt.sign(
    { sub: user.id, email: user.email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const [users] = await pool.execute(
      'SELECT id, name, email, role, is_admin, is_blocked FROM users WHERE id = ?',
      [payload.sub]
    )
    if (users.length === 0) return res.status(401).json({ message: 'Invalid token' })
    const user = users[0]
    if (user.is_blocked === 1) return res.status(403).json({ message: 'Blocked user' })
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
<<<<<<< HEAD
  const isAdmin = req.user.is_admin === 1 || req.user.role === 'admin'
=======
  const isAdmin = resolveRole(req.user) === ADMIN_ROLE
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
  if (!isAdmin) return res.status(403).json({ message: 'Forbidden' })
  next()
}

<<<<<<< HEAD
// Auth
app.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, password are required' })
  }
  try {
    console.log('↪️ /auth/signup 요청:', { name, email })
    // Check if user exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    )
    if (existing.length > 0) {
      console.log('⚠️ 이미 존재하는 이메일:', email.toLowerCase())
      return res.status(409).json({ message: 'User already exists' })
    }
    
    const passwordHash = await bcrypt.hash(password, 10)
    const isAdmin = req.body.isAdmin === true ? 1 : 0
    const role = isAdmin ? 'admin' : 'customer'
    
=======
async function updateUserBlockStatus(userId, isBlocked) {
  await pool.execute('UPDATE users SET is_blocked = ? WHERE id = ?', [isBlocked ? 1 : 0, userId])
}

async function setUserBlock(userId, isBlocked) {
  await ensureUserExists(userId)
  await updateUserBlockStatus(userId, isBlocked)
  return { id: userId, is_blocked: isBlocked ? 1 : 0 }
}

async function ensureUserExists(userId) {
  const [users] = await pool.execute(
    'SELECT id, name, email, role, is_admin, is_blocked FROM users WHERE id = ?',
    [userId]
  )
  if (users.length === 0) {
    throw Object.assign(new Error('User not found'), { status: 404 })
  }
  return users[0]
}

async function assertLastAdminRemains(targetUserId) {
  const [[{ admin_count }]] = await pool.query(
    'SELECT COUNT(*) AS admin_count FROM users WHERE is_admin = 1'
  )
  if (admin_count <= 1) {
    const target = await ensureUserExists(targetUserId)
    if (target.is_admin === 1) {
      throw Object.assign(
        new Error('최소 1명의 관리자 계정은 유지되어야 합니다.'),
        { status: 400 }
      )
    }
  }
}

// Auth
app.post('/auth/signup', async (req, res) => {
  try {
    const validation = validateSignupPayload(req.body || {})
    if (!validation.ok) {
      return res.status(400).json({ message: validation.message })
    }
    const { name, email, password } = validation.data
    console.log('↪️ /auth/signup 요청:', { name, email })

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      console.log('⚠️ 이미 존재하는 이메일:', email)
      return res.status(409).json({ message: '이미 가입된 이메일입니다.' })
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const role = CUSTOMER_ROLE
    const isAdmin = 0

>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
    let result
    try {
      ;[result] = await pool.execute(
        'INSERT INTO users (name, email, password_hash, role, is_admin) VALUES (?, ?, ?, ?, ?)',
<<<<<<< HEAD
        [name, email.toLowerCase(), passwordHash, role, isAdmin]
      )
    } catch (insertErr) {
      console.error('❌ 사용자 INSERT 실패:', insertErr?.sqlMessage || insertErr?.message || insertErr)
      return res.status(500).json({ message: 'Failed to create user', detail: insertErr?.sqlMessage || insertErr?.message })
    }
    
    console.log('✅ 사용자 생성 완료:', { id: result.insertId, email: email.toLowerCase() })
    return res.status(201).json({
      id: result.insertId,
      name,
      email: email.toLowerCase(),
      role,
      isAdmin: isAdmin === 1
    })
  } catch (err) {
    console.error('Signup error:', err)
    return res.status(500).json({ message: 'Internal server error' })
=======
        [name, email, passwordHash, role, isAdmin]
      )
    } catch (insertErr) {
      console.error('❌ 사용자 INSERT 실패:', insertErr?.sqlMessage || insertErr?.message || insertErr)
      return res.status(500).json({
        message: '회원가입에 실패했습니다.',
        detail: insertErr?.sqlMessage || insertErr?.message
      })
    }

    console.log('✅ 사용자 생성 완료:', { id: result.insertId, email })
    return res.status(201).json({
      id: result.insertId,
      name,
      email,
      role,
      isAdmin: false,
      passwordPolicy: passwordPolicyText
    })
  } catch (err) {
    console.error('Signup error:', err)
    return res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' })
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
  }
})

// Admin: list users
app.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, email, is_admin, is_blocked, created_at 
       FROM users ORDER BY created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    console.error('Admin users error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

<<<<<<< HEAD
// Admin: block/unblock user
app.patch('/users/:id/block', authMiddleware, adminMiddleware, async (req, res) => {
  const userId = Number(req.params.id)
  try {
    await pool.execute(
      'UPDATE users SET is_blocked = 1 WHERE id = ?',
      [userId]
    )
    res.json({ id: userId, is_blocked: 1 })
  } catch (err) {
    console.error('Block user error:', err)
    res.status(500).json({ message: 'Internal server error' })
=======
app.get('/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        p.id,
        p.name,
        p.slug,
        p.price_cents,
        p.is_active,
        p.created_at,
        c.slug AS category,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    console.error('Admin products error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.patch('/admin/products/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const productId = Number(req.params.id)
  if (!Number.isFinite(productId)) return res.status(400).json({ message: 'Invalid product id' })
  const { isActive } = req.body || {}
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'isActive(boolean)을 전달하세요.' })
  }
  try {
    const [result] = await pool.execute(
      'UPDATE products SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, productId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json({ id: productId, is_active: isActive ? 1 : 0 })
  } catch (err) {
    console.error('Admin product status error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.get('/admin/reviews', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        r.id,
        r.product_id,
        p.name AS product_name,
        u.name AS user_name,
        u.email AS user_email,
        r.rating,
        r.content,
        r.is_active,
        r.created_at
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    console.error('Admin reviews error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.delete('/admin/reviews/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const reviewId = Number(req.params.id)
  if (!Number.isFinite(reviewId)) return res.status(400).json({ message: 'Invalid review id' })
  try {
    const [result] = await pool.execute(
      'UPDATE reviews SET is_active = 0 WHERE id = ?',
      [reviewId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found' })
    }
    res.json({ id: reviewId, is_active: 0 })
  } catch (err) {
    console.error('Admin review delete error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.get('/admin/posts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        p.id,
        p.title,
        p.is_active,
        p.created_at,
        u.name AS author_name,
        u.email AS author_email
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    console.error('Admin posts error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.patch('/admin/posts/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const postId = Number(req.params.id)
  if (!Number.isFinite(postId)) return res.status(400).json({ message: 'Invalid post id' })
  const { isActive } = req.body || {}
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'isActive(boolean)을 전달하세요.' })
  }
  try {
    const [result] = await pool.execute(
      'UPDATE posts SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, postId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.json({ id: postId, is_active: isActive ? 1 : 0 })
  } catch (err) {
    console.error('Admin post status error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Admin: block/unblock user
app.patch('/users/:id/block', authMiddleware, adminMiddleware, async (req, res) => {
  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) return res.status(400).json({ message: 'Invalid user id' })
  try {
    const result = await setUserBlock(userId, true)
    res.json(result)
  } catch (err) {
    console.error('Block user error:', err)
    res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' })
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
  }
})

app.patch('/users/:id/unblock', authMiddleware, adminMiddleware, async (req, res) => {
  const userId = Number(req.params.id)
<<<<<<< HEAD
  try {
    await pool.execute(
      'UPDATE users SET is_blocked = 0 WHERE id = ?',
      [userId]
    )
    res.json({ id: userId, is_blocked: 0 })
  } catch (err) {
    console.error('Unblock user error:', err)
    res.status(500).json({ message: 'Internal server error' })
=======
  if (!Number.isFinite(userId)) return res.status(400).json({ message: 'Invalid user id' })
  try {
    const result = await setUserBlock(userId, false)
    res.json(result)
  } catch (err) {
    console.error('Unblock user error:', err)
    res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' })
  }
})

app.patch('/admin/users/:id/block', authMiddleware, adminMiddleware, async (req, res) => {
  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) return res.status(400).json({ message: 'Invalid user id' })
  const desired = req.body?.isBlocked
  if (typeof desired !== 'boolean') {
    return res.status(400).json({ message: 'isBlocked(boolean)을 전달하세요.' })
  }
  try {
    const result = await setUserBlock(userId, desired)
    res.json(result)
  } catch (err) {
    console.error('Admin block toggle error:', err)
    res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' })
  }
})

app.patch('/admin/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  const userId = Number(req.params.id)
  if (!Number.isFinite(userId)) return res.status(400).json({ message: 'Invalid user id' })
  const requestedRole = req.body?.role === ADMIN_ROLE ? ADMIN_ROLE : CUSTOMER_ROLE
  const nextIsAdmin = requestedRole === ADMIN_ROLE ? 1 : 0

  if (userId === req.user.id && nextIsAdmin === 0) {
    return res.status(400).json({ message: '본인 권한은 다른 관리자가 해제해야 합니다.' })
  }

  try {
    if (nextIsAdmin === 0) {
      await assertLastAdminRemains(userId)
    } else {
      await ensureUserExists(userId)
    }

    const [result] = await pool.execute(
      'UPDATE users SET role = ?, is_admin = ? WHERE id = ?',
      [requestedRole, nextIsAdmin, userId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ id: userId, role: requestedRole, is_admin: nextIsAdmin })
  } catch (err) {
    console.error('Admin role update error:', err)
    res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' })
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
  }
})

app.post('/auth/login', async (req, res) => {
<<<<<<< HEAD
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' })
=======
  const email = normalizeEmail(req.body?.email || '')
  const password = (req.body?.password || '').trim()
  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력하세요.' })
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: '올바른 이메일 형식을 입력하세요.' })
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
  }
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, password_hash, role, is_admin, is_blocked FROM users WHERE email = ?',
<<<<<<< HEAD
      [email.toLowerCase()]
=======
      [email]
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
    )
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const user = users[0]
    
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    if (user.is_blocked === 1) {
      return res.status(403).json({ message: 'Blocked user' })
    }
    
<<<<<<< HEAD
    const role = user.is_admin === 1 || user.role === 'admin' ? 'admin' : 'user'
=======
    const role = resolveRole(user)
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
    const token = generateToken(user)
    
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        isAdmin: user.is_admin === 1
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

app.get('/auth/me', authMiddleware, (req, res) => {
  const u = req.user
<<<<<<< HEAD
  const role = u.is_admin === 1 || u.role === 'admin' ? 'admin' : 'user'
=======
  const role = resolveRole(u)
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)
  return res.json({
    id: u.id,
    name: u.name,
    email: u.email,
    role,
    isAdmin: u.is_admin === 1
  })
})

// Products
app.get('/products', async (req, res) => {
  const { category } = req.query
  try {
    let query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price_cents,
        p.is_active,
        c.slug as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `
    const params = []
    
    if (category) {
      query += ' AND c.slug = ?'
      params.push(category)
    }
    
    query += ' ORDER BY p.created_at DESC'
    
    const [products] = await pool.execute(query, params)
    
    // Get images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const [images] = await pool.execute(
          'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1',
          [product.id]
        )
        return {
          ...product,
          image: images.length > 0 ? images[0].image_url : null,
          category: product.category || 'uncategorized'
        }
      })
    )
    
    res.json(productsWithImages)
  } catch (err) {
    console.error('Products error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

app.get('/products/:slug', async (req, res) => {
  const { slug } = req.params
  try {
    const [products] = await pool.execute(
      `SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price_cents,
        p.is_active,
        c.slug as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.is_active = 1`,
      [slug]
    )
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' })
    }
    
    const product = products[0]
    
    // Get images
    const [images] = await pool.execute(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
      [product.id]
    )
    
    res.json({
      ...product,
      images: images.map(img => img.image_url),
      category: product.category || 'uncategorized'
    })
  } catch (err) {
    console.error('Product detail error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Reviews
app.get('/products/:slug/reviews', async (req, res) => {
  const { slug } = req.params
  try {
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE slug = ?',
      [slug]
    )
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' })
    }
    
    const productId = products[0].id
    const [reviews] = await pool.execute(
      `SELECT 
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.content,
        r.created_at,
        u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_active = 1
      ORDER BY r.created_at DESC`,
      [productId]
    )
    
    res.json(reviews)
  } catch (err) {
    console.error('Reviews error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

app.post('/reviews', authMiddleware, async (req, res) => {
  const { productId, rating, content } = req.body || {}
  if (!productId || !rating) {
    return res.status(400).json({ message: 'productId, rating required' })
  }
  try {
    console.log('↪️ /reviews 생성 요청:', { productId, userId: req.user.id })
    // Check if product exists
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ?',
      [productId]
    )
    if (products.length === 0) {
      console.log('⚠️ 리뷰 대상 상품 없음:', productId)
      return res.status(404).json({ message: 'Product not found' })
    }
    
    const finalRating = Math.max(1, Math.min(5, Number(rating)))
    
    let result
    try {
      ;[result] = await pool.execute(
        'INSERT INTO reviews (product_id, user_id, rating, content, is_active) VALUES (?, ?, ?, ?, 1)',
        [productId, req.user.id, finalRating, content || '']
      )
    } catch (insertErr) {
      console.error('❌ 리뷰 INSERT 실패:', insertErr?.sqlMessage || insertErr?.message || insertErr)
      return res.status(500).json({ message: 'Failed to create review', detail: insertErr?.sqlMessage || insertErr?.message })
    }
    
    const [reviews] = await pool.execute(
      'SELECT * FROM reviews WHERE id = ?',
      [result.insertId]
    )
    
    console.log('✅ 리뷰 생성 완료:', { id: result.insertId })
    res.status(201).json(reviews[0])
  } catch (err) {
    console.error('Create review error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Posts
app.get('/posts', async (req, res) => {
  try {
    const [posts] = await pool.execute(
      `SELECT 
        p.id,
        p.user_id,
        p.title,
        p.content,
        p.is_active,
        p.created_at,
        u.name as author_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_active = 1
      ORDER BY p.created_at DESC`
    )
    res.json(posts)
  } catch (err) {
    console.error('Posts error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Ensure required tables exist (minimal auto-migration for dev)
async function ensureSchema() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id BIGINT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id BIGINT NOT NULL AUTO_INCREMENT,
        category_id BIGINT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NULL,
        price_cents INT NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX idx_products_category (category_id),
        INDEX idx_products_active (is_active),
        CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_images (
        id BIGINT NOT NULL AUTO_INCREMENT,
        product_id BIGINT NOT NULL,
        image_url TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX idx_product_images_product (product_id),
        CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id BIGINT NOT NULL AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        title TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX idx_posts_user (user_id),
        INDEX idx_posts_active (is_active),
        CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id BIGINT NOT NULL AUTO_INCREMENT,
        product_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        rating INT NOT NULL,
        content TEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX idx_reviews_product (product_id),
        INDEX idx_reviews_user (user_id),
        INDEX idx_reviews_active (is_active),
        CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    const categories = [
      ['AI', 'ai'],
      ['건강', 'health'],
      ['전자기기', 'electronics'],
      ['언어', 'language'],
      ['스트레스', 'stress']
    ]
    for (const [name, slug] of categories) {
      await pool.execute(
        'INSERT IGNORE INTO categories (name, slug, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [name, slug]
      )
    }
    const [[{ cnt }]] = await pool.query('SELECT COUNT(*) as cnt FROM products')
    if (cnt === 0) {
      await pool.execute(
        `INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
         VALUES ((SELECT id FROM categories WHERE slug='ai'),'ChatGPT Plus 구독','chatgpt-plus','AI 기반 대화형 어시스턴트',20000,100,1,NOW(),NOW())`
      )
      await pool.execute(
        `INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
         VALUES ((SELECT id FROM categories WHERE slug='health'),'비타민 D3 2000IU','vitamin-d3-2000','면역력 강화 보충제',25000,50,1,NOW(),NOW())`
      )
      await pool.execute(
        `INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
         VALUES ((SELECT id FROM categories WHERE slug='electronics'),'MacBook Air M2','macbook-air-m2','Apple M2 칩 탑재 초경량 노트북',1500000,10,1,NOW(),NOW())`
      )
      await pool.execute(
        `INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
         VALUES ((SELECT id FROM categories WHERE slug='language'),'영어 회화 마스터 코스','english-course','실전 영어 회화 코스',150000,30,0,NOW(),NOW())`
      )
      await pool.execute(
        `INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
         VALUES ((SELECT id FROM categories WHERE slug='stress'),'명상 앱 프리미엄','meditation-app','스트레스 해소 명상 가이드 앱',30000,100,1,NOW(),NOW())`
      )
      await pool.execute(
        `INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
         VALUES ((SELECT id FROM categories WHERE slug='ai'),'Claude AI Pro','claude-ai-pro','Anthropic 고급 AI 어시스턴트',30000,100,1,NOW(),NOW())`
      )
    } else {
      // 보강: 누락된 슬러그가 있으면 개별 보충
      const ensureProduct = async (slug, catSlug, name, desc, price, active = 1) => {
        const [[{ c }]] = await pool.query('SELECT COUNT(*) c FROM products WHERE slug = ?', [slug])
        if (c === 0) {
          await pool.execute(
            `INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
             VALUES ((SELECT id FROM categories WHERE slug=?), ?, ?, ?, ?, 50, ?, NOW(), NOW())`,
            [catSlug, name, slug, desc, price, active]
          )
        }
      }
      await ensureProduct('chatgpt-plus', 'ai', 'ChatGPT Plus 구독', 'AI 기반 대화형 어시스턴트', 20000, 1)
      await ensureProduct('vitamin-d3-2000', 'health', '비타민 D3 2000IU', '면역력 강화 보충제', 25000, 1)
      await ensureProduct('macbook-air-m2', 'electronics', 'MacBook Air M2', 'Apple M2 칩 탑재 초경량 노트북', 1500000, 1)
      await ensureProduct('english-course', 'language', '영어 회화 마스터 코스', '실전 영어 회화 코스', 150000, 0)
      await ensureProduct('meditation-app', 'stress', '명상 앱 프리미엄', '스트레스 해소 명상 가이드 앱', 30000, 1)
      await ensureProduct('claude-ai-pro', 'ai', 'Claude AI Pro', 'Anthropic 고급 AI 어시스턴트', 30000, 1)
    }
    console.log('✅ 스키마 확인 및 최소 시드 완료')
  } catch (err) {
    console.error('⚠️ 스키마 보장 과정에서 오류:', err?.message || err)
  }
}

// Health endpoint to verify DB target
app.get('/__health', async (req, res) => {
  try {
    const [[versionRow]] = await pool.query('SELECT VERSION() as version')
    const [[{ user_count }]] = await pool.query('SELECT COUNT(*) as user_count FROM users')
    res.json({
      status: 'ok',
      dbVersion: versionRow.version,
      userCount: user_count
    })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err?.message || String(err) })
  }
})

// Health alias (frontend에서 잘못 호출해도 보조)
app.get('/health', (req, res) => res.redirect(307, '/__health'))
app.get('/_health', (req, res) => res.redirect(307, '/__health'))

app.post('/posts', authMiddleware, async (req, res) => {
  const { title, content } = req.body || {}
  if (!title) {
    return res.status(400).json({ message: 'title is required' })
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, title, content, is_active) VALUES (?, ?, ?, 1)',
      [req.user.id, title, content || '']
    )
    
    const [posts] = await pool.execute(
      'SELECT * FROM posts WHERE id = ?',
      [result.insertId]
    )
    
    res.status(201).json(posts[0])
  } catch (err) {
    console.error('Create post error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Health alias
app.get('/health', (req, res) => res.redirect(307, '/__health'))

// Initialize admin account on startup
async function initAdmin() {
  try {
    // Ensure users table exists
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS users (
        id BIGINT NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'customer',
        is_admin TINYINT(1) NOT NULL DEFAULT 0,
        is_blocked TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX idx_users_role (role),
        INDEX idx_users_is_admin (is_admin),
        INDEX idx_users_is_blocked (is_blocked)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    )

    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      ['admin@devshop.com']
    )

    if (users.length === 0) {
      const passwordHash = await bcrypt.hash('admin123', 10)
      await pool.execute(
        'INSERT INTO users (name, email, password_hash, role, is_admin) VALUES (?, ?, ?, ?, ?)',
        ['관리자', 'admin@devshop.com', passwordHash, 'admin', 1]
      )
      console.log('✅ 관리자 계정 생성 완료: admin@devshop.com / admin123')
    } else {
      console.log('ℹ️ 관리자 계정 이미 존재: admin@devshop.com')
    }
  } catch (err) {
    console.error('⚠️ 관리자 계정 초기화 중 오류:', err?.message || err)
  }
}

app.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`)
  await ensureSchema()
  await initAdmin()
})
