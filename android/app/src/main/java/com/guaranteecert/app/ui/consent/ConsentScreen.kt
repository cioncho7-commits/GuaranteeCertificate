package com.guaranteecert.app.ui.consent

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import com.guaranteecert.app.ui.theme.Slate500

@Composable
fun ConsentScreen(
    container: AppContainer,
    onAgreed: () -> Unit,
    onAlreadyAgreed: () -> Unit,
) {
    val viewModel: ConsentViewModel = viewModel(
        factory = viewModelFactory {
            initializer { ConsentViewModel(container.formRepository) }
        },
    )
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.alreadyAgreed, uiState.checking) {
        if (!uiState.checking && uiState.alreadyAgreed) {
            onAlreadyAgreed()
        }
    }

    if (uiState.checking || uiState.alreadyAgreed) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    var requiredChecked by remember { mutableStateOf(false) }
    var marketingChecked by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Text(text = "개인정보 수집 및 이용 동의", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "서비스 이용을 위해 아래 내용에 동의해 주세요.",
            style = MaterialTheme.typography.bodyMedium,
            color = Slate500,
        )

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
            shape = RoundedCornerShape(16.dp),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                ConsentSection("1. 수집 항목 (필수)", "이름, 이메일, 로그인 계정 식별정보")
                Spacer(modifier = Modifier.height(12.dp))
                ConsentSection(
                    "2. 수집·이용 목적 (필수)",
                    "건설기계 대여대금 지급보증서 발급, 현장/계약 정보 등록 및 담당자 이메일 발송",
                )
                Spacer(modifier = Modifier.height(12.dp))
                ConsentSection("3. 보유·이용 기간 (필수)", "회원 탈퇴 시 또는 목적 달성 후 지체 없이 파기")
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = requiredChecked, onCheckedChange = { requiredChecked = it })
            Text(text = "(필수) 개인정보 수집 및 이용에 동의합니다.", style = MaterialTheme.typography.bodyMedium)
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = marketingChecked, onCheckedChange = { marketingChecked = it })
            Text(text = "(선택) 서비스 안내 및 이벤트 정보 수신에 동의합니다.", style = MaterialTheme.typography.bodyMedium)
        }

        uiState.errorMessage?.let {
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = { viewModel.agree(marketingChecked, onAgreed) },
            enabled = requiredChecked && !uiState.submitting,
            shape = RoundedCornerShape(12.dp),
            colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = Blue700),
            modifier = Modifier.fillMaxWidth().height(52.dp),
        ) {
            if (uiState.submitting) {
                CircularProgressIndicator(modifier = Modifier.height(20.dp), color = MaterialTheme.colorScheme.onPrimary)
            } else {
                Text("동의하고 계속하기")
            }
        }
    }
}

@Composable
private fun ConsentSection(title: String, body: String) {
    Text(text = title, style = MaterialTheme.typography.titleMedium)
    Text(text = body, style = MaterialTheme.typography.bodyMedium, color = Slate500)
}
