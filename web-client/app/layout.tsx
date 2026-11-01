import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../components/AppShell";
import { ThemeProvider } from "../components/ThemeProvider";
import { CurrencyProvider } from "../context/CurrencyContext";

export const metadata: Metadata = {
  title: "Store 2026 • חנות מוצרי פרימיום וטכנולוגיה",
  description: "חנות אלקטרוניקה וטכנולוגיה פרימיום עם משלוח מהיר עד הבית, 5% Cashback לחברי מועדון ואחריות יבואן רשמי",
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
