# 건설기계 대여대금 지급보증서 (Android)

Kotlin + Jetpack Compose로 만든 네이티브 안드로이드 앱입니다. 로그인/데이터 저장/이메일 발송은
같은 저장소의 Next.js 웹앱(`../`)이 제공하는 API를 그대로 재사용합니다 (별도 백엔드 없음).

## CI 빌드 (APK 받기)

이 저장소에 `.github/workflows/android-build.yml`이 설정되어 있어, `android/` 폴더에
변경사항이 푸시될 때마다 GitHub Actions가 자동으로 디버그 APK를 빌드합니다.
GitHub 저장소의 **Actions 탭 → Android Build → 최근 실행 → Artifacts**에서
`app-debug` 파일을 내려받아 휴대폰에 설치(사이드로드)하면 Android Studio 없이도
바로 실행해볼 수 있습니다.

## ⚠️ 이 코드는 아직 빌드 검증이 안 됐습니다

이 프로젝트는 Android SDK와 Google Maven 저장소(`dl.google.com`)에 접근할 수 없는 개발 환경에서
작성되었습니다 (네트워크 정책으로 차단됨 — Android Gradle Plugin, AndroidX 라이브러리는
전부 이 저장소에서 받아오기 때문에 이 환경에서는 컴파일 자체가 불가능했습니다).
따라서 **Android Studio에서 열어 실제로 빌드해보기 전까지는 컴파일 에러가 있을 수 있습니다.**
특히 아래 부분은 실제 라이브러리 버전에 따라 API가 조금 다를 수 있어 우선적으로 확인하세요:

- `data/auth/NaverAuthProvider.kt` — 네이버 로그인 SDK 클래스/메서드명
- `gradle/libs.versions.toml`의 각 라이브러리 버전 (Android Studio가 최신 버전을 제안하면 그대로 업데이트해도 됩니다)

## 아키텍처

- **UI**: Jetpack Compose + Navigation Compose (로그인 → 동의 → 입력 화면 → 설정 화면)
- **네트워크**: Retrofit + kotlinx.serialization, `data/ApiService.kt`가 웹앱과 동일한 엔드포인트 호출
- **인증**: 각 제공자 네이티브 SDK로 로그인 → 서버의 `/api/mobile/auth`에 토큰을 보내 검증 →
  앱 전용 Bearer 토큰(JWT) 발급받아 이후 모든 API 호출에 사용 (DataStore에 저장)
- **화면 구성은 웹앱과 동일**: 로그인 → 개인정보 동의 → (현장명/원청명, 세금계산서 등록,
  계약서 등록, 담당자 선택, 송신) → 담당자 설정

## 시작하기

1. Android Studio (최신 버전)로 `android/` 폴더를 엽니다.
2. Gradle Sync — 처음에는 라이브러리 버전 경고가 뜰 수 있으니 제안대로 업데이트하세요.
3. `app/build.gradle.kts`의 `defaultConfig` 안에 있는 4개 값을 채워 넣습니다 (아래 "키 발급" 참고).
4. 백엔드(Next.js) 서버를 먼저 `npm run dev`로 켭니다 (저장소 루트에서).
5. 에뮬레이터로 실행 — 에뮬레이터는 `10.0.2.2`가 PC의 `localhost`를 가리키므로 기본 설정 그대로
   사용하면 됩니다. 실기기로 테스트하려면 `API_BASE_URL`을 PC의 실제 IP로 바꾸세요
   (`http://<PC의 IP>:3000/`), 실기기와 PC가 같은 Wi-Fi에 있어야 합니다.

## 백엔드와 앱을 한 사람 계정으로 묶기

로그인 식별자는 **이메일 기준**으로 통일했습니다. 즉 같은 구글 계정으로 웹에서 로그인하든
앱에서 로그인하든 같은 사용자로 인식되어 데이터(세금계산서/계약서/담당자 등록 정보)가
공유됩니다.

## 키 발급 (4개)

웹앱용으로 이미 등록한 것과 **별개로**, 안드로이드 네이티브 앱용 등록이 추가로 필요합니다.
패키지명은 `com.guaranteecert.app` 입니다.

### 1. 구글 — Web Client ID (이미 있는 값 재사용)

Credential Manager(구글 로그인)는 안드로이드 클라이언트가 아니라 **웹 애플리케이션 타입
클라이언트 ID**를 사용합니다. 웹앱 설정 때 만든 `AUTH_GOOGLE_ID`와 **동일한 값**을
`GOOGLE_WEB_CLIENT_ID`에 넣으면 됩니다 (새로 만들 필요 없음).

다만 실제 기기/에뮬레이터에서 정상 동작하려면 Google Cloud Console에 **Android 타입
OAuth 클라이언트**도 하나 추가로 등록해야 합니다 (사용은 안 해도 등록은 필요):
- 패키지명: `com.guaranteecert.app`
- SHA-1 인증서 지문 (디버그용):
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```

### 2. 카카오 — 네이티브 앱 키

1. https://developers.kakao.com → 내 애플리케이션 → (웹용으로 만든 앱 그대로 사용 가능)
2. **플랫폼 설정 → Android 플랫폼 추가**
   - 패키지명: `com.guaranteecert.app`
   - 마켓 URL 등은 비워둬도 됨
   - **키 해시** 등록 (디버그용):
     ```bash
     keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android | openssl sha1 -binary | openssl base64
     ```
3. **앱 키 → 네이티브 앱 키** 복사 → `app/build.gradle.kts`의 `KAKAO_NATIVE_APP_KEY`에 입력

### 3. 네이버 — Client ID / Secret

1. https://developers.naver.com → Application → 등록한 애플리케이션 선택
2. **환경 추가 → Android 앱**
   - 패키지명: `com.guaranteecert.app`
   - 다운로드 URL: 비워둬도 됨
   - 마켓 등록 시 사용할 다운로드 URL도 비워둬도 됨(테스트 단계)
3. Client ID / Client Secret은 웹과 공용 → `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`에 입력

## 값 입력 위치

`app/build.gradle.kts`의 `defaultConfig` 블록:

```kotlin
buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"...\"")
val kakaoNativeAppKey = "..."
buildConfigField("String", "NAVER_CLIENT_ID", "\"...\"")
buildConfigField("String", "NAVER_CLIENT_SECRET", "\"...\"")
```

실제 배포 전에는 이 값들을 소스에 하드코딩하지 말고 `local.properties`나 CI 시크릿으로
옮기는 것을 권장합니다 (지금은 개발 편의를 위해 build.gradle.kts에 직접 넣는 구조입니다).

## 로그아웃 / 재로그인 테스트

`/설정 화면이 아닌` 입력 화면 하단의 "로그아웃" 버튼으로 로컬 토큰을 지우고 로그인 화면으로
돌아갈 수 있습니다.
