# API 계약 (백엔드-프론트-DB 호환)

## 인증
- POST /auth/signup
  - body: { name, email, password }
  - effect: INSERT INTO users (name,email,password_hash,...) (bcrypt)
- POST /auth/login
  - body: { email, password }
  - effect: bcrypt 검증 → JWT 발급
  - response: { token, user: { id, name, email, role } }
  - role 산출: `user_roles` 뷰(또는 CASE is_admin)

## 게시글
- POST /posts (auth required)
  - body: { title, content }
  - effect: INSERT INTO posts(user_id,title,content,is_active=1)
- GET /posts
  - query: ?page, ?limit
  - effect: SELECT ... FROM posts WHERE is_active=1 ORDER BY created_at DESC
- PATCH /posts/:id/disable (admin)
  - effect: UPDATE posts SET is_active=0 WHERE id=:id

## 리뷰
- POST /reviews (auth required)
  - body: { productId, rating(1~5), content }
  - effect: INSERT INTO reviews(product_id,user_id,rating,content,is_active=1)
- GET /products/:slug/reviews
  - effect: SELECT ... FROM reviews r JOIN products p ON ... WHERE p.slug=:slug AND r.is_active=1
- PATCH /reviews/:id/disable (admin)
  - effect: UPDATE reviews SET is_active=0 WHERE id=:id

## 사용자 차단
- PATCH /users/:id/block (admin)
  - body: { reason?, until? }
  - effect: UPDATE users SET is_blocked=1, blocked_reason=?, blocked_until=?
- PATCH /users/:id/unblock (admin)
  - effect: UPDATE users SET is_blocked=0, blocked_reason=NULL, blocked_until=NULL
- 인증 미들웨어
  - 로그인/요청 전 `is_blocked=1 OR blocked_until>NOW()`이면 403

## 상품
- GET /products
  - effect: SELECT id,name,slug,price_cents FROM products WHERE is_active=1 ORDER BY created_at DESC
- GET /products/:slug
  - effect: SELECT ... FROM products WHERE slug=:slug AND is_active=1; SELECT images FROM product_images

## 주의
- DB: MySQL/PG 겸용. 권장: MySQL은 `utf8mb4` 필수
- 권한: admin 판별은 `is_admin=1` 또는 `user_roles.role='admin'`


