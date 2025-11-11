# 빠른 시작 가이드

## 현재 상황 요약

✅ **해결 완료:**
1. 포트 4000 사용 중 → 프로세스 종료 완료
2. 포트 3306 충돌 → Docker MySQL 포트를 3307로 변경
3. PowerShell 스크립트 경로 문제 → 수정 완료

## 실행 순서

### 1. Docker Desktop 실행
- Docker Desktop 앱을 실행하고 완전히 시작될 때까지 대기
- 시스템 트레이에서 Docker 아이콘이 초록색인지 확인

### 2. MySQL 컨테이너 시작
```powershell
cd db
docker compose up -d mysql
```

**중요**: Docker Desktop이 완전히 시작된 후에 실행하세요.

### 3. 데이터베이스 초기화
```powershell
# db 폴더에서 실행
.\setup_mysql.ps1
```

**참고**: MySQL 클라이언트가 설치되어 있어야 합니다. 없으면 로컬 MySQL을 사용하거나 Docker로 실행하세요.

### 4. 서버 환경 변수 설정
프로젝트 루트 또는 `server` 폴더에 `.env` 파일 생성:
```env
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
JWT_SECRET=devsecret_change_me_in_production
DATABASE_URL=mysql://bamtibam:bamtibam@localhost:3307/bamtibam
```

### 5. 백엔드 서버 실행
```powershell
cd server
npm start
```

정상 실행 시:
- `Server listening on http://localhost:4000`
- `✅ MySQL 연결 성공`
- `✅ 관리자 계정 생성 완료: admin@devshop.com / admin123`

### 6. 프론트엔드 실행
```powershell
# 프로젝트 루트에서
npm run dev
```

## 테스트 계정

- **관리자**: `admin@devshop.com` / `admin123`
- **일반 사용자**: 회원가입으로 생성 가능

## 포트 정보

- **프론트엔드**: http://localhost:3000
- **백엔드**: http://localhost:4000
- **Docker MySQL**: localhost:3307 (호스트) → 3306 (컨테이너 내부)
- **로컬 MySQL**: localhost:3306 (기존 유지)

## 문제 발생 시

1. **포트 충돌**: `netstat -ano | findstr :포트번호`로 확인
2. **Docker 컨테이너 확인**: `docker ps`
3. **서버 로그 확인**: 서버 콘솔에서 에러 메시지 확인
4. **데이터베이스 연결 확인**: 서버 시작 시 "✅ MySQL 연결 성공" 메시지 확인

## 추가 참고

- 상세한 문제 해결: `TROUBLESHOOTING.md` 참고
- 포트 충돌 해결: `README-PORT-FIX.md` 참고
- DB 설정 가이드: `README-DB-SETUP.md` 참고





