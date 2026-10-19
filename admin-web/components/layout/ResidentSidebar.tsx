"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Bell,
  User,
  Building2,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/resident/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resident/programs", label: "Browse Programs", icon: BookOpen },
  {
    href: "/resident/my-registrations",
    label: "My Registrations",
    icon: ClipboardList,
  },
  {
    href: "/resident/notifications",
    label: "Notifications",
    icon: Bell,
    badge: 3,
  },
  { href: "/resident/profile", label: "My Profile", icon: User },
];

export default function ResidentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Header */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">APILA</p>
            <p className="text-[10px] text-white/50 leading-none">Resident Portal</p>
          </div>
        </Link>
      </div>

      {/* Resident Info */}
      <div className="px-5 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <User className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Jose Lapasan</p>
            <p className="text-xs text-white/50">Purok 2 · Verified</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && !isActive && (
                <Badge className="h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-[10px]">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Website</span>
        </Link>
        <Link
          href="/resident/login"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
