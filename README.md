# 건설기계 대여대금 지급보증서

건설기계 임대차 현장 정보를 등록하고, 담당자에게 이메일로 즉시 전달하는 Next.js 웹앱입니다.

같은 저장소의 [`android/`](./android) 폴더에는 이 웹앱의 API를 그대로 재사용하는 Kotlin
네이티브 안드로이드 앱이 있습니다 (자세한 내용은 `android/README.md` 참고).

## 화면 구성

1. **로그인 화면 (`/`)**: 로고 → "건설기계 대여대금 지급보증서" → 네이버 로그인 → 구글 로그인 → 카카오 로그인
2. **개인정보 동의 (`/consent`)**: 최초 로그인 시 개인정보 수집·이용 동의 필수
3. **입력 화면 (`/form`)**
   - 현장명 / 원청명
   - 세금계산서 등록 (기존 정보 불러오기 또는 신규 등록)
     - 건설기계임차인명
     - 건설기계임대인명 (회사명 / 대표자명 / 차량번호)
     - 사업자등록번호 / 대표자 휴대폰번호
   - 계약서 등록 (기존 정보 불러오기 또는 신규 등록)
     - 계약기간 / 단가 / 결제기한
   - **송신 버튼**: 위 정보를 담당자 이메일로 발송
4. **담당자 설정 (`/settings`)**: 발송받을 담당자 이름/이메일 주소 등록

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 값 채워 넣기 (아래 참고)
npm run dev
```

## 연동에 필요한 키 (.env.local)

로그인 버튼과 송신 버튼은 UI/로직이 모두 완성되어 있으며, 아래 키를 채워 넣는 즉시 실제로 동작합니다.

| 키 | 발급처 | 비고 |
|---|---|---|
| `AUTH_SECRET` | `npx auth secret` 로컬 생성 | 세션 암호화용, 필수 |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | [Google Cloud Console](https://console.cloud.google.com) | OAuth 클라이언트 ID, 리디렉션 URI: `.../api/auth/callback/google` |
| `AUTH_KAKAO_ID` / `AUTH_KAKAO_SECRET` | [Kakao Developers](https://developers.kakao.com) | 카카오 로그인, Redirect URI: `.../api/auth/callback/kakao` |
| `AUTH_NAVER_ID` / `AUTH_NAVER_SECRET` | [Naver Developers](https://developers.naver.com) | 네이버 로그인, Callback URL: `.../api/auth/callback/naver` |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | 구글 계정 설정 | 발신용 Gmail 계정 + [앱 비밀번호](https://myaccount.google.com/apppasswords) (2단계 인증 필요) |

키가 없는 상태에서도 앱은 정상 동작합니다:
- 로그인 버튼을 누르면 해당 제공자의 OAuth 에러 화면으로 이동합니다 (키 미설정 안내).
- 송신 버튼을 누르면 입력한 정보는 저장되고, 화면에 "이메일 발송 계정이 설정되지 않았습니다" 안내가 표시됩니다.

## 데이터 저장

현재는 별도 데이터베이스 없이 `data/db.json` 파일에 저장합니다 (`.gitignore` 처리되어 git에 올라가지 않음).
운영 환경으로 전환 시 `src/lib/db.ts` 만 실제 DB 연동으로 교체하면 나머지 코드는 그대로 사용할 수 있습니다.
서버리스 배포(Vercel 등)에서는 파일시스템이 영속되지 않으므로, 실제 서비스 전에는 DB 연동이 필요합니다.

## 이메일 발송 내용 예시

```
제목: [건설기계 대여대금 지급보증서] OO아파트 신축공사

[건설기계 대여대금 지급보증서]
현장명: OO아파트 신축공사
원청명: OO건설(주)
임차인: 홍길동
임대인: OO중기(주) (대표 김철수) / 차량번호 12가3456
사업자등록번호: 123-45-67890 / 대표자 연락처: 010-0000-0000
계약기간: 2026-07-01 ~ 2026-12-31
단가: 시간당 55,000원
결제기한: 익월 10일
```
