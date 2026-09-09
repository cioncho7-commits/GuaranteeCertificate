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
        // 카카오 SDK는 Maven Central이 아니라 카카오 자체 저장소에서 배포됩니다.
        // https://developers.kakao.com/docs/latest/en/android/getting-started
        maven { url = uri("https://devrepo.kakao.com/nexus/content/groups/public/") }
    }
}

rootProject.name = "GuaranteeCertificate"
include(":app")
