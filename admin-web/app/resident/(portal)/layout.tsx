import ResidentSidebar from "@/components/layout/ResidentSidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <ResidentSidebar />
      <main className="flex-1 bg-muted/30 overflow-y-auto">{children}</main>
    </div>
  );
}
