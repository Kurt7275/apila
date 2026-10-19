import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "APILA Admin Portal — Barangay Lapasan",
    template: "%s | APILA Admin",
  },
  description:
    "APILA Barangay Personnel Dashboard — authorized staff only. Manage programs, registrations, attendance, and civic reports for Barangay Lapasan.",
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
