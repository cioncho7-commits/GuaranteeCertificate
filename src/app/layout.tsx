import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "건설기계 대여대금 지급보증서",
  description: "건설기계 대여대금 지급보증서 발급 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
