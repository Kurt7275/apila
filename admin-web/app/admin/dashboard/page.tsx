"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Users,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  Radio,
  Share2,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Building,
} from "lucide-react";
import { mockPrograms } from "@/lib/mock-data/programs";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { useAdminProfile } from "@/lib/context/AdminProfileContext";

export default function AdminDashboardPage() {
  const { profile } = useAdminProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"MONTH" | "WEEK" | "PLANNER">("MONTH");
  const [currentDate, setCurrentDate] = useState({
    time: "08:48 AM",
    day: "MON",
    date: "19 OCT",
  });
  const [selectedDay, setSelectedDay] = useState(19);

  // Live clock simulation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const dayStr = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      const dateStr = now.toLocaleDateString("en-US", { day: "numeric", month: "short" }).toUpperCase();

      setCurrentDate({
        time: timeStr,
        day: dayStr,
        date: dateStr,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calendar days generation (October 2026 starts on Thursday)
  const daysInMonth = 31;
  const startDayOffset = 4; // Thursday
  const eventDays = [7, 12, 19, 24, 28];

  const communityNotices = [
    {
      id: 1,
      title: "DRRM Flood & Typhoon Evacuation Drill",
      time: "2 hours ago",
      reads: "420 residents notified",
      status: "High Priority",
    },
    {
      id: 2,
      title: "Senior Citizen Cash Subsidy Payout Schedule",
      time: "5 hours ago",
      reads: "1,120 reached",
      status: "Financial Aid",
    },
    {
      id: 3,
      title: "Youth Skills Training in Web & Tech Camp",
      time: "Yesterday",
      reads: "85 applicants",
      status: "Education",
    },
    {
      id: 4,
      title: "Quarterly Barangay Clean-Up & Tree Planting",
      time: "2 days ago",
      reads: "340 registered",
      status: "Environment",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Barangay Council General Session",
      time: "9:00 AM – 11:30 AM",
      venue: "Session Hall",
      attendees: ["MS", "JO", "RA", "+5"],
      color: "border-l-[#F45113]",
    },
    {
      id: 2,
      title: "Health Center Vaccination & Checkup",
      time: "1:00 PM – 4:00 PM",
      venue: "Lapasan Health Center",
      attendees: ["DR", "NC", "+12"],
      color: "border-l-[#0F172A]",
    },
    {
      id: 3,
      title: "Purok Leaders Coordination Meeting",
      time: "5:00 PM – 6:30 PM",
      venue: "Covered Court",
      attendees: ["PL", "KG", "+8"],
      color: "border-l-[#FB923C]",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      
      {/* ── Top Bar: Search + Live Clock + Filter Switch (Matching Reference Concept) ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Modern Pill Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <div className="flex items-center w-full h-12 px-4 rounded-full bg-white border border-[#ECE7DF] shadow-sm focus-within:ring-2 focus-within:ring-[#F45113]/30 focus-within:border-[#F45113] transition-all">
            <Search className="w-4 h-4 text-[#94A3B8] mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search programs, residents, registrations, or records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none"
            />
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[#94A3B8] bg-[#FFF9F3] border border-[#ECE7DF] rounded-md">
              /
            </span>
          </div>
        </div>

        {/* Top-Right Widget: Digital Live Clock & Segmented View Controls */}
        <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-5 flex-shrink-0">
          {/* Digital Time & Date Widget */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-[#ECE7DF] shadow-sm">
            <Clock className="w-4 h-4 text-[#F45113]" />
            <div className="text-right leading-none">
              <p className="text-sm font-extrabold text-[#0F172A] tracking-tight font-mono">
                {currentDate.time}
              </p>
              <p className="text-[10px] font-bold text-[#64748B] mt-1">
                {currentDate.day} <span className="text-[#94A3B8]">|</span> {currentDate.date}
              </p>
            </div>
          </div>

          {/* Segmented Time Range Pills (From reference: MONTH | WEEK | PLANNER) */}
          <div className="flex items-center p-1 rounded-full bg-white border border-[#ECE7DF] shadow-sm">
            {(["MONTH", "WEEK", "PLANNER"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#F45113] text-white shadow-sm shadow-orange-500/25"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Greeting Banner ── */}
      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Hi {profile.name ? profile.name.split(" ")[0] : "Admin"} , <span className="text-[#64748B] font-semibold">Welcome back !</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Barangay Lapasan Administrative Dashboard · All community programs operating normally.
        </p>
      </div>

      {/* ── Main Multi-Column Widget Grid (Reference Layout Concept) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ════ COLUMN 1 (Left 4 cols): Profile Card & Community Notices ════ */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          
          {/* Card 1: Account Overview Widget */}
          <div className="p-6 rounded-3xl bg-white border border-[#ECE7DF] shadow-sm space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Account Overview
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {profile.status || "Active Session"}
              </span>
            </div>

            <div className="flex flex-col items-center text-center pt-1 pb-2">
              {/* Circular Avatar with Glowing Ring */}
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#F45113] via-[#FB923C] to-[#FED7AA] p-[3px] shadow-md shadow-orange-500/20">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-extrabold text-xl text-[#F45113]">
                    {profile.initials || "AD"}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0F172A] border-2 border-white flex items-center justify-center text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F45113]" />
                </div>
              </div>

              <h2 className="text-base font-bold text-[#0F172A]">{profile.name}</h2>
              <p className="text-xs font-semibold text-[#F45113] mt-0.5">{profile.role}</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">{profile.email}</p>

              <Link
                href="/admin/settings"
                className="mt-4 px-5 py-2 rounded-full border border-[#ECE7DF] hover:border-[#F45113] text-xs font-semibold text-[#0F172A] hover:text-[#F45113] bg-[#FFF9F3] transition-colors"
              >
                Manage Profile
              </Link>
            </div>

            {/* Quick Channel Badges (Matching reference's round channel pills) */}
            <div className="pt-3 border-t border-[#ECE7DF]/70 flex items-center justify-center gap-3">
              <button
                title="Barangay Official Hotline"
                className="w-9 h-9 rounded-full bg-[#FFF9F3] border border-[#ECE7DF] hover:border-[#F45113] flex items-center justify-center text-[#F45113] transition-colors"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                title="Admin Email Dispatch"
                className="w-9 h-9 rounded-full bg-[#FFF9F3] border border-[#ECE7DF] hover:border-[#F45113] flex items-center justify-center text-[#0F172A] transition-colors"
              >
                <Mail className="w-4 h-4" />
              </button>
              <button
                title="DRRM Emergency Radio Frequency"
                className="w-9 h-9 rounded-full bg-[#FFF9F3] border border-[#ECE7DF] hover:border-[#F45113] flex items-center justify-center text-[#0F172A] transition-colors"
              >
                <Radio className="w-4 h-4" />
              </button>
              <button
                title="Lapasan Civic Broadcast"
                className="w-9 h-9 rounded-full bg-[#FFF9F3] border border-[#ECE7DF] hover:border-[#F45113] flex items-center justify-center text-[#0F172A] transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Community Notices & Bulletins (Matching reference News card) */}
          <div className="p-6 rounded-3xl bg-white border border-[#ECE7DF] shadow-sm space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#0F172A]">Community Notices</h3>
              <Link
                href="/admin/programs"
                className="text-[11px] font-bold text-[#F45113] hover:underline uppercase tracking-wider"
              >
                SEE ALL
              </Link>
            </div>

            <div className="space-y-3.5 pt-1">
              {communityNotices.map((notice) => (
                <div key={notice.id} className="group cursor-pointer">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#F45113] mt-1.5 flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#0F172A] group-hover:text-[#F45113] transition-colors line-clamp-1">
                        {notice.title}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] mt-0.5">
                        {notice.time} <span className="text-[#CBD5E1]">|</span> {notice.reads}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ════ COLUMN 2 (Center 4 cols): Quick Operations & Active Programs ════ */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          
          {/* Card 1: Quick Action Widget (Matching reference 'Create A Post') */}
          <div className="p-6 rounded-3xl bg-white border border-[#ECE7DF] shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#0F172A]">Quick Operations</h3>
            
            {/* 3 Pill Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/admin/programs"
                className="py-2.5 px-2 rounded-2xl bg-[#FFF9F3] hover:bg-[#F45113] border border-[#ECE7DF] hover:border-[#F45113] group flex flex-col items-center justify-center text-center transition-all"
              >
                <BookOpen className="w-4 h-4 text-[#F45113] group-hover:text-white mb-1 transition-colors" />
                <span className="text-[11px] font-bold text-[#0F172A] group-hover:text-white transition-colors">
                  Programs
                </span>
              </Link>

              <Link
                href="/admin/registrations"
                className="py-2.5 px-2 rounded-2xl bg-[#FFF9F3] hover:bg-[#F45113] border border-[#ECE7DF] hover:border-[#F45113] group flex flex-col items-center justify-center text-center transition-all"
              >
                <UserCheck className="w-4 h-4 text-[#F45113] group-hover:text-white mb-1 transition-colors" />
                <span className="text-[11px] font-bold text-[#0F172A] group-hover:text-white transition-colors">
                  Approvals
                </span>
              </Link>

              <Link
                href="/admin/reports"
                className="py-2.5 px-2 rounded-2xl bg-[#FFF9F3] hover:bg-[#F45113] border border-[#ECE7DF] hover:border-[#F45113] group flex flex-col items-center justify-center text-center transition-all"
              >
                <FileText className="w-4 h-4 text-[#F45113] group-hover:text-white mb-1 transition-colors" />
                <span className="text-[11px] font-bold text-[#0F172A] group-hover:text-white transition-colors">
                  Reports
                </span>
              </Link>
            </div>
          </div>

          {/* Card 2: Active Programs & Registrations (Matching reference 'Active Interviews') */}
          <div className="p-6 rounded-3xl bg-white border border-[#ECE7DF] shadow-sm space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A]">Active Programs</h3>
                <p className="text-[11px] text-[#64748B]">Barangay Lapasan initiatives</p>
              </div>
              <Link
                href="/admin/programs"
                className="text-[11px] font-bold text-[#F45113] hover:underline uppercase tracking-wider"
              >
                SEE ALL
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {mockPrograms.slice(0, 4).map((program) => (
                <Link
                  key={program.id}
                  href={`/admin/programs/${program.id}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF9F3] hover:bg-[#FFF0E6] border border-[#ECE7DF] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#ECE7DF] flex items-center justify-center text-[#F45113] group-hover:scale-105 transition-transform flex-shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#F45113] transition-colors">
                        {program.title}
                      </p>
                      <p className="text-[10px] text-[#64748B] mt-0.5 truncate">
                        {program.enrolled} / {program.slots} slots filled
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F45113] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>

            {/* Live KPI mini strip */}
            <div className="pt-4 border-t border-[#ECE7DF] grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-[#FFF9F3]">
                <p className="text-lg font-extrabold text-[#F45113] font-mono leading-none">
                  1,248
                </p>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">
                  Residents
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[#FFF9F3]">
                <p className="text-lg font-extrabold text-[#0F172A] font-mono leading-none">
                  5 Pending
                </p>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-1">
                  Approvals
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ════ COLUMN 3 (Right 4 cols): Interactive Calendar & Upcoming Events ════ */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          
          {/* Card 1: Interactive Calendar Widget (Matching reference Calendar card) */}
          <div className="p-6 rounded-3xl bg-white border border-[#ECE7DF] shadow-sm space-y-4">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                October 2026
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="w-7 h-7 rounded-full hover:bg-[#FFF9F3] flex items-center justify-center text-[#64748B] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="w-7 h-7 rounded-full hover:bg-[#FFF9F3] flex items-center justify-center text-[#64748B] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#94A3B8]">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty leading offsets */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`offset-${i}`} className="py-1.5 text-xs text-transparent">
                  -
                </div>
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = selectedDay === dayNum;
                const hasEvent = eventDays.includes(dayNum);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setSelectedDay(dayNum)}
                    className={`py-1.5 text-xs font-semibold rounded-full relative flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#F45113] text-white font-extrabold shadow-sm shadow-orange-500/30 scale-105"
                        : "text-[#0F172A] hover:bg-[#FFF9F3]"
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasEvent && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-[#F45113] mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: Upcoming Events & Schedules (Matching reference 'Upcoming Events') */}
          <div className="p-6 rounded-3xl bg-white border border-[#ECE7DF] shadow-sm space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A]">Upcoming Events</h3>
                <p className="text-[11px] text-[#64748B]">Tomorrow, Oct 20</p>
              </div>
              <Link
                href="/admin/programs"
                className="px-3 py-1 rounded-full bg-[#FFF9F3] hover:bg-[#F45113] text-[#0F172A] hover:text-white text-[11px] font-bold border border-[#ECE7DF] transition-all"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-3.5 rounded-2xl bg-[#FFF9F3] border-l-4 ${evt.color} border border-[#ECE7DF] space-y-2`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-[#0F172A] leading-snug">
                      {evt.title}
                    </p>
                    <span className="text-[10px] font-bold text-[#F45113] bg-[#F45113]/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      Scheduled
                    </span>
                  </div>

                  <p className="text-[11px] text-[#64748B]">
                    {evt.time} · {evt.venue}
                  </p>

                  {/* Attendees avatar strip */}
                  <div className="flex items-center gap-1 pt-1">
                    {evt.attendees.map((init, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded-full bg-white border border-[#ECE7DF] text-[9px] font-bold text-[#0F172A] flex items-center justify-center"
                      >
                        {init}
                      </div>
                    ))}
                    <span className="text-[10px] text-[#94A3B8] ml-1">Assigned Staff</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
