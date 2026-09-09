package com.guaranteecert.app.data.auth

import android.app.Activity
import com.navercorp.nid.NaverIdLoginSDK
import com.navercorp.nid.oauth.OAuthLoginCallback
import kotlinx.coroutines.suspendCancellableCoroutine

/**
 * 네이버 로그인 (Naver ID Login SDK).
 *
 * 주의: 네이버 SDK는 이 개발 환경(네트워크 정책상 네이버/구글 메이븐 저장소에
 * 접근할 수 없어 컴파일 검증이 불가능했습니다)에서 실제로 빌드해보지 못했습니다.
 * 클래스/메서드 이름은 네이버 개발자 센터의 최신 Android 연동 가이드
 * (https://developers.naver.com/docs/login/android/android.md) 기준으로 작성했으니,
 * Android Studio에서 빌드 시 API가 다르면 이 파일만 맞춰 수정하면 됩니다.
 *
 * NaverIdLoginSDK.initialize(context, clientId, clientSecret, appName)는
 * GuaranteeCertApp.onCreate()에서 한 번 호출합니다.
 */
class NaverAuthProvider : SocialAuthProvider {

    override val providerId = "naver"

    override suspend fun signIn(activity: Activity): Result<String> =
        suspendCancellableCoroutine { cont ->
            val callback = object : OAuthLoginCallback {
                override fun onSuccess() {
                    val token = NaverIdLoginSDK.getAccessToken()
                    if (token != null) {
                        cont.resume(Result.success(token))
                    } else {
                        cont.resume(Result.failure(IllegalStateException("네이버 로그인에 실패했습니다.")))
                    }
                }

                override fun onFailure(httpStatus: Int, message: String) {
                    cont.resume(Result.failure(IllegalStateException("네이버 로그인 실패($httpStatus): $message")))
                }

                override fun onError(errorCode: Int, message: String) {
                    cont.resume(Result.failure(IllegalStateException("네이버 로그인 오류($errorCode): $message")))
                }
            }
            NaverIdLoginSDK.authenticate(activity, callback)
        }

    override fun signOut() {
        NaverIdLoginSDK.logout()
    }
}
