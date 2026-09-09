package com.guaranteecert.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.guaranteecert.app.ui.nav.AppNavHost
import com.guaranteecert.app.ui.theme.GuaranteeCertTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val container = (application as GuaranteeCertApp).container

        setContent {
            GuaranteeCertTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    AppNavHost(container = container)
                }
            }
        }
    }
}
