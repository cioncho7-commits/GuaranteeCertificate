plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.guaranteecert.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.guaranteecert.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        // 백엔드(Next.js) 서버 주소.
        //  - 에뮬레이터에서 로컬 PC의 개발 서버(localhost:3000)에 붙으려면 10.0.2.2 사용
        //  - 실제 배포 서버가 생기면 이 값을 바꾸세요.
        buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:3000/\"")

        // ↓↓↓ 아래 4개 값을 각 개발자 콘솔에서 발급받은 실제 값으로 채워 넣으세요. ↓↓↓

        // 구글: "웹 애플리케이션" 타입 OAuth 클라이언트 ID (안드로이드 타입 아님).
        // 서버(.env.local의 AUTH_GOOGLE_ID)와 동일한 값이어야 합니다.
        buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"GOOGLE_WEB_CLIENT_ID_HERE\"")

        // 카카오: 네이티브 앱 키 (카카오 개발자 콘솔 > 앱 키 > 네이티브 앱 키)
        val kakaoNativeAppKey = "KAKAO_NATIVE_APP_KEY_HERE"
        buildConfigField("String", "KAKAO_NATIVE_APP_KEY", "\"$kakaoNativeAppKey\"")
        manifestPlaceholders["kakaoNativeAppKey"] = kakaoNativeAppKey

        // 네이버: Client ID / Secret (네이버 개발자 센터 > 애플리케이션 정보)
        buildConfigField("String", "NAVER_CLIENT_ID", "\"NAVER_CLIENT_ID_HERE\"")
        buildConfigField("String", "NAVER_CLIENT_SECRET", "\"NAVER_CLIENT_SECRET_HERE\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.core)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.datastore.preferences)
    debugImplementation(libs.androidx.ui.tooling)

    implementation(libs.retrofit.core)
    implementation(libs.retrofit.kotlinx.serialization)
    implementation(libs.okhttp.logging.interceptor)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)

    implementation(libs.androidx.credentials)
    implementation(libs.androidx.credentials.play.services.auth)
    implementation(libs.googleid)

    implementation(libs.kakao.user)
    implementation(libs.naver.login)
}
