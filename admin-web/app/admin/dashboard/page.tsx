"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  UserCheck,
  Bell,
  ArrowRight,
  Search,
  Filter,
  AlertCircle,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { mockPrograms } from "@/lib/mock-data/programs";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { mockResidents } from "@/lib/mock-data/residents";
import { useAdminProfile } from "@/lib/context/AdminProfileContext";
import { RegistrationStatusBadge, ProgramStatusBadge } from "@/components/shared/StatusBadges";
import { getPrograms } from "@/lib/services/programs";
import { getRegistrations, updateRegistrationStatus } from "@/lib/services/registrations";
import { getResidents } from "@/lib/services/residents";
import { Program, Registration, Resident } from "@/types";

export default function AdminDashboardPage() {
  const { profile } = useAdminProfile();

  // State populated from Firestore with fallback to mock
  const [programsList, setProgramsList] = useState<Program[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [residentsCount, setResidentsCount] = useState<number>(0);

  // Digital Clock & Date
  const [currentDate, setCurrentDate] = useState({
    time: "08:00 AM",
    date: "Wednesday, October 21, 2026",
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [livePrograms, liveRegs, liveRes] = await Promise.allSettled([
          getPrograms(),
          getRegistrations(),
          getResidents(),
        ]);

        if (livePrograms.status === "fulfilled") {
          const mappedProgs: Program[] = livePrograms.value.map((p) => ({
            id: p.id || `prog-${Date.now()}`,
            title: p.title,
            category: (p.category as any) || "Health",
            description: p.description || "",
            schedule: p.schedule || "",
            location: p.location || "Barangay Lapasan Multi-Purpose Hall",
            slots: Number(p.slots) || 100,
            enrolled: Number(p.enrolledCount) || 0,
            status: (p.status as any) || "Active",
            officer: p.officer || "Barangay Officer",
            benefits: ["Official barangay certificate"],
            requirements: ["Barangay Lapasan Resident ID"],
            startDate: p.schedule || "",
            endDate: p.registrationDeadline || "",
            tags: [p.category?.toLowerCase() || "civic"],
          }));
          setProgramsList(mappedProgs);
        }

        if (liveRegs.status === "fulfilled") {
          const mappedRegs: Registration[] = liveRegs.value.map((r) => ({
            id: r.id || `reg-${Date.now()}`,
            residentId: r.residentId || "res-001",
            residentName: r.residentName || "Resident",
            programId: r.programId || "prog-001",
            programTitle: r.programTitle || "Community Program",
            purok: r.purok || "Purok 1",
            phone: r.phone || "09170000000",
            status: (r.status as any) || "Pending",
            registeredAt: r.registeredAt ? new Date(r.registeredAt.seconds * 1000).toISOString() : new Date().toISOString(),
          }));
          setRegistrations(mappedRegs);
        }

        if (liveRes.status === "fulfilled") {
          setResidentsCount(liveRes.value.length);
        }
      } catch (err) {
        console.warn("Using offline dashboard fallback:", err);
        setProgramsList(mockPrograms);
        setRegistrations(mockRegistrations);
        setResidentsCount(mockResidents.length);
      }
    }
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate({
        time: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        date: now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // One-tap approve from dashboard
  const handleApprove = async (id: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Approved" as const, approvedAt: new Date().toISOString() } : r
      )
    );
    try {
      await updateRegistrationStatus(id, "Approved");
    } catch (err) {
      console.warn("Firestore approve skipped:", err);
    }
  };

  const handleReject = async (id: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Rejected" as const } : r
      )
    );
    try {
      await updateRegistrationStatus(id, "Rejected");
    } catch (err) {
      console.warn("Firestore reject skipped:", err);
    }
  };

  // 1. Total registered residents
  const totalRegisteredResidents = residentsCount;
  // 2. Available programs (Active + Upcoming)
  const availablePrograms = programsList.filter(
    (p) => p.status === "Active" || p.status === "Upcoming"
  );
  // 3. Upcoming activities (Programs with upcoming schedules)
  const upcomingActivities = programsList.filter((p) => p.status === "Upcoming" || p.status === "Active").slice(0, 4);
  // 4. Pending registrations
  const pendingRegistrations = registrations.filter((r) => r.status === "Pending");
  // 5. Attendance summary
  const totalEnrolledAcrossPrograms = programsList.reduce((acc, p) => acc + p.enrolled, 0);
  const avgAttendanceRate = 0;

  // Recent Registrations (latest 5)
  const recentRegistrations = registrations.slice(0, 5);



  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Dashboard
          </h1>
        </div>

        {/* Live Philippine Clock & Date */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#ECE7DF] shadow-sm self-start md:self-auto">
          <Clock className="w-4 h-4 text-[#F45113] flex-shrink-0" />
          <div className="text-right leading-none">
            <p className="text-sm font-extrabold text-[#0F172A] tracking-tight font-mono">
              {currentDate.time}
            </p>
            <p className="text-[10px] font-bold text-[#64748B] mt-1">
              {currentDate.date}
            </p>
          </div>
        </div>
      </div>

      {/* ── Top 5 KPI Metrics (Strictly matching Module 1 requirements) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Metric 1: Registered Residents */}
        <Link
          href="/admin/residents"
          className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm hover:border-[#F45113]/50 transition-all group block space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Registered Residents</span>
            <Users className="w-4 h-4 text-[#F45113]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] group-hover:text-[#F45113] transition-colors">
            {totalRegisteredResidents}
          </p>
          <p className="text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Residents</span>
            <span className="text-[#F45113] font-bold text-[10px]">View all &rarr;</span>
          </p>
        </Link>

        {/* Metric 2: Available Programs */}
        <Link
          href="/admin/programs"
          className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm hover:border-[#F45113]/50 transition-all group block space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Available Programs</span>
            <BookOpen className="w-4 h-4 text-[#F45113]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] group-hover:text-[#F45113] transition-colors">
            {availablePrograms.length}
          </p>
          <p className="text-[11px] text-[#64748B] flex items-center justify-between">
            <span>Active & Upcoming</span>
            <span className="text-[#F45113] font-bold text-[10px]">Manage &rarr;</span>
          </p>
        </Link>

        {/* Metric 3: Upcoming Activities */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Upcoming Activities</span>
            <CalendarIcon className="w-4 h-4 text-[#F45113]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            {upcomingActivities.length}
          </p>
          <p className="text-[11px] text-[#64748B]">Scheduled this month</p>
        </div>

        {/* Metric 4: Pending Registrations */}
        <Link
          href="/admin/registrations"
          className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm hover:border-[#F45113]/50 transition-all group block space-y-2"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Pending Sign-ups</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {pendingRegistrations.length}
            </p>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Needs Review
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] flex items-center justify-between">
            <span>From resident app</span>
            <span className="text-[#F45113] font-bold text-[10px]">Review &rarr;</span>
          </p>
        </Link>

        {/* Metric 5: Attendance Summary */}
        <Link
          href="/admin/attendance"
          className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm hover:border-[#F45113]/50 transition-all group block space-y-2 col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[10px]">Attendance Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {avgAttendanceRate}%
            </p>
            <span className="text-[10px] text-[#64748B] font-semibold">avg turnout</span>
          </div>
          <div className="w-full bg-[#FFF9F3] h-1.5 rounded-full overflow-hidden border border-[#ECE7DF]">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${avgAttendanceRate}%` }}
            />
          </div>
        </Link>

      </div>

      {/* ── Main Operations Grid (Strictly 2 Columns: Operations & Updates) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ════ LEFT COLUMN (7 cols): Recent Registrations & Available Programs ════ */}
        <div className="lg:col-span-7 space-y-6">

          {/* Section: Recent Registrations from Mobile App */}
          <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#ECE7DF] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                  Recent Registrations
                </h2>
              </div>
              <Link
                href="/admin/registrations"
                className="text-xs font-bold text-[#F45113] hover:underline flex items-center gap-1"
              >
                <span>View All ({registrations.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FFF9F3]/60 border-b border-[#ECE7DF] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                    <th className="py-3 px-4">Resident</th>
                    <th className="py-3 px-3">Program</th>
                    <th className="py-3 px-3">Purok</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE7DF]">
                  {recentRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-xs text-[#94A3B8]">
                        No registrations yet
                      </td>
                    </tr>
                  ) : (
                    recentRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-[#FFF9F3]/40 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#0F172A]">{reg.residentName}</p>
                          <p className="text-[10px] text-[#94A3B8]">
                            {new Date(reg.registeredAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="py-3 px-3 max-w-[180px]">
                          <p className="font-semibold text-[#0F172A] truncate" title={reg.programTitle}>
                            {reg.programTitle}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF9F3] border border-[#ECE7DF] text-[#0F172A]">
                            {reg.purok}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <RegistrationStatusBadge status={reg.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          {reg.status === "Pending" ? (
                            <div className="inline-flex items-center gap-1 justify-end">
                              <button
                                onClick={() => handleApprove(reg.id)}
                                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                title="Approve Registration"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(reg.id)}
                                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                                title="Reject Registration"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-medium text-[#94A3B8]">
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section: Available Community Programs */}
          <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                  Available Programs
                </h2>
              </div>
              <Link
                href="/admin/programs"
                className="text-xs font-bold text-[#F45113] hover:underline flex items-center gap-1"
              >
                <span>Manage Programs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {availablePrograms.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#94A3B8]">
                No active programs
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {availablePrograms.slice(0, 4).map((p) => {
                  const percent = Math.min(100, Math.round((p.enrolled / p.slots) * 100));
                  return (
                    <Link
                      key={p.id}
                      href={`/admin/programs/${p.id}`}
                      className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#ECE7DF] hover:border-[#F45113]/50 transition-all block space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#F45113] border border-[#ECE7DF]">
                          {p.category}
                        </span>
                        <ProgramStatusBadge status={p.status} />
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-[#0F172A] group-hover:text-[#F45113] transition-colors line-clamp-1">
                          {p.title}
                        </h3>
                        <p className="text-[10px] text-[#64748B] mt-0.5 line-clamp-1">
                          {p.location}
                        </p>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-[#64748B]">
                          <span>Capacity: {p.enrolled} / {p.slots} slots</span>
                          <span className="text-[#0F172A] font-bold">{percent}%</span>
                        </div>
                        <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-[#ECE7DF]">
                          <div
                            className="bg-[#F45113] h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ════ RIGHT COLUMN (5 cols): Upcoming Activities & Quick Broadcast ════ */}
        <div className="lg:col-span-5 space-y-6">

          {/* Section: Upcoming Activities */}
          <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                  Upcoming Activities
                </h2>
              </div>
              <Link
                href="/admin/programs"
                className="text-xs font-bold text-[#F45113] hover:underline"
              >
                Full Calendar
              </Link>
            </div>

            {upcomingActivities.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#94A3B8]">
                No upcoming activities
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#ECE7DF] space-y-1.5 hover:border-[#F45113]/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-[#0F172A] leading-snug">
                        {act.title}
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white text-[#F45113] border border-[#ECE7DF] flex-shrink-0">
                        {act.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#64748B]">
                      <span className="flex items-center gap-1 font-semibold text-[#0F172A]">
                        <Clock className="w-3 h-3 text-[#F45113]" />
                        {act.schedule.split(",")[0]}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#94A3B8]" />
                        {act.location.split(",")[0]}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#94A3B8] pt-0.5">
                      Lead Officer: <strong className="text-[#64748B]">{act.officer}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Broadcast Card */}
          <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm space-y-3">
            <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
              Broadcast Advisory
            </h2>
            <Link
              href="/admin/announcements"
              className="w-full py-2.5 rounded-2xl bg-[#0F172A] hover:bg-black text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Create Announcement</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
