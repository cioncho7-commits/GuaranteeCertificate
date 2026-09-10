(function () {
  const { findById, toDisplayDate, isExpired } = window.GC.storage;

  const form = document.getElementById("lookup-form");
  const input = document.getElementById("query");
  const resultCard = document.getElementById("result-card");
  const emptyState = document.getElementById("empty-state");
  const notFoundState = document.getElementById("not-found-state");
  const printBtn = document.getElementById("print-btn");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const cert = findById(input.value);

    resultCard.hidden = true;
    emptyState.hidden = true;
    notFoundState.hidden = true;

    if (!cert) {
      notFoundState.hidden = false;
      return;
    }

    renderResult(cert);
    resultCard.hidden = false;
  });

  function renderResult(cert) {
    const expired = isExpired(cert.expiryDate);

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

    const badge = document.getElementById("res-badge");
    if (expired) {
      badge.textContent = "만료됨";
      badge.className = "badge badge-expired";
    } else {
      badge.textContent = "유효함";
      badge.className = "badge badge-valid";
    }
  }

  printBtn.addEventListener("click", function () {
    window.print();
  });
})();
