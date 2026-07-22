import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "손희정 | 전략기획 포트폴리오",
  description:
    "복잡한 신호를 실행 가능한 전략으로 전환하는 전략기획 포트폴리오입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
