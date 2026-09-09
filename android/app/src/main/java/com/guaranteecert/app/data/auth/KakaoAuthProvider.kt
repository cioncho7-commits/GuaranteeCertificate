package com.guaranteecert.app.data.auth

import android.app.Activity
import android.content.Context
import com.kakao.sdk.auth.model.OAuthToken
import com.kakao.sdk.user.UserApiClient
import kotlinx.coroutines.suspendCancellableCoroutine

/**
 * 카카오 로그인 (Kakao SDK v2).
 * 카카오톡 앱이 설치되어 있으면 카카오톡으로, 아니면 카카오계정(웹)으로 로그인합니다.
 * 카카오 개발자 콘솔에서 "카카오 로그인" 활성화 + 이메일 동의항목이 필요합니다.
 */
class KakaoAuthProvider(private val context: Context) : SocialAuthProvider {

    override val providerId = "kakao"

    override suspend fun signIn(activity: Activity): Result<String> =
        suspendCancellableCoroutine { cont ->
            val callback: (OAuthToken?, Throwable?) -> Unit = { token, error ->
                when {
                    error != null -> cont.resume(Result.failure(error))
                    token != null -> cont.resume(Result.success(token.accessToken))
                    else -> cont.resume(Result.failure(IllegalStateException("카카오 로그인에 실패했습니다.")))
                }
            }

            if (UserApiClient.instance.isKakaoTalkLoginAvailable(context)) {
                UserApiClient.instance.loginWithKakaoTalk(context, callback = callback)
            } else {
                UserApiClient.instance.loginWithKakaoAccount(context, callback = callback)
            }
        }

    override fun signOut() {
        UserApiClient.instance.logout { }
    }
}
