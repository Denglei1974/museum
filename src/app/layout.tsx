import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "博物馆志愿者服务系统",
  description: "博物馆志愿者管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="relative min-h-screen max-w-lg mx-auto shadow-2xl bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
