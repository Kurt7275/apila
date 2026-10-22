"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import { AdminProfileProvider } from "@/lib/context/AdminProfileContext";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes("/login");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AdminProfileProvider>
      <div className="flex h-screen overflow-hidden bg-[#FFF9F3] text-[#0F172A] selection:bg-[#F45113]/15 selection:text-[#F45113]">
        <AdminSidebar />
        <main className="flex-1 h-screen overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </AdminProfileProvider>
  );
}
