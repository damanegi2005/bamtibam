# 포트 충돌 해결 방법

## 문제 상황
로컬 시스템에 MySQL 서버가 이미 실행 중이어서 포트 3306을 사용하고 있습니다.
Docker MySQL 컨테이너가 같은 포트를 사용하려고 해서 충돌이 발생했습니다.

## 해결 방법

### 방법 1: Docker MySQL 포트 변경 (권장) ✅
Docker MySQL 컨테이너의 포트를 3307로 변경했습니다.

**변경 사항:**
- `db/docker-compose.yml`: MySQL 포트를 `3307:3306`으로 변경
- `env.example`: DATABASE_URL을 `localhost:3307`로 변경
- `db/setup_mysql.ps1`: 기본 포트를 3307로 변경

**사용 방법:**
1. Docker Desktop에서 MySQL 컨테이너 시작
2. 서버의 `.env` 파일에 `DATABASE_URL=mysql://bamtibam:bamtibam@localhost:3307/bamtibam` 설정
3. 데이터베이스 초기화:
   ```powershell
   cd db
   .\setup_mysql.ps1
   ```

### 방법 2: 로컬 MySQL 서비스 중지
로컬 MySQL을 사용하지 않는다면 Windows 서비스를 중지할 수 있습니다.

**명령어:**
```powershell
# MySQL 서비스 중지
net stop MySQL80
# 또는 서비스 이름 확인 후
sc stop MySQL80
```

**주의:** 로컬 MySQL을 다른 프로젝트에서 사용 중이면 이 방법을 사용하지 마세요.

## 현재 설정

### Docker MySQL
- **호스트 포트**: 3307
- **컨테이너 포트**: 3306 (내부)
- **연결 정보**: `mysql://bamtibam:bamtibam@localhost:3307/bamtibam`

### 로컬 MySQL (기존)
- **포트**: 3306
- **상태**: 실행 중 (PID 7404)

## 다음 단계

1. **Docker MySQL 컨테이너 시작**:
   - Docker Desktop에서 MySQL 컨테이너를 시작하세요
   - 포트 3307로 접속 가능합니다

2. **서버 환경 변수 설정**:
   ```env
   DATABASE_URL=mysql://bamtibam:bamtibam@localhost:3307/bamtibam
   ```

3. **데이터베이스 초기화**:
   ```powershell
   cd db
   .\setup_mysql.ps1
   ```

4. **서버 실행**:
   ```powershell
   cd server
   npm start
   ```

## 문제 해결

### 여전히 포트 충돌이 발생하는 경우
```powershell
# 포트 3307 사용 중인 프로세스 확인
netstat -ano | findstr :3307

# Docker 컨테이너 재시작
cd db
docker compose down
docker compose up -d mysql
```

### 연결이 안 되는 경우
1. Docker 컨테이너가 실행 중인지 확인: `docker ps`
2. 포트가 올바른지 확인: `netstat -ano | findstr :3307`
3. 서버의 `.env` 파일에서 DATABASE_URL 확인





