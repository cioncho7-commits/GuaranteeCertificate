package com.guaranteecert.app.ui.form

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.guaranteecert.app.data.ApiResult
import com.guaranteecert.app.data.AuthRepository
import com.guaranteecert.app.data.FormRepository
import com.guaranteecert.app.data.ProfileChoice
import com.guaranteecert.app.data.model.ContractProfile
import com.guaranteecert.app.data.model.ManagerContact
import com.guaranteecert.app.data.model.NewContractData
import com.guaranteecert.app.data.model.NewTaxInvoiceData
import com.guaranteecert.app.data.model.TaxInvoiceProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class SubmitOutcome(val ok: Boolean, val title: String, val detail: String)

data class FormUiState(
    val loading: Boolean = true,
    val taxInvoiceProfiles: List<TaxInvoiceProfile> = emptyList(),
    val contractProfiles: List<ContractProfile> = emptyList(),
    val managerContacts: List<ManagerContact> = emptyList(),
    val submitting: Boolean = false,
    val outcome: SubmitOutcome? = null,
)

class FormViewModel(
    private val formRepository: FormRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(FormUiState())
    val uiState: StateFlow<FormUiState> = _uiState

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(loading = true)
            val taxProfiles = (formRepository.listTaxInvoiceProfiles() as? ApiResult.Success)?.data.orEmpty()
            val contractProfiles = (formRepository.listContractProfiles() as? ApiResult.Success)?.data.orEmpty()
            val managers = (formRepository.listManagerContacts() as? ApiResult.Success)?.data.orEmpty()
            _uiState.value = _uiState.value.copy(
                loading = false,
                taxInvoiceProfiles = taxProfiles,
                contractProfiles = contractProfiles,
                managerContacts = managers,
            )
        }
    }

    fun submit(
        siteName: String,
        clientName: String,
        taxInvoice: ProfileChoice<NewTaxInvoiceData>,
        contract: ProfileChoice<NewContractData>,
        managerContactId: String,
    ) {
        if (managerContactId.isBlank()) {
            _uiState.value = _uiState.value.copy(
                outcome = SubmitOutcome(false, "담당자 미등록", "설정에서 담당자 이메일 주소를 먼저 등록해 주세요."),
            )
            return
        }

        _uiState.value = _uiState.value.copy(submitting = true, outcome = null)
        viewModelScope.launch {
            when (
                val result = formRepository.submit(siteName, clientName, taxInvoice, contract, managerContactId)
            ) {
                is ApiResult.Success -> {
                    val response = result.data
                    val outcome = when {
                        response.email.ok -> SubmitOutcome(
                            true,
                            "발송 완료",
                            "담당자(${response.submission.managerEmail})에게 이메일을 발송했습니다.",
                        )
                        response.email.reason == "not_configured" -> SubmitOutcome(
                            false,
                            "정보는 저장되었습니다 (이메일 미발송)",
                            "서버의 이메일 발송 계정이 아직 설정되지 않았습니다.",
                        )
                        else -> SubmitOutcome(
                            false,
                            "이메일 발송 실패",
                            response.email.detail ?: "잠시 후 다시 시도해 주세요.",
                        )
                    }
                    _uiState.value = _uiState.value.copy(submitting = false, outcome = outcome)
                    refresh()
                }
                is ApiResult.Failure -> {
                    _uiState.value = _uiState.value.copy(
                        submitting = false,
                        outcome = SubmitOutcome(false, "송신 실패", result.message),
                    )
                }
            }
        }
    }

    fun logout(onDone: () -> Unit) {
        viewModelScope.launch {
            authRepository.logout()
            onDone()
        }
    }
}
