(function () {
  const form = document.getElementById("auth-form");
  const errorEl = document.getElementById("form-error");
  const titleEl = document.getElementById("auth-title");
  const submitBtn = document.getElementById("auth-submit");
  const toggleBtn = document.getElementById("auth-toggle");
  const toggleText = document.getElementById("auth-toggle-text");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  let mode = "login";
  const firebaseReady = !!(window.GC && window.GC.auth);

  if (firebaseReady) {
    window.GC.auth.onAuthStateChanged(function (user) {
      if (user) window.location.href = "issue.html";
    });
  }

  function applyMode() {
    if (mode === "login") {
      titleEl.textContent = "로그인";
      submitBtn.textContent = "로그인";
      toggleText.textContent = "계정이 없으신가요?";
      toggleBtn.textContent = "회원가입";
    } else {
      titleEl.textContent = "회원가입";
      submitBtn.textContent = "회원가입";
      toggleText.textContent = "이미 계정이 있으신가요?";
      toggleBtn.textContent = "로그인";
    }
    errorEl.textContent = "";
  }

  toggleBtn.addEventListener("click", function () {
    mode = mode === "login" ? "signup" : "login";
    applyMode();
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorEl.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      errorEl.textContent = "이메일과 비밀번호를 입력해 주세요.";
      return;
    }

    submitBtn.disabled = true;
    try {
      if (mode === "login") {
        await window.GC.auth.signInWithEmailAndPassword(email, password);
      } else {
        await window.GC.auth.createUserWithEmailAndPassword(email, password);
      }
      window.location.href = "issue.html";
    } catch (err) {
      errorEl.textContent = toKoreanError(err.code);
    } finally {
      submitBtn.disabled = false;
    }
  });

  function toKoreanError(code) {
    switch (code) {
      case "auth/invalid-email":
        return "이메일 형식이 올바르지 않습니다.";
      case "auth/user-not-found":
        return "등록되지 않은 이메일입니다.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "이메일 또는 비밀번호가 올바르지 않습니다.";
      case "auth/email-already-in-use":
        return "이미 가입된 이메일입니다.";
      case "auth/weak-password":
        return "비밀번호는 6자 이상이어야 합니다.";
      default:
        return "오류가 발생했습니다. (" + code + ")";
    }
  }

  applyMode();

  if (!firebaseReady) {
    errorEl.textContent =
      "Firebase 설정이 필요합니다. js/firebase-config.js에 프로젝트 설정을 입력해 주세요.";
    submitBtn.disabled = true;
  }
})();
