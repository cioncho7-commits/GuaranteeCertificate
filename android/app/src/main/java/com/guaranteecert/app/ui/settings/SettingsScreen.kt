package com.guaranteecert.app.ui.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.guaranteecert.app.AppContainer
import com.guaranteecert.app.ui.theme.Blue700
import com.guaranteecert.app.ui.theme.Red600
import com.guaranteecert.app.ui.theme.Slate500

@Composable
fun SettingsScreen(container: AppContainer, onBack: () -> Unit) {
    val viewModel: SettingsViewModel = viewModel(
        factory = viewModelFactory {
            initializer { SettingsViewModel(container.formRepository) }
        },
    )
    val uiState by viewModel.uiState.collectAsState()

    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxWidth().padding(20.dp)) {
        TextButton(onClick = onBack) { Text("← 입력 화면으로") }
        Text("담당자 설정", style = MaterialTheme.typography.titleLarge)
        Text(
            "송신 시 정보를 받을 담당자의 이메일 주소를 등록하세요.",
            style = MaterialTheme.typography.bodyMedium,
            color = Slate500,
        )

        Spacer(modifier = Modifier.height(16.dp))

        Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors()) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("담당자 이름") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("이메일 주소") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                uiState.errorMessage?.let {
                    Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
                }
                Button(
                    onClick = {
                        viewModel.addContact(name.trim(), email.trim())
                        name = ""
                        email = ""
                    },
                    enabled = !uiState.saving && name.isNotBlank() && email.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = Blue700),
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                ) { Text("담당자 등록") }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (!uiState.loading && uiState.contacts.isEmpty()) {
            Text(
                "등록된 담당자가 없습니다.",
                color = Slate500,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(16.dp),
            )
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(uiState.contacts) { contact ->
                Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors()) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(contact.name, style = MaterialTheme.typography.titleMedium)
                            Text(contact.email, style = MaterialTheme.typography.bodyMedium, color = Slate500)
                        }
                        TextButton(onClick = { viewModel.deleteContact(contact.id) }) {
                            Text("삭제", color = Red600)
                        }
                    }
                }
            }
        }
    }
}
