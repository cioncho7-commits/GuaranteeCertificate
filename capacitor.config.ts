import type { CapacitorConfig } from "@capacitor/cli";

// TODO: server.url을 실제 배포된 프로덕션 주소로 교체하세요.
// (예: https://guarantee-certificate.vercel.app 또는 연결한 커스텀 도메인)
const PRODUCTION_URL = "https://REPLACE-WITH-PRODUCTION-URL";

const config: CapacitorConfig = {
  appId: "com.guaranteecert.app",
  appName: "한북지회",
  webDir: "www",
  server: {
    url: PRODUCTION_URL,
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
