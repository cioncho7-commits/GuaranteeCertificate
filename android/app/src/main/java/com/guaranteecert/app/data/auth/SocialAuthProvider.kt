package com.guaranteecert.app.data.auth

import android.app.Activity

/** 소셜 로그인 SDK를 감싸는 공통 인터페이스. provider 값은 서버(/api/mobile/auth)가 기대하는 값과 일치해야 합니다. */
interface SocialAuthProvider {
    val providerId: String // "google" | "kakao" | "naver"

    /** 로그인 성공 시 제공자 토큰(구글: ID 토큰, 카카오/네이버: 액세스 토큰)을 반환합니다. */
    suspend fun signIn(activity: Activity): Result<String>

    fun signOut()
}
