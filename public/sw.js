self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // 오프라인 캐싱 없이, 설치형 웹앱(PWA) 조건 충족을 위한 최소 서비스워커
});
