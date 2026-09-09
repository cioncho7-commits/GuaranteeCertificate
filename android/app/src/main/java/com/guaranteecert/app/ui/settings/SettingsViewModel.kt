package com.guaranteecert.app.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.guaranteecert.app.data.ApiResult
import com.guaranteecert.app.data.FormRepository
import com.guaranteecert.app.data.model.ManagerContact
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class SettingsUiState(
    val loading: Boolean = true,
    val contacts: List<ManagerContact> = emptyList(),
    val saving: Boolean = false,
    val errorMessage: String? = null,
)

class SettingsViewModel(private val formRepository: FormRepository) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState

    init {
        load()
    }

    private fun load() {
        viewModelScope.launch {
            when (val result = formRepository.listManagerContacts()) {
                is ApiResult.Success -> _uiState.value = _uiState.value.copy(loading = false, contacts = result.data)
                is ApiResult.Failure -> _uiState.value = _uiState.value.copy(loading = false, errorMessage = result.message)
            }
        }
    }

    fun addContact(name: String, email: String) {
        _uiState.value = _uiState.value.copy(saving = true, errorMessage = null)
        viewModelScope.launch {
            when (val result = formRepository.addManagerContact(name, email)) {
                is ApiResult.Success -> {
                    _uiState.value = _uiState.value.copy(saving = false, contacts = _uiState.value.contacts + result.data)
                }
                is ApiResult.Failure -> {
                    _uiState.value = _uiState.value.copy(saving = false, errorMessage = result.message)
                }
            }
        }
    }

    fun deleteContact(id: String) {
        viewModelScope.launch {
            when (formRepository.deleteManagerContact(id)) {
                is ApiResult.Success -> {
                    _uiState.value = _uiState.value.copy(contacts = _uiState.value.contacts.filterNot { it.id == id })
                }
                is ApiResult.Failure -> Unit
            }
        }
    }
}
