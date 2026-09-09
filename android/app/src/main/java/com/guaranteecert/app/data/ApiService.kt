package com.guaranteecert.app.data

import com.guaranteecert.app.data.model.ConsentRequest
import com.guaranteecert.app.data.model.ConsentResponse
import com.guaranteecert.app.data.model.ContractCreateResponse
import com.guaranteecert.app.data.model.ContractListResponse
import com.guaranteecert.app.data.model.ManagerCreateRequest
import com.guaranteecert.app.data.model.ManagerCreateResponse
import com.guaranteecert.app.data.model.ManagerDeleteRequest
import com.guaranteecert.app.data.model.ManagerListResponse
import com.guaranteecert.app.data.model.MobileAuthRequest
import com.guaranteecert.app.data.model.MobileAuthResponse
import com.guaranteecert.app.data.model.NewContractData
import com.guaranteecert.app.data.model.NewTaxInvoiceData
import com.guaranteecert.app.data.model.OkResponse
import com.guaranteecert.app.data.model.SubmitRequest
import com.guaranteecert.app.data.model.SubmitResponse
import com.guaranteecert.app.data.model.TaxInvoiceCreateResponse
import com.guaranteecert.app.data.model.TaxInvoiceListResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.HTTP
import retrofit2.http.POST

interface ApiService {

    @POST("api/mobile/auth")
    suspend fun mobileAuth(@Body body: MobileAuthRequest): Response<MobileAuthResponse>

    @GET("api/consent")
    suspend fun getConsent(): Response<ConsentResponse>

    @POST("api/consent")
    suspend fun postConsent(@Body body: ConsentRequest): Response<ConsentResponse>

    @GET("api/profiles/tax-invoice")
    suspend fun listTaxInvoiceProfiles(): Response<TaxInvoiceListResponse>

    @POST("api/profiles/tax-invoice")
    suspend fun createTaxInvoiceProfile(@Body body: NewTaxInvoiceData): Response<TaxInvoiceCreateResponse>

    @GET("api/profiles/contract")
    suspend fun listContractProfiles(): Response<ContractListResponse>

    @POST("api/profiles/contract")
    suspend fun createContractProfile(@Body body: NewContractData): Response<ContractCreateResponse>

    @GET("api/manager")
    suspend fun listManagerContacts(): Response<ManagerListResponse>

    @POST("api/manager")
    suspend fun createManagerContact(@Body body: ManagerCreateRequest): Response<ManagerCreateResponse>

    @HTTP(method = "DELETE", path = "api/manager", hasBody = true)
    suspend fun deleteManagerContact(@Body body: ManagerDeleteRequest): Response<OkResponse>

    @POST("api/submit")
    suspend fun submit(@Body body: SubmitRequest): Response<SubmitResponse>
}
