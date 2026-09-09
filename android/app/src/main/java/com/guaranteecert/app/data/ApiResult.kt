package com.guaranteecert.app.data

import com.guaranteecert.app.data.model.ApiErrorBody
import kotlinx.serialization.json.Json
import retrofit2.Response

sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Failure(val message: String) : ApiResult<Nothing>()
}

private val errorJson = Json { ignoreUnknownKeys = true }

suspend fun <T> safeCall(block: suspend () -> Response<T>): ApiResult<T> {
    return try {
        val response = block()
        val body = response.body()
        if (response.isSuccessful && body != null) {
            ApiResult.Success(body)
        } else {
            val errorText = response.errorBody()?.string()
            val message = errorText?.let {
                runCatching { errorJson.decodeFromString(ApiErrorBody.serializer(), it).error }
                    .getOrNull()
            } ?: "요청을 처리하지 못했습니다. (HTTP ${response.code()})"
            ApiResult.Failure(message)
        }
    } catch (e: Exception) {
        ApiResult.Failure(e.message ?: "네트워크 오류가 발생했습니다.")
    }
}
