import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegister from "./PwaRegister";

export const metadata: Metadata = {
  title: "한북지회 온라인 사업단",
  description: "건설기계 대여대금 지급보증서 발급 관리 시스템",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "한북지회",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
