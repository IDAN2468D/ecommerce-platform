import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../components/AppShell";

export const metadata: Metadata = {
  title: "E-Commerce Enterprise Platform",
  description: "Next.js 14 App Router Storefront with Apache Kafka SAGA Architecture and Live SSE Notifications",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
