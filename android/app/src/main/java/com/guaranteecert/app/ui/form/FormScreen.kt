package com.guaranteecert.app.ui.form

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExposedDropdownMenu
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.Icon
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.guaranteecert.app.AppContainer
import com.guaranteecert.app.data.ProfileChoice
import com.guaranteecert.app.data.model.ContractProfile
import com.guaranteecert.app.data.model.ManagerContact
import com.guaranteecert.app.data.model.NewContractData
import com.guaranteecert.app.data.model.NewTaxInvoiceData
import com.guaranteecert.app.data.model.TaxInvoiceProfile
import com.guaranteecert.app.ui.theme.Blue700
import com.guaranteecert.app.ui.theme.Emerald50
import com.guaranteecert.app.ui.theme.Emerald700
import com.guaranteecert.app.ui.theme.Slate500

private enum class Mode { SELECT, NEW }

@Composable
fun FormScreen(container: AppContainer, onOpenSettings: () -> Unit, onLoggedOut: () -> Unit) {
    val viewModel: FormViewModel = viewModel(
        factory = viewModelFactory {
            initializer { FormViewModel(container.formRepository, container.authRepository) }
        },
    )
    val uiState by viewModel.uiState.collectAsState()

    var siteName by remember { mutableStateOf("") }
    var clientName by remember { mutableStateOf("") }

    var taxMode by remember { mutableStateOf(Mode.NEW) }
    var selectedTaxId by remember { mutableStateOf<String?>(null) }
    var lesseeName by remember { mutableStateOf("") }
    var lessorCompanyName by remember { mutableStateOf("") }
    var lessorRepName by remember { mutableStateOf("") }
    var vehicleNumber by remember { mutableStateOf("") }
    var businessRegNumber by remember { mutableStateOf("") }
    var repPhone by remember { mutableStateOf("") }

    var contractMode by remember { mutableStateOf(Mode.NEW) }
    var selectedContractId by remember { mutableStateOf<String?>(null) }
    var periodStart by remember { mutableStateOf("") }
    var periodEnd by remember { mutableStateOf("") }
    var unitPrice by remember { mutableStateOf("") }
    var paymentDueTerms by remember { mutableStateOf("") }

    var selectedManagerId by remember { mutableStateOf<String?>(null) }

    // 목록이 로드되면 기본 선택값과 모드를 채워줍니다.
    androidx.compose.runtime.LaunchedEffect(uiState.taxInvoiceProfiles, uiState.contractProfiles, uiState.managerContacts) {
        if (uiState.taxInvoiceProfiles.isNotEmpty() && selectedTaxId == null) {
            selectedTaxId = uiState.taxInvoiceProfiles.first().id
            taxMode = Mode.SELECT
        }
        if (uiState.contractProfiles.isNotEmpty() && selectedContractId == null) {
            selectedContractId = uiState.contractProfiles.first().id
            contractMode = Mode.SELECT
        }
        if (uiState.managerContacts.isNotEmpty() && selectedManagerId == null) {
            selectedManagerId = uiState.managerContacts.first().id
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("건설기계 대여대금", style = MaterialTheme.typography.titleLarge)
                Text("지급보증서 등록", style = MaterialTheme.typography.titleLarge)
            }
            TextButton(onClick = onOpenSettings) { Text("담당자 설정") }
        }

        if (uiState.loading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
                CircularProgressIndicator()
            }
            return@Column
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Section(title = "1. 현장 정보") {
                LabeledField("현장명", siteName, { siteName = it }, "예: OO아파트 신축공사")
                LabeledField("원청명", clientName, { clientName = it }, "예: OO건설(주)")
            }

            Section(title = "2. 세금계산서 등록") {
                ModeToggle(
                    mode = taxMode,
                    onChange = { taxMode = it },
                    hasSaved = uiState.taxInvoiceProfiles.isNotEmpty(),
                    selectLabel = "등록된 정보 불러오기",
                )
                if (taxMode == Mode.SELECT) {
                    TaxInvoiceDropdown(
                        profiles = uiState.taxInvoiceProfiles,
                        selectedId = selectedTaxId,
                        onSelect = { selectedTaxId = it },
                    )
                } else {
                    LabeledField("건설기계임차인명", lesseeName, { lesseeName = it })
                    LabeledField("건설기계임대인명 (회사명)", lessorCompanyName, { lessorCompanyName = it }, "사업자등록증상 회사명")
                    LabeledField("건설기계임대인명 (대표자명)", lessorRepName, { lessorRepName = it })
                    LabeledField("차량번호", vehicleNumber, { vehicleNumber = it }, "예: 12가 3456")
                    LabeledField("사업자등록번호", businessRegNumber, { businessRegNumber = it }, "000-00-00000")
                    LabeledField("대표자 휴대폰번호", repPhone, { repPhone = it }, "010-0000-0000")
                }
            }

            Section(title = "3. 계약서 등록") {
                ModeToggle(
                    mode = contractMode,
                    onChange = { contractMode = it },
                    hasSaved = uiState.contractProfiles.isNotEmpty(),
                    selectLabel = "등록된 계약서 불러오기",
                )
                if (contractMode == Mode.SELECT) {
                    ContractDropdown(
                        profiles = uiState.contractProfiles,
                        selectedId = selectedContractId,
                        onSelect = { selectedContractId = it },
                    )
                } else {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Box(modifier = Modifier.weight(1f)) {
                            LabeledField("계약기간 시작(YYYY-MM-DD)", periodStart, { periodStart = it })
                        }
                        Box(modifier = Modifier.weight(1f)) {
                            LabeledField("계약기간 종료(YYYY-MM-DD)", periodEnd, { periodEnd = it })
                        }
                    }
                    LabeledField("단가", unitPrice, { unitPrice = it }, "예: 시간당 55,000원")
                    LabeledField("결제기한", paymentDueTerms, { paymentDueTerms = it }, "예: 익월 10일")
                }
            }

            Section(title = "4. 담당자") {
                if (uiState.managerContacts.isEmpty()) {
                    Text(
                        "등록된 담당자가 없습니다. 담당자 설정에서 먼저 등록해 주세요.",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                } else {
                    ManagerDropdown(
                        contacts = uiState.managerContacts,
                        selectedId = selectedManagerId,
                        onSelect = { selectedManagerId = it },
                    )
                }
            }

            uiState.outcome?.let { outcome ->
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = if (outcome.ok) Emerald50 else MaterialTheme.colorScheme.errorContainer,
                    ),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            outcome.title,
                            color = if (outcome.ok) Emerald700 else MaterialTheme.colorScheme.onErrorContainer,
                            style = MaterialTheme.typography.titleMedium,
                        )
                        Text(
                            outcome.detail,
                            color = if (outcome.ok) Emerald700 else MaterialTheme.colorScheme.onErrorContainer,
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
            }

            Button(
                onClick = {
                    val taxChoice = if (taxMode == Mode.SELECT && selectedTaxId != null) {
                        ProfileChoice.Existing(selectedTaxId!!)
                    } else {
                        ProfileChoice.New(
                            NewTaxInvoiceData(
                                lesseeName, lessorCompanyName, lessorRepName,
                                vehicleNumber, businessRegNumber, repPhone,
                            ),
                        )
                    }
                    val contractChoice = if (contractMode == Mode.SELECT && selectedContractId != null) {
                        ProfileChoice.Existing(selectedContractId!!)
                    } else {
                        ProfileChoice.New(NewContractData(periodStart, periodEnd, unitPrice, paymentDueTerms))
                    }
                    viewModel.submit(siteName, clientName, taxChoice, contractChoice, selectedManagerId.orEmpty())
                },
                enabled = !uiState.submitting && uiState.managerContacts.isNotEmpty(),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Blue700),
                modifier = Modifier.fillMaxWidth().height(56.dp),
            ) {
                if (uiState.submitting) {
                    CircularProgressIndicator(modifier = Modifier.height(20.dp), color = MaterialTheme.colorScheme.onPrimary)
                } else {
                    Text("송신", style = MaterialTheme.typography.titleMedium)
                }
            }

            TextButton(
                onClick = { viewModel.logout(onLoggedOut) },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("로그아웃") }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun Section(title: String, content: @Composable androidx.compose.foundation.layout.ColumnScope.() -> Unit) {
    Card(shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors()) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            content()
        }
    }
}

@Composable
private fun LabeledField(
    label: String,
    value: String,
    onChange: (String) -> Unit,
    placeholder: String? = null,
) {
    Column {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = Slate500)
        Spacer(modifier = Modifier.height(4.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onChange,
            placeholder = placeholder?.let { { Text(it) } },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun ModeToggle(mode: Mode, onChange: (Mode) -> Unit, hasSaved: Boolean, selectLabel: String) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Button(
            onClick = { onChange(Mode.SELECT) },
            enabled = hasSaved,
            modifier = Modifier.weight(1f),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (mode == Mode.SELECT) Blue700 else MaterialTheme.colorScheme.surfaceVariant,
                contentColor = if (mode == Mode.SELECT) androidx.compose.ui.graphics.Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
            ),
        ) { Text(selectLabel, textAlign = TextAlign.Center) }
        Button(
            onClick = { onChange(Mode.NEW) },
            modifier = Modifier.weight(1f),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (mode == Mode.NEW) Blue700 else MaterialTheme.colorScheme.surfaceVariant,
                contentColor = if (mode == Mode.NEW) androidx.compose.ui.graphics.Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
            ),
        ) { Text("신규 등록") }
    }
}

@Composable
private fun TaxInvoiceDropdown(
    profiles: List<TaxInvoiceProfile>,
    selectedId: String?,
    onSelect: (String) -> Unit,
) {
    val selected = profiles.find { it.id == selectedId }
    SimpleDropdown(
        label = "등록된 세금계산서 정보",
        selectedText = selected?.let { "${it.lessorCompanyName} / ${it.vehicleNumber} (임차인 ${it.lesseeName})" } ?: "",
        options = profiles.map { it.id to "${it.lessorCompanyName} / ${it.vehicleNumber} (임차인 ${it.lesseeName})" },
        onSelect = onSelect,
    )
}

@Composable
private fun ContractDropdown(
    profiles: List<ContractProfile>,
    selectedId: String?,
    onSelect: (String) -> Unit,
) {
    val selected = profiles.find { it.id == selectedId }
    SimpleDropdown(
        label = "등록된 계약서",
        selectedText = selected?.let { "${it.periodStart} ~ ${it.periodEnd} / 단가 ${it.unitPrice}" } ?: "",
        options = profiles.map { it.id to "${it.periodStart} ~ ${it.periodEnd} / 단가 ${it.unitPrice}" },
        onSelect = onSelect,
    )
}

@Composable
private fun ManagerDropdown(
    contacts: List<ManagerContact>,
    selectedId: String?,
    onSelect: (String) -> Unit,
) {
    val selected = contacts.find { it.id == selectedId }
    SimpleDropdown(
        label = "발송 대상 담당자",
        selectedText = selected?.let { "${it.name} (${it.email})" } ?: "",
        options = contacts.map { it.id to "${it.name} (${it.email})" },
        onSelect = onSelect,
    )
}

@Composable
private fun SimpleDropdown(
    label: String,
    selectedText: String,
    options: List<Pair<String, String>>,
    onSelect: (String) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }
    Column {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = Slate500)
        Spacer(modifier = Modifier.height(4.dp))
        ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
            OutlinedTextField(
                value = selectedText,
                onValueChange = {},
                readOnly = true,
                trailingIcon = { Icon(Icons.Filled.ArrowDropDown, contentDescription = null) },
                modifier = Modifier.fillMaxWidth().menuAnchor(),
            )
            ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                options.forEach { (id, text) ->
                    DropdownMenuItem(text = { Text(text) }, onClick = { onSelect(id); expanded = false })
                }
            }
        }
    }
}
