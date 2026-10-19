import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "APILA — Barangay Lapasan Community Programs",
    template: "%s | APILA",
  },
  description:
    "APILA is the official community program registration and participation management system for Barangay Lapasan, Cagayan de Oro City.",
  keywords: [
    "Barangay Lapasan",
    "Cagayan de Oro",
    "community programs",
    "barangay programs",
    "APILA",
    "barangay services",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
