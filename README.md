# BAMTIBAM- 개발자용 쇼핑몰 

VS Code 스타일의 네온 테마를 적용한 React 기반 쇼핑몰 웹사이트
<<<<<<< HEAD
보안 거의 x
=======
백엔드/프론트엔드 연동된 풀스택 샘플로, 관리 기능과 기본 보안 정책(입력 검증, JWT 인증, 관리자 전용 API 등)을 포함합니다.
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)


## 기술 스택

- React 18: 프론트엔드 프레임워크
- React Router: 페이지 라우팅
- Vite: 빌드 도구
- CSS3: 커스텀 스타일링

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 브라우저에서 확인
- http://localhost:3000 접속

### 환경 변수
프로젝트 루트에 `.env` 생성:
```
VITE_API_BASE_URL=http://localhost:4000
```
백엔드 저장소에는 `DATABASE_URL`을 설정하세요. 예시는 `env.example` 참고.

### API 계약
`docs/api-contract.md` 참고. 백엔드는 해당 스펙대로 라우트를 제공해야 프론트가 정상 동작합니다.

## DB 설정(팀 온보딩용)

1) Docker로 DB 실행(둘 중 하나 선택)
```bash
npm run db:up:postgres   # PostgreSQL 권장
# 또는
npm run db:up:mysql
```

2) 스키마/마이그레이션/시드 적용
- PostgreSQL
```bash
cd db
psql postgresql://bamtibam:bamtibam@localhost:5432/bamtibam -f schema.postgres.sql
psql postgresql://bamtibam:bamtibam@localhost:5432/bamtibam -f migrations/001_add_user_block_and_posts_reviews.postgres.sql
psql postgresql://bamtibam:bamtibam@localhost:5432/bamtibam -f seed.postgres.sql
```
- MySQL
```bash
cd db
mysql -h127.0.0.1 -P3306 -ubamtibam -pbamtibam bamtibam < schema.mysql.sql
mysql -h127.0.0.1 -P3306 -ubamtibam -pbamtibam bamtibam < migrations/001_add_user_block_and_posts_reviews.mysql.sql
mysql --default-character-set=utf8mb4 -h127.0.0.1 -P3306 -ubamtibam -pbamtibam bamtibam < seed.mysql.sql
```

3) 계정(시드)
- 관리자: admin@example.com / Password123!
- 사용자: user@example.com / Password123!

문제 해결
- MySQL 한글 에러: `db/README.md`의 가이드를 참고하여 `utf8mb4` 적용 후 재실행
- 스키마 불일치: `db/migrations/`와 `db/seed.*.sql`을 차례로 재적용

## 테스트 계정

### 관리자 계정
- **이메일**: admin@devshop.com
- **비밀번호**: admin123

### 일반 사용자 계정
- **이메일**: user@devshop.com
- **비밀번호**: user123

<<<<<<< HEAD
### 로그인 특징
- **아무 이메일@아무것.com + 아무 비밀번호**로도 로그인 가능!
- 보안 검증 거의 없음 (학생이 만든 것처럼)
- 새 창 팝업으로 로그인/회원가입
=======
### 보안 정책
- 회원가입 시 이름/이메일/비밀번호 모두 유효성 검사를 통과해야 합니다.  
  - 이름: 2~30자, 한글/영문/숫자 + 공백/._-
  - 비밀번호: 10~64자, 대문자/소문자/숫자/특수문자 각 1개 이상
- 로그인·회원가입 엔드포인트에 속도 제한(rate limiting) 적용
- JWT 기반 인증 및 관리자 토큰 검사
- 가입 단계에서는 관리자 계정 생성 불가, 관리자가 별도 권한 관리

### 관리자 페이지
- 회원 목록, 상품, 리뷰, 게시글 데이터 모두 실시간으로 백엔드에서 호출
- 사용자 차단/해제, 관리자 권한 부여/회수
- 상품/게시글 활성화 토글, 리뷰 비활성화 등 운영 도구 제공
>>>>>>> 626638b (feat: secure auth flow and admin dashboard integration)

## 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Layout.jsx      # 메인 레이아웃
│   ├── Layout.css      # 레이아웃 스타일
│   ├── ProductModal.jsx # 상품 상세 모달
│   └── ProductModal.css # 모달 스타일
├── pages/              # 페이지 컴포넌트
│   ├── Home.jsx        # 메인 페이지
│   ├── Home.css        # 홈 스타일
│   ├── Login.jsx       # 로그인 페이지
│   ├── Signup.jsx      # 회원가입 페이지
│   ├── Auth.css        # 인증 페이지 스타일
│   ├── Admin.jsx       # 관리자 페이지
│   └── Admin.css       # 관리자 스타일
├── App.jsx             # 메인 앱 컴포넌트
├── App.css             # 앱 전역 스타일
├── main.jsx            # 앱 진입점
└── index.css           # 전역 스타일
```


**BAMTIBAM** - 개발자를 위한 최고의 쇼핑 경험
