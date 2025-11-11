# 문제 해결 가이드

## 현재 상황 분석

### 1. Docker Desktop 실행 필요
**에러**: `unable to get image 'mysql:8.0': error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/images/mysql:8.0/json": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.`

**해결 방법**:
1. Docker Desktop 앱을 실행하세요
2. Docker Desktop이 완전히 시작될 때까지 대기 (시스템 트레이에 Docker 아이콘이 초록색으로 표시)
3. 다음 명령으로 확인:
   ```bash
   docker ps
   ```

### 2. 포트 4000 사용 중 (해결됨)
**에러**: `Error: listen EADDRINUSE: address already in use :::4000`

**해결 방법**:
- 포트를 사용하는 프로세스를 종료했습니다
- 다시 서버를 실행할 수 있습니다

### 3. 포트 3306 충돌 (해결됨) ✅
**에러**: `ports are not available: exposing port TCP 0.0.0.0:3306 -> 127.0.0.1:0: listen tcp 0.0.0.0:3306: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.`

**원인**: 로컬 시스템에 MySQL 서버가 이미 실행 중입니다 (PID 7404)

**해결 방법**:
- Docker MySQL 컨테이너의 포트를 3307로 변경했습니다
- `db/docker-compose.yml`: 포트 매핑을 `3307:3306`으로 변경
- `env.example`: DATABASE_URL을 `localhost:3307`로 변경
- `db/setup_mysql.ps1`: 기본 포트를 3307로 변경
- 서버의 `.env` 파일에서 `DATABASE_URL=mysql://bamtibam:bamtibam@localhost:3307/bamtibam` 사용

### 4. PowerShell 스크립트 경로 문제 (수정됨)
**에러**: `지정된 경로를 찾을 수 없습니다.`

**해결 방법**:
- `setup_mysql.ps1` 스크립트를 수정하여 현재 디렉토리 기준으로 경로를 찾도록 변경했습니다

## 단계별 실행 가이드

### 1단계: Docker Desktop 실행
1. Windows 시작 메뉴에서 "Docker Desktop" 검색 및 실행
2. Docker Desktop이 완전히 시작될 때까지 대기 (1-2분 소요)
3. 시스템 트레이에서 Docker 아이콘이 초록색인지 확인

### 2단계: MySQL 컨테이너 실행
```powershell
cd db
docker compose up -d mysql
```

### 3단계: 데이터베이스 초기화
```powershell
# db 폴더에서 실행
cd db
.\setup_mysql.ps1
```

또는 수동으로:
```powershell
# db 폴더에서 실행 (포트 3307 사용)
mysql -h127.0.0.1 -P3307 -ubamtibam -pbamtibam bamtibam < schema.mysql.sql
mysql -h127.0.0.1 -P3307 -ubamtibam -pbamtibam bamtibam < migrations\000_add_is_admin_to_users.mysql.sql
mysql -h127.0.0.1 -P3307 -ubamtibam -pbamtibam bamtibam < migrations\001_add_user_block_and_posts_reviews.mysql.sql
mysql -h127.0.0.1 -P3307 -ubamtibam -pbamtibam bamtibam < migrations\002_create_user_roles_view.mysql.sql
mysql --default-character-set=utf8mb4 -h127.0.0.1 -P3307 -ubamtibam -pbamtibam bamtibam < seed.mysql.sql
```

### 4단계: 백엔드 서버 실행
```powershell
cd server
npm start
```

서버가 정상적으로 시작되면:
- `Server listening on http://localhost:4000` 메시지 확인
- `✅ MySQL 연결 성공` 메시지 확인
- `✅ 관리자 계정 생성 완료: admin@devshop.com / admin123` 메시지 확인

### 5단계: 프론트엔드 실행
```powershell
# 프로젝트 루트에서
npm run dev
```

## 문제 발생 시 체크리스트

- [ ] Docker Desktop이 실행 중인가?
- [ ] MySQL 컨테이너가 실행 중인가? (`docker ps`로 확인)
- [ ] 포트 4000이 비어있는가? (`netstat -ano | findstr :4000`로 확인)
- [ ] 포트 3307이 사용 가능한가? (`netstat -ano | findstr :3307`로 확인)
- [ ] 데이터베이스가 초기화되었는가?
- [ ] 서버의 `.env` 파일이 올바른가? (`DATABASE_URL=mysql://bamtibam:bamtibam@localhost:3307/bamtibam`)
- [ ] MySQL 클라이언트가 설치되어 있는가? (스크립트 실행 시 필요)

## MySQL 클라이언트 설치

MySQL 클라이언트가 없으면 다음 중 하나를 설치하세요:

1. **MySQL 공식 설치**: https://dev.mysql.com/downloads/installer/
2. **XAMPP/WAMP**: MySQL 클라이언트 포함
3. **Docker로 MySQL 클라이언트 사용**:
   ```bash
   docker run -it --rm mysql:8.0 mysql -hhost.docker.internal -P3307 -ubamtibam -pbamtibam bamtibam
   ```

## 대안: Docker 없이 로컬 MySQL 사용

로컬에 MySQL이 설치되어 있다면:
1. MySQL 서버 시작
2. 데이터베이스 생성:
   ```sql
   CREATE DATABASE bamtibam;
   CREATE USER 'bamtibam'@'localhost' IDENTIFIED BY 'bamtibam';
   GRANT ALL PRIVILEGES ON bamtibam.* TO 'bamtibam'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. 스키마 및 데이터 적용 (위의 3단계 참조)

