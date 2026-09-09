package com.guaranteecert.app.data.auth

import android.app.Activity
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential

/**
 * 구글 로그인 (Credential Manager / Google Identity Services).
 *
 * webClientId는 반드시 "웹 애플리케이션" 타입 OAuth 클라이언트 ID여야 합니다
 * (안드로이드 타입 클라이언트 ID 아님!). 서버(.env.local의 AUTH_GOOGLE_ID)와
 * 동일한 값을 써야 서버가 ID 토큰의 대상(aud)을 검증할 수 있습니다.
 */
class GoogleAuthProvider(
    private val webClientId: String,
) : SocialAuthProvider {

    override val providerId = "google"

    override suspend fun signIn(activity: Activity): Result<String> {
        val credentialManager = CredentialManager.create(activity)

        val googleIdOption = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false)
            .setServerClientId(webClientId)
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()

        return try {
            val result = credentialManager.getCredential(activity, request)
            val credential = result.credential
            if (credential is CustomCredential &&
                credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
            ) {
                val idTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                Result.success(idTokenCredential.idToken)
            } else {
                Result.failure(IllegalStateException("구글 로그인 응답을 처리할 수 없습니다."))
            }
        } catch (e: GetCredentialException) {
            Result.failure(e)
        }
    }

    override fun signOut() {
        // Credential Manager는 별도의 로그아웃 API가 없습니다.
        // 앱 자체 세션(TokenStore)만 정리하면 됩니다.
    }
}
