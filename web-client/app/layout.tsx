import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../components/AppShell";
import { ThemeProvider } from "../components/ThemeProvider";
import { CurrencyProvider } from "../context/CurrencyContext";

export const metadata: Metadata = {
  title: "Enterprise E-Commerce Platform v2.0",
  description: "Distributed Microservices Architecture with Apache Kafka SAGA, MongoDB Atlas, Redis 7 & Next.js 14 RTL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CurrencyProvider>
            <AppShell>{children}</AppShell>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
