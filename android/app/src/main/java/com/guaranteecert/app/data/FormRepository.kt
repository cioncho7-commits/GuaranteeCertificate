package com.guaranteecert.app.data

import com.guaranteecert.app.data.model.Consent
import com.guaranteecert.app.data.model.ConsentRequest
import com.guaranteecert.app.data.model.ContractProfile
import com.guaranteecert.app.data.model.ManagerContact
import com.guaranteecert.app.data.model.ManagerCreateRequest
import com.guaranteecert.app.data.model.ManagerDeleteRequest
import com.guaranteecert.app.data.model.NewContractData
import com.guaranteecert.app.data.model.NewTaxInvoiceData
import com.guaranteecert.app.data.model.SubmitRequest
import com.guaranteecert.app.data.model.SubmitResponse
import com.guaranteecert.app.data.model.TaxInvoiceProfile
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.put

sealed class ProfileChoice<out T> {
    data class Existing(val id: String) : ProfileChoice<Nothing>()
    data class New<T>(val data: T) : ProfileChoice<T>()
}

class FormRepository(private val apiService: ApiService) {

    private val json = Json { encodeDefaults = true }

    suspend fun getConsent(): ApiResult<Consent?> {
        val result = safeCall { apiService.getConsent() }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(result.data.consent)
            is ApiResult.Failure -> result
        }
    }

    suspend fun agreeConsent(marketingAgreed: Boolean): ApiResult<Consent> {
        val result = safeCall {
            apiService.postConsent(ConsentRequest(requiredAgreed = true, marketingAgreed = marketingAgreed))
        }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(result.data.consent!!)
            is ApiResult.Failure -> result
        }
    }

    suspend fun listTaxInvoiceProfiles(): ApiResult<List<TaxInvoiceProfile>> {
        val result = safeCall { apiService.listTaxInvoiceProfiles() }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(result.data.profiles)
            is ApiResult.Failure -> result
        }
    }

    suspend fun listContractProfiles(): ApiResult<List<ContractProfile>> {
        val result = safeCall { apiService.listContractProfiles() }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(result.data.profiles)
            is ApiResult.Failure -> result
        }
    }

    suspend fun listManagerContacts(): ApiResult<List<ManagerContact>> {
        val result = safeCall { apiService.listManagerContacts() }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(result.data.contacts)
            is ApiResult.Failure -> result
        }
    }

    suspend fun addManagerContact(name: String, email: String): ApiResult<ManagerContact> {
        val result = safeCall { apiService.createManagerContact(ManagerCreateRequest(name, email)) }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(result.data.contact)
            is ApiResult.Failure -> result
        }
    }

    suspend fun deleteManagerContact(id: String): ApiResult<Unit> {
        val result = safeCall { apiService.deleteManagerContact(ManagerDeleteRequest(id)) }
        return when (result) {
            is ApiResult.Success -> ApiResult.Success(Unit)
            is ApiResult.Failure -> result
        }
    }

    suspend fun submit(
        siteName: String,
        clientName: String,
        taxInvoice: ProfileChoice<NewTaxInvoiceData>,
        contract: ProfileChoice<NewContractData>,
        managerContactId: String,
    ): ApiResult<SubmitResponse> {
        val request = SubmitRequest(
            siteName = siteName,
            clientName = clientName,
            taxInvoice = taxInvoiceJson(taxInvoice),
            contract = contractJson(contract),
            managerContactId = managerContactId,
        )
        return safeCall { apiService.submit(request) }
    }

    private fun taxInvoiceJson(choice: ProfileChoice<NewTaxInvoiceData>): JsonElement =
        when (choice) {
            is ProfileChoice.Existing -> buildJsonObject {
                put("mode", "existing")
                put("id", choice.id)
            }
            is ProfileChoice.New -> buildJsonObject {
                put("mode", "new")
                put("data", json.encodeToJsonElement(choice.data))
            }
        }

    private fun contractJson(choice: ProfileChoice<NewContractData>): JsonElement =
        when (choice) {
            is ProfileChoice.Existing -> buildJsonObject {
                put("mode", "existing")
                put("id", choice.id)
            }
            is ProfileChoice.New -> buildJsonObject {
                put("mode", "new")
                put("data", json.encodeToJsonElement(choice.data))
            }
        }
}
