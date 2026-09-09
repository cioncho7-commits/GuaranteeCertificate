package com.guaranteecert.app.data

import com.guaranteecert.app.data.model.MobileAuthRequest

class AuthRepository(
    private val apiService: ApiService,
    private val tokenStore: TokenStore,
) {
    /**
     * 소셜 로그인 SDK로부터 받은 토큰을 서버로 보내 검증하고,
     * 앱이 이후 API 호출에 쓸 자체 Bearer 토큰을 발급받아 저장합니다.
     */
    suspend fun loginWithProvider(provider: String, providerToken: String): ApiResult<Unit> {
        val result = safeCall { apiService.mobileAuth(MobileAuthRequest(provider, providerToken)) }
        return when (result) {
            is ApiResult.Success -> {
                val res = result.data
                tokenStore.save(res.token, res.user.email, res.user.name)
                ApiResult.Success(Unit)
            }
            is ApiResult.Failure -> result
        }
    }

    suspend fun logout() {
        tokenStore.clear()
    }

    suspend fun isLoggedIn(): Boolean = tokenStore.currentToken() != null
}
