import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerLocale } from "@/lib/i18n/getServerLocale";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VFBCAI | 베트남 외국인 비즈니스 검증·등록 AI 센터",
  description:
    "확인하고, 검증하고, 등록하고, 보호합니다. Check. Verify. Register. Protect. 베트남 체류·사업을 위한 AI 행정 진단 플랫폼, VFBCAI.",
};

/** Mobile: device-width로 렌더 (PC 레이아웃 축소 표시 방지) */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * CSS 로드 전 PC 전용 넓은 표가 잠깐 보이면 iOS가 페이지를 축소함.
 * Tailwind `hidden sm:block`만으로는 FOUC 구간에 숨김이 보장되지 않음.
 */
const CRITICAL_MOBILE_CSS = `
html,body{max-width:100%;overflow-x:hidden;-webkit-text-size-adjust:100%}
@media (max-width:639.98px){.check-pc-only{display:none!important}}
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_MOBILE_CSS }} />
      </head>
      <body className="min-h-full flex flex-col">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
