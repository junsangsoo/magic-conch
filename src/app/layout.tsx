import type { Metadata } from "next";
import { Jua } from "next/font/google";
import "./globals.css";

const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jua",
});

export const metadata: Metadata = {
  title: "마법의 소라고둥 | 밥약 추천",
  description: "어디서 뭐 먹을지 고민될 땐, 마법의 소라고둥에게 물어봐!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={jua.variable}>
      <body className={jua.className}>{children}</body>
    </html>
  );
}
