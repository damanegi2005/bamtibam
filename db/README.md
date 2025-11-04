# DB 사용 가이드 (PostgreSQL / MySQL)

## 실행 (Docker)
```bash
cd db
# PostgreSQL 권장
docker compose up -d postgres
# 또는 MySQL
# docker compose up -d mysql
```

## 접속 정보
- PostgreSQL: localhost:5432 / db=user=pw = bamtibam
- MySQL: localhost:3306 / user=pw = bamtibam (root pw: root)

## 스키마 적용
```bash
# PostgreSQL
psql postgresql://bamtibam:bamtibam@localhost:5432/bamtibam -f schema.postgres.sql
# 차단/게시글/리뷰 마이그레이션
psql postgresql://bamtibam:bamtibam@localhost:5432/bamtibam -f migrations/001_add_user_block_and_posts_reviews.postgres.sql
# MySQL
mysql -h127.0.0.1 -P3306 -ubamtibam -pbamtibam bamtibam < schema.mysql.sql
# 차단/게시글/리뷰 마이그레이션
mysql -h127.0.0.1 -P3306 -ubamtibam -pbamtibam bamtibam < migrations/001_add_user_block_and_posts_reviews.mysql.sql
```

## 시드 데이터
```bash
# PostgreSQL 전용
psql postgresql://bamtibam:bamtibam@localhost:5432/bamtibam -f seed.postgres.sql
# MySQL 전용
mysql --default-character-set=utf8mb4 -h127.0.0.1 -P3306 -ubamtibam -pbamtibam bamtibam < seed.mysql.sql
```
- 관리자: admin@example.com / Password123!
- 사용자: user@example.com / Password123!

## 참고 테이블
- users, categories, products, product_images, addresses, orders, order_items, posts, reviews

## 운영 가이드: 차단/비활성화 동작
- 사용자 차단: `users.is_blocked = TRUE`, 필요 시 `blocked_until`, `blocked_reason` 설정
  - 백엔드 인증 미들웨어에서 로그인/요청 처리 전 `is_blocked` 또는 시간(`blocked_until > NOW()`)을 검사해 요청을 거절
- 게시글 비활성화: `posts.is_active = FALSE` → 목록/상세 조회 시 `WHERE is_active = TRUE` 조건으로 필터링
- 리뷰 비활성화: `reviews.is_active = FALSE` → 상품 상세/리뷰 목록에서 제외
- 권장 정책: 삭제 대신 비활성화(soft-delete)로 운영 로그 보존

## 백업/복원 (간단)
```bash
# PostgreSQL 백업/복원
pg_dump -Fc -f backup.dump postgresql://bamtibam:bamtibam@localhost:5432/bamtibam
pg_restore -c -d postgresql://bamtibam:bamtibam@localhost:5432/bamtibam backup.dump

# MySQL 백업/복원
mysqldump -h127.0.0.1 -P3306 -ubamtibam -pbamtibam bamtibam > backup.sql
mysql -h127.0.0.1 -P3306 -uroot -proot -e "DROP DATABASE IF EXISTS bamtibam; CREATE DATABASE bamtibam;"
mysql -h127.0.0.1 -P3306 -ubamtibam -pbamtibam bamtibam < backup.sql
```

## 참고
- MySQL에서 `mysql ... -p비밀번호` 형태로 실행 시 CLI 경고(비밀번호 평문 경고)가 출력될 수 있습니다. 보안상 문제가 되지 않는 개발 환경이라면 무시해도 됩니다. 운영 환경에서는 `.my.cnf` 사용 또는 환경변수/시크릿을 권장합니다.
- 한글 오류(Incorrect string value) 발생 시:
  1) MySQL 컨테이너를 재기동해 서버 문자셋을 적용하세요.
     ```bash
     docker compose restart mysql
     ```
  2) 데이터베이스 문자셋/콜레이션을 강제로 맞춥니다.
     ```bash
     mysql -h127.0.0.1 -P3306 -uroot -proot -e "ALTER DATABASE bamtibam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
     ```
  3) 시드 적용 시 `--default-character-set=utf8mb4` 옵션을 사용하세요.

