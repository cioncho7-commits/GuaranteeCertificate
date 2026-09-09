package com.guaranteecert.app.ui.nav

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.guaranteecert.app.AppContainer
import com.guaranteecert.app.ui.consent.ConsentScreen
import com.guaranteecert.app.ui.form.FormScreen
import com.guaranteecert.app.ui.login.LoginScreen
import com.guaranteecert.app.ui.settings.SettingsScreen

object Routes {
    const val LOGIN = "login"
    const val CONSENT = "consent"
    const val FORM = "form"
    const val SETTINGS = "settings"
}

@Composable
fun AppNavHost(container: AppContainer) {
    // 앱 시작 시 저장된 로그인 토큰이 있는지 확인해서 시작 화면을 정합니다.
    val startDestination by produceState<String?>(initialValue = null) {
        value = if (container.authRepository.isLoggedIn()) Routes.FORM else Routes.LOGIN
    }

    val resolvedStart = startDestination
    if (resolvedStart == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = resolvedStart) {
        composable(Routes.LOGIN) {
            LoginScreen(
                container = container,
                onLoggedIn = {
                    navController.navigate(Routes.CONSENT) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                },
            )
        }
        composable(Routes.CONSENT) {
            ConsentScreen(
                container = container,
                onAgreed = {
                    navController.navigate(Routes.FORM) {
                        popUpTo(Routes.CONSENT) { inclusive = true }
                    }
                },
                onAlreadyAgreed = {
                    navController.navigate(Routes.FORM) {
                        popUpTo(Routes.CONSENT) { inclusive = true }
                    }
                },
            )
        }
        composable(Routes.FORM) {
            FormScreen(
                container = container,
                onOpenSettings = { navController.navigate(Routes.SETTINGS) },
                onLoggedOut = {
                    navController.navigate(Routes.LOGIN) {
                        popUpTo(0) { inclusive = true }
                    }
                },
            )
        }
        composable(Routes.SETTINGS) {
            SettingsScreen(
                container = container,
                onBack = { navController.popBackStack() },
            )
        }
    }
}
