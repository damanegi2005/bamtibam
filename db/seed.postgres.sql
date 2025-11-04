-- PostgreSQL 전용 시드 데이터

-- Categories
INSERT INTO categories (name, slug, created_at, updated_at) VALUES
('베스트', 'best', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'),
('신상품', 'new', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z')
ON CONFLICT DO NOTHING;

-- Users (비밀번호는 bcrypt 해시, 실제 비밀번호: Password123!)
-- bcrypt hash generated with cost 10 for "Password123!":
-- $2b$10$D9x1oP1eWfK1f9r7xgN9HevKQYHkqQ0uZbNQx9y5vN9w1H8mJ7r1K
INSERT INTO users (email, password_hash, name, role, created_at, updated_at) VALUES
('admin@example.com', '$2b$10$D9x1oP1eWfK1f9r7xgN9HevKQYHkqQ0uZbNQx9y5vN9w1H8mJ7r1K', '관리자', 'admin', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password_hash, name, role, created_at, updated_at) VALUES
('user@example.com', '$2b$10$D9x1oP1eWfK1f9r7xgN9HevKQYHkqQ0uZbNQx9y5vN9w1H8mJ7r1K', '홍길동', 'customer', '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z')
ON CONFLICT (email) DO NOTHING;

-- Products
INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at) VALUES
((SELECT id FROM categories WHERE slug='best'), '밤티밤 티라미수', 'tiramisu', '달콤한 티라미수', 12800, 50, TRUE, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at) VALUES
((SELECT id FROM categories WHERE slug='new'), '밤티밤 마카롱 세트', 'macaron-set', '다양한 맛의 마카롱', 15800, 30, TRUE, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z')
ON CONFLICT (slug) DO NOTHING;

-- Product images
INSERT INTO product_images (product_id, image_url, sort_order, created_at) VALUES
((SELECT id FROM products WHERE slug='tiramisu'), 'https://example.com/images/tiramisu.jpg', 0, '2024-01-01T00:00:00Z');

INSERT INTO product_images (product_id, image_url, sort_order, created_at) VALUES
((SELECT id FROM products WHERE slug='macaron-set'), 'https://example.com/images/macaron.jpg', 0, '2024-01-01T00:00:00Z');


