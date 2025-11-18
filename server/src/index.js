import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from './db.js'
import crypto from 'crypto'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000'
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret_change_me'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@devshop.com'

app.use(morgan('dev'))
app.use(express.json())
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

function generateToken(user) {
  const role = user.is_admin === 1 || user.role === 'admin' ? 'admin' : 'user'
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
    if (user.is_blocked === 1) {
      return res.status(403).json({
        message: `현재 ${user.name || user.email}님은 차단된 상태입니다. 관리자에게 문의하세요.`
      })
    }
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' })
  const isAdmin = req.user.is_admin === 1 || req.user.role === 'admin'
  if (!isAdmin) return res.status(403).json({ message: 'Forbidden' })
  next()
}

function validatePassword(password = '') {
  const trimmed = password.trim()
  if (trimmed.length < 8) return false
  const hasLetter = /[A-Za-z]/.test(trimmed)
  const hasNumber = /\d/.test(trimmed)
  const hasSpecial = /[^A-Za-z0-9]/.test(trimmed)
  return hasLetter && hasNumber && hasSpecial
}

// Auth - 이름 중복 체크
app.get('/auth/check-name', async (req, res) => {
  const { name } = req.query || {}
  if (!name) {
    return res.status(400).json({ message: 'name is required' })
  }
  try {
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE name = ?',
      [name]
    )
    if (existing.length > 0) {
      return res.json({ available: false, message: '이미 사용 중인 이름입니다.' })
    }
    return res.json({ available: true, message: '사용 가능한 이름입니다.' })
  } catch (err) {
    console.error('Check name error:', err)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Auth
app.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, password are required' })
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ message: '비밀번호는 8자 이상, 영문/숫자/특수문자를 모두 포함해야 합니다.' })
  }
  try {
    console.log('↪️ /auth/signup 요청:', { name, email })
    // Check if email exists
    const [existingEmail] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    )
    if (existingEmail.length > 0) {
      console.log('⚠️ 이미 존재하는 이메일:', email.toLowerCase())
      return res.status(409).json({ message: '이미 가입된 이메일입니다.' })
    }
    
    // Check if name exists
    const [existingName] = await pool.execute(
      'SELECT id FROM users WHERE name = ?',
      [name]
    )
    if (existingName.length > 0) {
      console.log('⚠️ 이미 존재하는 이름:', name)
      return res.status(409).json({ message: '이미 사용 중인 이름입니다.' })
    }
    
    // 관리자 계정은 서버에서만 생성 가능
    const passwordHash = await bcrypt.hash(password, 10)
    const isAdmin = 0
    const role = 'customer'
    
    let result
    try {
      ;[result] = await pool.execute(
        'INSERT INTO users (name, email, password_hash, role, is_admin) VALUES (?, ?, ?, ?, ?)',
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
      isAdmin: false
    })
  } catch (err) {
    console.error('Signup error:', err)
    return res.status(500).json({ message: 'Internal server error' })
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
  }
})

// Admin: list reviews
app.get('/admin/reviews', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        r.id,
        r.product_id,
        p.name AS product_name,
        r.user_id,
        u.name AS user_name,
        r.rating,
        r.content,
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
  try {
    await pool.execute('DELETE FROM reviews WHERE id = ?', [reviewId])
    res.json({ id: reviewId })
  } catch (err) {
    console.error('Admin delete review error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.delete('/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const userId = Number(req.params.id)
  try {
    // 관리자 자신은 삭제할 수 없도록 체크
    if (userId === req.user.id) {
      return res.status(400).json({ message: '자기 자신은 삭제할 수 없습니다.' })
    }
    await pool.execute('DELETE FROM users WHERE id = ?', [userId])
    res.json({ id: userId })
  } catch (err) {
    console.error('Admin delete user error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Admin: list all products (including inactive)
app.get('/admin/products', authMiddleware, adminMiddleware, async (req, res) => {
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
      ORDER BY p.created_at DESC`
    )
    
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
    console.error('Admin products error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.delete('/admin/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const productId = Number(req.params.id)
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [productId])
    res.json({ id: productId })
  } catch (err) {
    console.error('Admin delete product error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.patch('/admin/products/:id/toggle', authMiddleware, adminMiddleware, async (req, res) => {
  const productId = Number(req.params.id)
  const { isActive } = req.body || {}
  try {
    const activeValue = isActive === true || isActive === 1 ? 1 : 0
    await pool.execute('UPDATE products SET is_active = ? WHERE id = ?', [activeValue, productId])
    res.json({ id: productId, is_active: activeValue })
  } catch (err) {
    console.error('Admin toggle product error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Cart
app.get('/cart', authMiddleware, async (req, res) => {
  try {
    const [items] = await pool.execute(
      `SELECT 
        c.id,
        c.product_id,
        c.quantity,
        p.name,
        p.price_cents,
        p.slug,
        pi.image_url
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 0
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC`,
      [req.user.id]
    )
    res.json(items)
  } catch (err) {
    console.error('Cart error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.post('/cart', authMiddleware, async (req, res) => {
  const { productId, quantity = 1 } = req.body || {}
  if (!productId) {
    return res.status(400).json({ message: 'productId is required' })
  }
  try {
    // Check if product exists and is active
    const [products] = await pool.execute('SELECT id, is_active FROM products WHERE id = ?', [productId])
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' })
    }
    if (products[0].is_active === 0) {
      return res.status(400).json({ message: '품절된 상품은 장바구니에 담을 수 없습니다.' })
    }
    
    // Check if item already exists in cart
    const [existing] = await pool.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    )
    
    if (existing.length > 0) {
      // Update quantity
      await pool.execute(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      )
    } else {
      // Insert new item
      await pool.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, productId, quantity]
      )
    }
    
    res.json({ message: '장바구니에 추가되었습니다.' })
  } catch (err) {
    console.error('Add to cart error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.patch('/cart/:id', authMiddleware, async (req, res) => {
  const cartItemId = Number(req.params.id)
  const { quantity } = req.body || {}
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'quantity must be at least 1' })
  }
  try {
    await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, cartItemId, req.user.id]
    )
    res.json({ message: '수량이 업데이트되었습니다.' })
  } catch (err) {
    console.error('Update cart error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.delete('/cart/:id', authMiddleware, async (req, res) => {
  const cartItemId = Number(req.params.id)
  try {
    await pool.execute('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [cartItemId, req.user.id])
    res.json({ message: '장바구니에서 삭제되었습니다.' })
  } catch (err) {
    console.error('Delete cart error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Orders
app.post('/orders', authMiddleware, async (req, res) => {
  try {
    // Get cart items
    const [cartItems] = await pool.execute(
      'SELECT product_id, quantity FROM cart_items WHERE user_id = ?',
      [req.user.id]
    )
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: '장바구니가 비어있습니다.' })
    }
    
    // Calculate total
    let totalCents = 0
    for (const item of cartItems) {
      const [products] = await pool.execute('SELECT price_cents FROM products WHERE id = ?', [item.product_id])
      if (products.length > 0) {
        totalCents += products[0].price_cents * item.quantity
      }
    }
    
    // Create order
    const [orderResult] = await pool.execute(
      'INSERT INTO orders (user_id, status, total_cents) VALUES (?, ?, ?)',
      [req.user.id, '상품준비중', totalCents]
    )
    const orderId = orderResult.insertId
    
    // Create order items
    for (const item of cartItems) {
      const [products] = await pool.execute('SELECT price_cents FROM products WHERE id = ?', [item.product_id])
      if (products.length > 0) {
        await pool.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, products[0].price_cents]
        )
      }
    }
    
    // Clear cart
    await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id])
    
    res.json({ orderId, message: '주문이 완료되었습니다.' })
  } catch (err) {
    console.error('Create order error:', err)
    console.error('Error details:', err.message, err.stack)
    res.status(500).json({ message: err.message || 'Internal server error' })
  }
})

app.get('/orders', authMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT 
        o.id,
        o.status,
        o.total_cents,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`,
      [req.user.id]
    )
    
    // Get detailed items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.execute(
          `SELECT 
            oi.product_id,
            oi.quantity,
            oi.unit_price_cents,
            p.name,
            p.slug,
            pi.image_url
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 0
          WHERE oi.order_id = ?
          ORDER BY oi.id`,
          [order.id]
        )
        return { ...order, items }
      })
    )
    
    res.json(ordersWithItems)
  } catch (err) {
    console.error('Get orders error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Admin: orders
app.get('/admin/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT 
        o.id,
        o.user_id,
        u.name as user_name,
        o.status,
        o.total_cents,
        o.created_at,
        o.updated_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC`
    )
    res.json(orders)
  } catch (err) {
    console.error('Admin orders error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.patch('/admin/orders/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const orderId = Number(req.params.id)
  const { status } = req.body || {}
  const validStatuses = ['상품준비중', '발송완료', '배송중', '배송완료']
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Valid status is required: 상품준비중, 발송완료, 배송중, 배송완료' })
  }
  try {
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId])
    res.json({ id: orderId, status })
  } catch (err) {
    console.error('Update order status error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.patch('/users/:id/unblock', authMiddleware, adminMiddleware, async (req, res) => {
  const userId = Number(req.params.id)
  try {
    await pool.execute(
      'UPDATE users SET is_blocked = 0 WHERE id = ?',
      [userId]
    )
    res.json({ id: userId, is_blocked: 0 })
  } catch (err) {
    console.error('Unblock user error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' })
  }
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, password_hash, role, is_admin, is_blocked FROM users WHERE email = ?',
      [email.toLowerCase()]
    )
    if (users.length === 0) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' })
    }
    const user = users[0]
    
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' })
    }
    
    if (user.is_blocked === 1) {
      return res.status(403).json({ message: `현재 ${user.name}님은 차단된 상태입니다. 관리자에게 문의하세요.` })
    }
    
    const role = user.is_admin === 1 || user.role === 'admin' ? 'admin' : 'user'
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
  const role = u.is_admin === 1 || u.role === 'admin' ? 'admin' : 'user'
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
      WHERE 1=1
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
      WHERE p.slug = ?`,
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
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id BIGINT NOT NULL AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX idx_cart_items_user (user_id),
        INDEX idx_cart_items_product (product_id),
        UNIQUE KEY unique_user_product (user_id, product_id),
        CONSTRAINT fk_cart_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT NOT NULL AUTO_INCREMENT,
        user_id BIGINT NULL,
        address_id BIGINT NULL,
        status VARCHAR(32) NOT NULL DEFAULT '상품준비중',
        total_cents INT NOT NULL,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX idx_orders_user (user_id),
        INDEX idx_orders_status (status),
        CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        CONSTRAINT fk_orders_address FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT NOT NULL AUTO_INCREMENT,
        order_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        quantity INT NOT NULL,
        unit_price_cents INT NOT NULL,
        PRIMARY KEY (id),
        INDEX idx_order_items_order (order_id),
        INDEX idx_order_items_product (product_id),
        CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    // Migration: Handle order_items table columns
    try {
      const [allColumns] = await pool.execute(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items'"
      )
      const columnNames = allColumns.map(col => col.COLUMN_NAME)
      
      // Remove old/unused columns
      const columnsToRemove = ['price_cents', 'product_name']
      for (const colName of columnsToRemove) {
        if (columnNames.includes(colName)) {
          await pool.execute(`ALTER TABLE order_items DROP COLUMN ${colName}`)
          console.log(`✅ order_items 테이블에서 ${colName} 컬럼 제거 완료`)
        }
      }
      
      // Add unit_price_cents column if it doesn't exist
      if (!columnNames.includes('unit_price_cents')) {
        await pool.execute('ALTER TABLE order_items ADD COLUMN unit_price_cents INT NOT NULL DEFAULT 0')
        console.log('✅ order_items 테이블에 unit_price_cents 컬럼 추가 완료')
      }
    } catch (err) {
      console.error('⚠️ order_items 컬럼 마이그레이션 중 오류:', err.message)
    }
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
