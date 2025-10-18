# BAMTIBAM- 개발자용 쇼핑몰 

VS Code 스타일의 네온 테마를 적용한 React 기반 쇼핑몰 웹사이트
보안 거의 x


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

## 테스트 계정

### 관리자 계정
- **이메일**: admin@devshop.com
- **비밀번호**: admin123

### 일반 사용자 계정
- **이메일**: user@devshop.com
- **비밀번호**: user123

### 로그인 특징
- **아무 이메일@아무것.com + 아무 비밀번호**로도 로그인 가능!
- 보안 검증 거의 없음 (학생이 만든 것처럼)
- 새 창 팝업으로 로그인/회원가입

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
