(function () {
  const { save, generateId, addMonths, toDateInput, toDisplayDate } =
    window.GC.storage;

  const authGate = document.getElementById("auth-gate");
  const issuerInfo = document.getElementById("issuer-info");
  const form = document.getElementById("issue-form");
  const errorEl = document.getElementById("form-error");
  const formCard = document.getElementById("form-card");
  const resultCard = document.getElementById("result-card");
  const newIssueBtn = document.getElementById("new-issue-btn");
  const printBtn = document.getElementById("print-btn");

  let currentUser = null;

  if (!window.GC || !window.GC.auth) {
    authGate.textContent =
      "Firebase 설정이 필요합니다. js/firebase-config.js에 프로젝트 설정을 입력해 주세요.";
  } else {
    window.GC.auth.onAuthStateChanged(function (user) {
      if (!user) {
        window.location.href = "login.html";
        return;
      }
      currentUser = user;
      authGate.hidden = true;
      formCard.hidden = false;
      issuerInfo.textContent = "발급자: " + user.email;
    });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorEl.textContent = "";

    const data = Object.fromEntries(new FormData(form).entries());
    const required = [
      "productName",
      "serial",
      "buyerName",
      "purchaseDate",
      "warrantyMonths",
    ];
    const missing = required.find((key) => !String(data[key] || "").trim());
    if (missing) {
      errorEl.textContent = "필수 항목을 모두 입력해 주세요.";
      return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "발급 중...";

    try {
      const expiry = addMonths(data.purchaseDate, data.warrantyMonths);
      const serial = data.serial.trim();
      const cert = {
        id: generateId(),
        productName: data.productName.trim(),
        model: (data.model || "").trim(),
        serial: serial,
        serialLower: serial.toLowerCase(),
        buyerName: data.buyerName.trim(),
        buyerContact: (data.buyerContact || "").trim(),
        seller: (data.seller || "").trim(),
        purchaseDate: data.purchaseDate,
        warrantyMonths: Number(data.warrantyMonths),
        expiryDate: toDateInput(expiry),
        issuedAt: new Date().toISOString(),
        issuedBy: currentUser ? currentUser.email : "",
      };

      await save(cert);
      renderResult(cert);
      formCard.hidden = true;
      resultCard.hidden = false;
      resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      errorEl.textContent = "발급 중 오류가 발생했습니다: " + err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "보증서 발급하기";
    }
  });

  function renderResult(cert) {
    document.getElementById("res-id").textContent = cert.id;
    document.getElementById("res-product").textContent =
      cert.productName + (cert.model ? ` (${cert.model})` : "");
    document.getElementById("res-serial").textContent = cert.serial;
    document.getElementById("res-buyer").textContent =
      cert.buyerName + (cert.buyerContact ? ` · ${cert.buyerContact}` : "");
    document.getElementById("res-seller").textContent = cert.seller || "-";
    document.getElementById("res-purchase").textContent = toDisplayDate(
      cert.purchaseDate
    );
    document.getElementById("res-expiry").textContent = toDisplayDate(
      cert.expiryDate
    );
    document.getElementById(
      "res-period"
    ).textContent = `${cert.warrantyMonths}개월`;
  }

  newIssueBtn.addEventListener("click", function () {
    form.reset();
    resultCard.hidden = true;
    formCard.hidden = false;
  });

  printBtn.addEventListener("click", function () {
    window.print();
  });
})();
