import type { CapacitorConfig } from "@capacitor/cli";

const PRODUCTION_URL = "https://machinsure.com";

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
