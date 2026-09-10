// 네비게이션의 로그인/로그아웃 링크(#nav-auth)를 로그인 상태에 맞춰 갱신합니다.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const link = document.getElementById("nav-auth");
    if (!link || !window.GC || !window.GC.auth) return;

    window.GC.auth.onAuthStateChanged(function (user) {
      if (user) {
        link.textContent = "로그아웃";
        link.href = "#";
        link.onclick = function (e) {
          e.preventDefault();
          window.GC.auth.signOut().then(function () {
            window.location.href = "index.html";
          });
        };
      } else {
        link.textContent = "로그인";
        link.href = "login.html";
        link.onclick = null;
      }
    });
  });
})();
