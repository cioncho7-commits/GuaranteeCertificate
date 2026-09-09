package com.guaranteecert.app.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class TaxInvoiceProfile(
    val id: String,
    val ownerId: String,
    val lesseeName: String,
    val lessorCompanyName: String,
    val lessorRepName: String,
    val vehicleNumber: String,
    val businessRegNumber: String,
    val repPhone: String,
    val createdAt: String,
)

@Serializable
data class NewTaxInvoiceData(
    val lesseeName: String,
    val lessorCompanyName: String,
    val lessorRepName: String,
    val vehicleNumber: String,
    val businessRegNumber: String,
    val repPhone: String,
)

@Serializable
data class ContractProfile(
    val id: String,
    val ownerId: String,
    val periodStart: String,
    val periodEnd: String,
    val unitPrice: String,
    val paymentDueTerms: String,
    val createdAt: String,
)

@Serializable
data class NewContractData(
    val periodStart: String,
    val periodEnd: String,
    val unitPrice: String,
    val paymentDueTerms: String,
)

@Serializable
data class ManagerContact(
    val id: String,
    val ownerId: String,
    val name: String,
    val email: String,
    val createdAt: String,
)

@Serializable
data class Submission(
    val id: String,
    val ownerId: String,
    val siteName: String,
    val clientName: String,
    val taxInvoice: TaxInvoiceProfile,
    val contract: ContractProfile,
    val managerEmail: String,
    val emailStatus: String,
    val emailDetail: String? = null,
    val createdAt: String,
)

@Serializable
data class Consent(
    val userId: String,
    val requiredAgreed: Boolean,
    val marketingAgreed: Boolean,
    val agreedAt: String,
)

@Serializable
data class ConsentResponse(val consent: Consent? = null)

@Serializable
data class TaxInvoiceListResponse(val profiles: List<TaxInvoiceProfile> = emptyList())

@Serializable
data class ContractListResponse(val profiles: List<ContractProfile> = emptyList())

@Serializable
data class ManagerListResponse(val contacts: List<ManagerContact> = emptyList())

@Serializable
data class MobileAuthRequest(val provider: String, val token: String)

@Serializable
data class MobileAuthUser(val id: String, val email: String, val name: String? = null)

@Serializable
data class MobileAuthResponse(val token: String, val user: MobileAuthUser)

@Serializable
data class ConsentRequest(val requiredAgreed: Boolean, val marketingAgreed: Boolean)

@Serializable
data class ManagerCreateRequest(val name: String, val email: String)

@Serializable
data class ManagerDeleteRequest(val id: String)

// 세금계산서/계약서는 "기존 선택" 또는 "신규 등록" 두 형태 중 하나로 서버에 보내야 하는데,
// kotlinx.serialization의 다형성 직렬화는 기본적으로 판별 키(discriminator)를 추가로 넣어버려
// 서버가 기대하는 { "mode": "existing", "id": "..." } / { "mode": "new", "data": {...} } 형태와
// 어긋납니다. 그래서 JsonElement를 직접 조립해서 정확한 형태로 보냅니다.
@Serializable
data class SubmitRequest(
    val siteName: String,
    val clientName: String,
    val taxInvoice: JsonElement,
    val contract: JsonElement,
    val managerContactId: String,
)

@Serializable
data class EmailResult(
    val ok: Boolean,
    val reason: String? = null,
    val detail: String? = null,
)

@Serializable
data class SubmitResponse(
    val submission: Submission,
    val email: EmailResult,
    val message: String,
)

@Serializable
data class ApiErrorBody(val error: String? = null)

@Serializable
data class TaxInvoiceCreateResponse(val profile: TaxInvoiceProfile)

@Serializable
data class ContractCreateResponse(val profile: ContractProfile)

@Serializable
data class ManagerCreateResponse(val contact: ManagerContact)

@Serializable
data class OkResponse(val ok: Boolean)
