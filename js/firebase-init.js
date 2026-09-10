// Firebase 앱/인증/DB 초기화. 다른 스크립트보다 먼저, firebase-config.js 다음에 로드되어야 합니다.
window.GC = window.GC || {};

(function () {
  if (!window.firebase || !window.FIREBASE_CONFIG) {
    console.error("Firebase SDK 또는 설정을 불러오지 못했습니다.");
    return;
  }

  firebase.initializeApp(window.FIREBASE_CONFIG);
  window.GC.auth = firebase.auth();
  window.GC.db = firebase.firestore();
})();
