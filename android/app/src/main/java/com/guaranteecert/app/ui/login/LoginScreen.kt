package com.guaranteecert.app.ui.login

import android.app.Activity
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.guaranteecert.app.AppContainer
import com.guaranteecert.app.ui.theme.Amber400
import com.guaranteecert.app.ui.theme.Blue700
import com.guaranteecert.app.ui.theme.Slate500
import com.guaranteecert.app.ui.theme.Slate900

@Composable
fun LoginScreen(container: AppContainer, onLoggedIn: () -> Unit) {
    val viewModel: LoginViewModel = viewModel(
        factory = viewModelFactory {
            initializer { LoginViewModel(container.authRepository, container.socialProviders) }
        },
    )
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val activity = context as? Activity

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        LogoMark()

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "건설기계 대여대금\n지급보증서",
            style = MaterialTheme.typography.titleLarge,
            textAlign = TextAlign.Center,
            color = Slate900,
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "현장 정보를 등록하고 담당자에게 바로 알려드립니다",
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
            color = Slate500,
        )

        Spacer(modifier = Modifier.height(32.dp))

        ProviderButton(
            label = "네이버 로그인",
            containerColor = Color(0xFF03C75A),
            contentColor = Color.White,
            loading = uiState.loadingProvider == "naver",
            enabled = uiState.loadingProvider == null,
            onClick = { activity?.let { viewModel.login("naver", it, onLoggedIn) } },
        )
        Spacer(modifier = Modifier.height(12.dp))
        ProviderButton(
            label = "구글 로그인",
            containerColor = Color.White,
            contentColor = Slate900,
            outlined = true,
            loading = uiState.loadingProvider == "google",
            enabled = uiState.loadingProvider == null,
            onClick = { activity?.let { viewModel.login("google", it, onLoggedIn) } },
        )
        Spacer(modifier = Modifier.height(12.dp))
        ProviderButton(
            label = "카카오 로그인",
            containerColor = Amber400,
            contentColor = Color(0xFF191600),
            loading = uiState.loadingProvider == "kakao",
            enabled = uiState.loadingProvider == null,
            onClick = { activity?.let { viewModel.login("kakao", it, onLoggedIn) } },
        )

        uiState.errorMessage?.let { message ->
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = message,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Composable
private fun LogoMark() {
    Box(
        modifier = Modifier
            .size(72.dp)
            .background(Blue700, RoundedCornerShape(18.dp)),
        contentAlignment = Alignment.Center,
    ) {
        Text(text = "보", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun ProviderButton(
    label: String,
    containerColor: Color,
    contentColor: Color,
    loading: Boolean,
    enabled: Boolean,
    outlined: Boolean = false,
    onClick: () -> Unit,
) {
    val shape = RoundedCornerShape(12.dp)
    val content: @Composable () -> Unit = {
        if (loading) {
            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = contentColor, strokeWidth = 2.dp)
        } else {
            Text(text = label, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
        }
    }

    if (outlined) {
        OutlinedButton(
            onClick = onClick,
            enabled = enabled,
            shape = shape,
            modifier = Modifier.fillMaxWidth().height(52.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = contentColor),
        ) { content() }
    } else {
        Button(
            onClick = onClick,
            enabled = enabled,
            shape = shape,
            modifier = Modifier.fillMaxWidth().height(52.dp),
            colors = ButtonDefaults.buttonColors(containerColor = containerColor, contentColor = contentColor),
        ) { content() }
    }
}
