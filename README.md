# 보증서 서비스

제품 보증서를 발급하고 조회하는 정적 웹사이트입니다. 순수 HTML/CSS/JS로 만들어져 있고,
로그인과 데이터 저장은 Firebase(Authentication + Firestore)를 사용합니다.

## 구조

- `index.html`, `issue.html`, `lookup.html`, `login.html` — 페이지
- `css/style.css` — 공통 스타일
- `js/storage.js` — Firestore 기반 보증서 저장/조회
- `js/issue.js`, `js/lookup.js`, `js/login.js`, `js/auth-nav.js` — 페이지별 로직
- `js/firebase-config.js`, `js/firebase-init.js` — Firebase 초기화
- `firestore.rules` — Firestore 보안 규칙 (조회는 공개, 발급은 로그인 필요)

## 1. Firebase 프로젝트 설정

1. https://console.firebase.google.com 에서 새 프로젝트를 만듭니다.
2. 왼쪽 메뉴 **Authentication** → "시작하기" → 로그인 방법에서 **이메일/비밀번호**를 사용 설정합니다.
3. 왼쪽 메뉴 **Firestore Database** → "데이터베이스 만들기" → 프로덕션 모드로 생성합니다.
4. Firestore의 **규칙** 탭에 이 저장소의 `firestore.rules` 내용을 붙여넣고 게시합니다.
5. 프로젝트 설정(톱니바퀴) → **일반** 탭 → "내 앱"에서 웹 앱(</> 아이콘)을 추가합니다.
6. 발급된 `firebaseConfig` 객체 값을 `js/firebase-config.js`의 `window.FIREBASE_CONFIG`에 그대로 옮겨 적습니다.

이 설정을 마치기 전까지는 로그인/발급/조회가 동작하지 않습니다(콘솔에 Firebase 초기화 오류가 표시됩니다).

## 2. 로컬 확인

정적 파일이므로 아무 정적 서버로 열어보면 됩니다.

```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```

## 3. Cloudflare Pages 배포

1. Cloudflare 대시보드 → **Workers & Pages** → **Pages** → "Git에 연결"에서 이 GitHub 저장소를 선택합니다.
2. 빌드 설정은 프레임워크 없음(정적 파일)이므로 빌드 명령어는 비워두고, 빌드 출력 디렉터리는 루트(`/`)로 둡니다.
3. 배포 후 발급되는 `*.pages.dev` 주소로 바로 접속할 수 있고, 보유한 도메인을 Cloudflare에 연결해 커스텀 도메인으로 연결할 수 있습니다.
4. `main` 브랜치에 새로 push할 때마다 자동으로 재배포됩니다.

## 참고

- 로그인은 보증서를 **발급**하는 관리자/판매자용입니다. 보증서 **조회**는 누구나 로그인 없이 가능합니다.
- Firestore 보안 규칙상 발급된 보증서는 이후 수정/삭제가 불가능합니다.
