package com.guaranteecert.app.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "auth")

private val KEY_TOKEN = stringPreferencesKey("app_token")
private val KEY_EMAIL = stringPreferencesKey("user_email")
private val KEY_NAME = stringPreferencesKey("user_name")

class TokenStore(private val context: Context) {

    val tokenFlow: Flow<String?> = context.dataStore.data.map { it[KEY_TOKEN] }
    val emailFlow: Flow<String?> = context.dataStore.data.map { it[KEY_EMAIL] }
    val nameFlow: Flow<String?> = context.dataStore.data.map { it[KEY_NAME] }

    suspend fun currentToken(): String? = context.dataStore.data.first()[KEY_TOKEN]

    suspend fun save(token: String, email: String, name: String?) {
        context.dataStore.edit { prefs ->
            prefs[KEY_TOKEN] = token
            prefs[KEY_EMAIL] = email
            prefs[KEY_NAME] = name ?: email
        }
    }

    suspend fun clear() {
        context.dataStore.edit { it.clear() }
    }
}
