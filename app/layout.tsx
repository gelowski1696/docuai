import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { RouteTransitionIndicator } from "@/components/route-transition-indicator";
import { PersistentNavbar } from "@/components/persistent-navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocuAI | Enterprise AI Document Workspace",
  description: "Transform your data into professional, stunning documents with state-of-the-art AI. Generate Invoices, Reports, and Memos in seconds.",
  keywords: ["AI", "Document Generation", "Invoice Generator", "Business Reports", "Automation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <PersistentNavbar />
          <Suspense fallback={null}>
            <RouteTransitionIndicator />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
