pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        // 네이버 로그인 SDK 저장소. 최신 주소는 네이버 개발자 센터 문서에서 확인하세요.
        // https://developers.naver.com/docs/login/android/android.md
        maven { url = uri("https://repository.map.naver.com/archive/naver_id_login") }
    }
}

rootProject.name = "GuaranteeCertificate"
include(":app")
