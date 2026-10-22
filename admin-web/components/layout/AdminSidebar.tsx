"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  Users,
  ClipboardCheck,
  UserCheck,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import { useAdminProfile } from "@/lib/context/AdminProfileContext";

const mainNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  {
    href: "/admin/registrations",
    label: "Registrations",
    icon: ClipboardCheck,
  },
  { href: "/admin/attendance", label: "Attendance", icon: UserCheck },
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
  { href: "/admin/residents", label: "Residents", icon: Users },
];

const secondaryNavItems = [
  { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Account & Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { profile } = useAdminProfile();

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-[#ECE7DF] flex flex-col justify-between p-5 selection:bg-[#F45113]/15 selection:text-[#F45113] flex-shrink-0 overflow-y-auto">
      <div className="space-y-6">
        {/* Brand Header (Concept from reference: Clean grid icon + App name) */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-[#F45113] flex items-center justify-center shadow-md shadow-orange-500/20">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-[#0F172A] leading-none">
              APILA
            </h1>
            <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mt-0.5">
              Admin Console
            </p>
          </div>
        </div>

        {/* Profile Card (Matching reference top-left user badge) */}
        <div className="p-3 rounded-2xl bg-[#FFF9F3] border border-[#ECE7DF] flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F45113] to-[#FB923C] p-[2px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#F45113]">
                {profile.initials}
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#0F172A] truncate">{profile.name}</p>
            <p className="text-[10px] text-[#64748B] truncate">{profile.role}</p>
          </div>
          <ShieldCheck className="w-4 h-4 text-[#F45113] flex-shrink-0" />
        </div>

        {/* Main Navigation (Pill-shaped items matching reference) */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Main Menu
          </p>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#F45113] text-white shadow-sm shadow-orange-500/25"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFF9F3]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#94A3B8]"}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Management & Tools */}
        <div className="space-y-1 pt-2">
          <p className="px-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">
            Insights & Tools
          </p>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#F45113] text-white shadow-sm shadow-orange-500/25"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFF9F3]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#94A3B8]"}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Area: Sign Out & Status */}
      <div className="pt-4 border-t border-[#ECE7DF] space-y-2">
        <div className="px-3 py-2 rounded-xl bg-[#FFF9F3] border border-[#ECE7DF]/70 flex items-center justify-between text-[11px] text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Portal Online
          </span>
          <span className="font-mono text-[10px]">Lapasan</span>
        </div>

        <Link
          href="/admin/login"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-red-600 hover:bg-red-50/60 transition-colors"
        >
          <LogOut className="w-4 h-4 text-[#94A3B8]" />
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
