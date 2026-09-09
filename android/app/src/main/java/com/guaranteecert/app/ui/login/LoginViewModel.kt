package com.guaranteecert.app.ui.login

import android.app.Activity
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.guaranteecert.app.data.ApiResult
import com.guaranteecert.app.data.AuthRepository
import com.guaranteecert.app.data.auth.SocialAuthProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class LoginUiState(
    val loadingProvider: String? = null,
    val errorMessage: String? = null,
)

class LoginViewModel(
    private val authRepository: AuthRepository,
    private val socialProviders: Map<String, SocialAuthProvider>,
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState

    fun login(providerId: String, activity: Activity, onSuccess: () -> Unit) {
        val provider = socialProviders[providerId] ?: return
        _uiState.value = LoginUiState(loadingProvider = providerId)

        viewModelScope.launch {
            val signInResult = provider.signIn(activity)
            val providerToken = signInResult.getOrNull()
            if (providerToken == null) {
                _uiState.value = LoginUiState(
                    errorMessage = signInResult.exceptionOrNull()?.message ?: "로그인이 취소되었습니다.",
                )
                return@launch
            }

            when (val result = authRepository.loginWithProvider(providerId, providerToken)) {
                is ApiResult.Success -> {
                    _uiState.value = LoginUiState()
                    onSuccess()
                }
                is ApiResult.Failure -> {
                    _uiState.value = LoginUiState(errorMessage = result.message)
                }
            }
        }
    }
}
