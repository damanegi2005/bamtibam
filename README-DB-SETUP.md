# DB 및 도커 설정 가이드

## 1. 데이터베이스 실행 (Docker)

### MySQL 실행
```bash
cd db
docker compose up -d mysql
```

### PostgreSQL 실행 (선택사항)
```bash
cd db
docker compose up -d postgres
```

## 2. 데이터베이스 초기화

### MySQL 초기화
```bash
# 스키마 생성 (포트 3307 사용 - Docker MySQL)
mysql -h127.0.0.1 -P3307 -ubamtibam -pbamtibam bamtibam < db/schema.mysql.sql

# 마이그레이션 실행
mysql -h127.0.0.1 -P3307 -ubamtibam -pbamtibam bamtibam < db/migrations/000_add_is_admin_to_users.mysql.sql
mysql -h127.0.0.1 -P3307 -ubamtibam -pbamtibam bamtibam < db/migrations/001_add_user_block_and_posts_reviews.mysql.sql
mysql -h127.0.0.1 -P3307 -ubamtibam -pbamtibam bamtibam < db/migrations/002_create_user_roles_view.mysql.sql

# 시드 데이터 입력
mysql --default-character-set=utf8mb4 -h127.0.0.1 -P3307 -ubamtibam -pbamtibam bamtibam < db/seed.mysql.sql
```

**참고**: 로컬 MySQL이 포트 3306을 사용 중이므로 Docker MySQL은 포트 3307을 사용합니다.

또는 PowerShell 스크립트 사용:
```powershell
cd db
.\setup_mysql.ps1
```

## 3. 백엔드 서버 설정

### 환경 변수 설정
`server/.env` 파일 생성 (또는 루트의 `.env` 파일):
```env
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
JWT_SECRET=devsecret_change_me_in_production
DATABASE_URL=mysql://bamtibam:bamtibam@localhost:3307/bamtibam
```

**참고**: 로컬 MySQL이 포트 3306을 사용 중이므로 Docker MySQL은 포트 3307을 사용합니다.

### 의존성 설치
```bash
cd server
npm install
```

### 서버 실행
```bash
cd server
npm start
```

서버 시작 시 자동으로 `admin@devshop.com` / `admin123` 관리자 계정이 생성됩니다.

## 4. 프론트엔드 설정

### 환경 변수 설정
루트에 `.env` 파일 생성:
```env
VITE_API_BASE_URL=http://localhost:4000
```

### 프론트엔드 실행
```bash
npm install
npm run dev
```

## 5. 테스트 계정

- **관리자**: `admin@devshop.com` / `admin123`
- **일반 사용자**: 회원가입으로 생성 가능

## 6. 문제 해결

### MySQL 연결 실패
- Docker 컨테이너가 실행 중인지 확인: `docker ps`
- 포트가 이미 사용 중인지 확인: `netstat -an | findstr 3307` (Docker MySQL은 포트 3307 사용)
- 데이터베이스가 생성되었는지 확인
- 서버의 `.env` 파일에서 `DATABASE_URL`이 `localhost:3307`을 사용하는지 확인

### 마이그레이션 오류
- 기존 테이블이 있는 경우 스키마를 먼저 삭제하고 다시 생성
- 또는 마이그레이션 파일을 순서대로 실행

### 관리자 계정 로그인 실패
- 서버 로그에서 관리자 계정 생성 여부 확인
- 비밀번호가 올바른지 확인 (`admin123`)

