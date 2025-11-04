-- MySQL 8 전용 시드 데이터 (중복 시 무시 처리)
SET NAMES utf8mb4;

-- Categories (slug/name UNIQUE 전제)
INSERT INTO categories (name, slug, created_at, updated_at)
VALUES ('베스트', 'best', '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO categories (name, slug, created_at, updated_at)
VALUES ('신상품', 'new', '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

-- 현재 스키마: is_admin, is_blocked, email_verified, failed_login_count 등 사용
INSERT INTO users (name, email, password_hash, is_admin, is_blocked, email_verified, failed_login_count, created_at, updated_at)
VALUES ('관리자', 'admin@example.com', '$2b$10$D9x1oP1eWfK1f9r7xgN9HevKQYHkqQ0uZbNQx9y5vN9w1H8mJ7r1K', 1, 0, 1, 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO users (name, email, password_hash, is_admin, is_blocked, email_verified, failed_login_count, created_at, updated_at)
VALUES ('홍길동', 'user@example.com', '$2b$10$D9x1oP1eWfK1f9r7xgN9HevKQYHkqQ0uZbNQx9y5vN9w1H8mJ7r1K', 0, 0, 1, 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

-- Products (BOOLEAN은 1/0)
INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
VALUES ((SELECT id FROM categories WHERE slug='best'), '밤티밤 티라미수', 'tiramisu', '달콤한 티라미수', 12800, 50, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
VALUES ((SELECT id FROM categories WHERE slug='new'), '밤티밤 마카롱 세트', 'macaron-set', '다양한 맛의 마카롱', 15800, 30, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

-- Product images
INSERT INTO product_images (product_id, image_url, sort_order, created_at)
VALUES ((SELECT id FROM products WHERE slug='tiramisu'), 'https://example.com/images/tiramisu.jpg', 0, '2024-01-01 00:00:00');

INSERT INTO product_images (product_id, image_url, sort_order, created_at)
VALUES ((SELECT id FROM products WHERE slug='macaron-set'), 'https://example.com/images/macaron.jpg', 0, '2024-01-01 00:00:00');


