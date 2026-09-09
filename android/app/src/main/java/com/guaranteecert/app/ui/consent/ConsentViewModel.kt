package com.guaranteecert.app.ui.consent

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.guaranteecert.app.data.ApiResult
import com.guaranteecert.app.data.FormRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class ConsentUiState(
    val checking: Boolean = true,
    val alreadyAgreed: Boolean = false,
    val submitting: Boolean = false,
    val errorMessage: String? = null,
)

class ConsentViewModel(private val formRepository: FormRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(ConsentUiState())
    val uiState: StateFlow<ConsentUiState> = _uiState

    init {
        viewModelScope.launch {
            when (val result = formRepository.getConsent()) {
                is ApiResult.Success -> {
                    val agreed = result.data?.requiredAgreed == true
                    _uiState.value = ConsentUiState(checking = false, alreadyAgreed = agreed)
                }
                is ApiResult.Failure -> {
                    _uiState.value = ConsentUiState(checking = false, errorMessage = result.message)
                }
            }
        }
    }

    fun agree(marketingAgreed: Boolean, onSuccess: () -> Unit) {
        _uiState.value = _uiState.value.copy(submitting = true, errorMessage = null)
        viewModelScope.launch {
            when (val result = formRepository.agreeConsent(marketingAgreed)) {
                is ApiResult.Success -> {
                    _uiState.value = _uiState.value.copy(submitting = false)
                    onSuccess()
                }
                is ApiResult.Failure -> {
                    _uiState.value = _uiState.value.copy(submitting = false, errorMessage = result.message)
                }
            }
        }
    }
}
