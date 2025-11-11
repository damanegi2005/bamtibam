-- MySQL 8 전용 시드 데이터 (중복 시 무시 처리)
SET NAMES utf8mb4;

-- Categories (slug/name UNIQUE 전제)
INSERT INTO categories (name, slug, created_at, updated_at)
VALUES ('베스트', 'best', '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO categories (name, slug, created_at, updated_at)
VALUES ('신상품', 'new', '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

-- 프론트엔드에서 사용하는 카테고리 추가
INSERT INTO categories (name, slug, created_at, updated_at)
VALUES ('AI', 'ai', '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO categories (name, slug, created_at, updated_at)
VALUES ('건강', 'health', '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO categories (name, slug, created_at, updated_at)
VALUES ('전자기기', 'electronics', '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO categories (name, slug, created_at, updated_at)
VALUES ('언어', 'language', '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO categories (name, slug, created_at, updated_at)
VALUES ('스트레스', 'stress', '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

-- Users (비밀번호: Password123!)
-- 관리자 계정 (프론트엔드와 일치하도록 admin@devshop.com 추가)
INSERT INTO users (name, email, password_hash, role, is_admin, created_at, updated_at)
VALUES ('관리자', 'admin@devshop.com', '$2b$10$D9x1oP1eWfK1f9r7xgN9HevKQYHkqQ0uZbNQx9y5vN9w1H8mJ7r1K', 'admin', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO users (name, email, password_hash, role, is_admin, created_at, updated_at)
VALUES ('관리자', 'admin@example.com', '$2b$10$D9x1oP1eWfK1f9r7xgN9HevKQYHkqQ0uZbNQx9y5vN9w1H8mJ7r1K', 'admin', 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO users (name, email, password_hash, role, is_admin, created_at, updated_at)
VALUES ('홍길동', 'user@example.com', '$2b$10$D9x1oP1eWfK1f9r7xgN9HevKQYHkqQ0uZbNQx9y5vN9w1H8mJ7r1K', 'customer', 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

-- Products (BOOLEAN은 1/0)
-- 기존 상품
INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
VALUES ((SELECT id FROM categories WHERE slug='best'), '밤티밤 티라미수', 'tiramisu', '달콤한 티라미수', 12800, 50, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
VALUES ((SELECT id FROM categories WHERE slug='new'), '밤티밤 마카롱 세트', 'macaron-set', '다양한 맛의 마카롱', 15800, 30, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

-- 프론트엔드에서 사용하는 상품 추가
INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
VALUES ((SELECT id FROM categories WHERE slug='ai'), 'ChatGPT Plus 구독', 'chatgpt-plus', 'AI 기반 대화형 어시스턴트 서비스. 창작, 분석, 코딩 등 다양한 작업을 도와드립니다.', 20000, 100, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
VALUES ((SELECT id FROM categories WHERE slug='health'), '비타민 D3 2000IU', 'vitamin-d3-2000', '면역력 강화와 뼈 건강에 도움을 주는 비타민 D3 보충제입니다.', 25000, 50, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
VALUES ((SELECT id FROM categories WHERE slug='electronics'), 'MacBook Air M2', 'macbook-air-m2', 'Apple M2 칩을 탑재한 초경량 노트북. 개발자와 크리에이터를 위한 최적의 선택입니다.', 1500000, 10, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
VALUES ((SELECT id FROM categories WHERE slug='language'), '영어 회화 마스터 코스', 'english-course', '네이티브 선생님과 함께하는 실전 영어 회화 코스입니다.', 150000, 30, 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
VALUES ((SELECT id FROM categories WHERE slug='stress'), '명상 앱 프리미엄', 'meditation-app', '스트레스 해소와 마음의 평화를 위한 명상 가이드 앱입니다.', 30000, 100, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO products (category_id, name, slug, description, price_cents, stock_quantity, is_active, created_at, updated_at)
VALUES ((SELECT id FROM categories WHERE slug='ai'), 'Claude AI Pro', 'claude-ai-pro', 'Anthropic의 고급 AI 어시스턴트. 창의적 작업과 분석에 특화되어 있습니다.', 30000, 100, 1, '2024-01-01 00:00:00', '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

-- Product images
INSERT INTO product_images (product_id, image_url, sort_order, created_at)
VALUES ((SELECT id FROM products WHERE slug='tiramisu'), 'https://via.placeholder.com/300x200/00ff88/1e1e1e?text=Tiramisu', 0, '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO product_images (product_id, image_url, sort_order, created_at)
VALUES ((SELECT id FROM products WHERE slug='macaron-set'), 'https://via.placeholder.com/300x200/007acc/ffffff?text=Macaron', 0, '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

-- 프론트엔드 상품 이미지
INSERT INTO product_images (product_id, image_url, sort_order, created_at)
VALUES ((SELECT id FROM products WHERE slug='chatgpt-plus'), 'https://via.placeholder.com/300x200/00ff88/1e1e1e?text=ChatGPT+Plus', 0, '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO product_images (product_id, image_url, sort_order, created_at)
VALUES ((SELECT id FROM products WHERE slug='vitamin-d3-2000'), 'https://via.placeholder.com/300x200/007acc/ffffff?text=Vitamin+D3', 0, '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO product_images (product_id, image_url, sort_order, created_at)
VALUES ((SELECT id FROM products WHERE slug='macbook-air-m2'), 'https://via.placeholder.com/300x200/c586c0/ffffff?text=MacBook+Air', 0, '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO product_images (product_id, image_url, sort_order, created_at)
VALUES ((SELECT id FROM products WHERE slug='english-course'), 'https://via.placeholder.com/300x200/ff8c00/ffffff?text=English+Course', 0, '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO product_images (product_id, image_url, sort_order, created_at)
VALUES ((SELECT id FROM products WHERE slug='meditation-app'), 'https://via.placeholder.com/300x200/00ff88/1e1e1e?text=Meditation+App', 0, '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO product_images (product_id, image_url, sort_order, created_at)
VALUES ((SELECT id FROM products WHERE slug='claude-ai-pro'), 'https://via.placeholder.com/300x200/007acc/ffffff?text=Claude+AI', 0, '2024-01-01 00:00:00')
ON DUPLICATE KEY UPDATE id = id;


