package com.guaranteecert.app

import android.content.Context
import com.guaranteecert.app.data.ApiClient
import com.guaranteecert.app.data.AuthRepository
import com.guaranteecert.app.data.FormRepository
import com.guaranteecert.app.data.TokenStore
import com.guaranteecert.app.data.auth.GoogleAuthProvider
import com.guaranteecert.app.data.auth.KakaoAuthProvider
import com.guaranteecert.app.data.auth.NaverAuthProvider
import com.guaranteecert.app.data.auth.SocialAuthProvider

/** 간단한 수동 DI 컨테이너. Application 클래스에서 한 번만 생성해서 재사용합니다. */
class AppContainer(context: Context) {
    val tokenStore = TokenStore(context)
    private val apiService = ApiClient.create(tokenStore)

    val authRepository = AuthRepository(apiService, tokenStore)
    val formRepository = FormRepository(apiService)

    val socialProviders: Map<String, SocialAuthProvider> = mapOf(
        "google" to GoogleAuthProvider(BuildConfig.GOOGLE_WEB_CLIENT_ID),
        "kakao" to KakaoAuthProvider(context),
        "naver" to NaverAuthProvider(),
    )
}
