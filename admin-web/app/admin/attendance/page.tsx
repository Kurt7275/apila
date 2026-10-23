"use client";

import { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Calendar,
  MapPin,
  Search,
  Filter,
  Download,
  Printer,
  RotateCcw,
  Check,
  ChevronDown,
  BarChart3,
  ShieldCheck,
  Scan,
  QrCode,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { QrScannerModal } from "@/components/attendance/QrScannerModal";
import { mockPrograms } from "@/lib/mock-data/programs";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { mockResidents } from "@/lib/mock-data/residents";
import { ProgramStatusBadge } from "@/components/shared/StatusBadges";
import { getAttendanceByProgram, markAttendance } from "@/lib/services/attendance";
import { getPrograms, Program as ServiceProgram } from "@/lib/services/programs";
import { getRegistrations, Registration as ServiceRegistration } from "@/lib/services/registrations";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type AttendanceRecord = "PRESENT" | "ABSENT" | "UNMARKED";

export default function AdminAttendancePage() {
  const [livePrograms, setLivePrograms] = useState<any[]>([]);
  const [liveRegistrations, setLiveRegistrations] = useState<any[]>([]);

  // Fetch live programs & registrations from Firestore
  useEffect(() => {
    async function loadLiveData() {
      try {
        const [progs, regs] = await Promise.allSettled([
          getPrograms(),
          getRegistrations(),
        ]);
        if (progs.status === "fulfilled") {
          setLivePrograms(progs.value);
        }
        if (regs.status === "fulfilled") {
          setLiveRegistrations(regs.value);
        }
      } catch (err) {
        console.warn("Using offline fallback:", err);
      }
    }
    loadLiveData();
  }, []);

  // Programs that can track attendance (Active, Upcoming, Completed)
  const trackablePrograms = useMemo(() => {
    if (livePrograms.length > 0) {
      return livePrograms.filter((p) => p.status !== "Cancelled");
    }
    return mockPrograms.filter((p) => p.status !== "Cancelled");
  }, [livePrograms]);

  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    trackablePrograms[0]?.id || ""
  );

  useEffect(() => {
    if (trackablePrograms.length > 0 && !trackablePrograms.some((p) => p.id === selectedProgramId)) {
      setSelectedProgramId(trackablePrograms[0].id);
    } else if (trackablePrograms.length === 0 && selectedProgramId !== "") {
      setSelectedProgramId("");
    }
  }, [trackablePrograms, selectedProgramId]);

  const selectedProgram = trackablePrograms.find((p) => p.id === selectedProgramId) || trackablePrograms[0];

  // Registrations associated with this program
  const programRegistrations = useMemo(() => {
    // 1. Try from live registrations
    const liveMatches = liveRegistrations.filter((r) => r.programId === selectedProgramId);
    if (liveMatches.length > 0) {
      return liveMatches.map((r) => ({
        id: r.id,
        residentId: r.residentId || "res-001",
        residentName: r.residentName || "Resident",
        programId: r.programId,
        programTitle: r.programTitle || selectedProgram?.title || "Community Program",
        purok: r.purok || "Purok 1",
        phone: r.phone || "",
        status: (r.status as "Approved" | "Pending" | "Rejected") || "Approved",
        registeredAt: r.registeredAt?.seconds ? new Date(r.registeredAt.seconds * 1000).toISOString() : (r.registeredAt ? String(r.registeredAt) : new Date().toISOString()),
      }));
    }

    // 2. Try from mock registrations
    const mockList = mockRegistrations.filter((r) => r.programId === selectedProgramId);
    if (mockList.length > 0) return mockList;

    // 3. Fallback synthesis
    return mockResidents.slice(0, 8).map((res, idx) => ({
      id: `syn-reg-${selectedProgramId}-${idx}`,
      residentId: res.id,
      residentName: `${res.firstName} ${res.lastName}`,
      programId: selectedProgramId,
      programTitle: selectedProgram?.title || "Community Program",
      status: "Approved" as const,
      registeredAt: "2026-09-01T08:00:00",
      purok: res.purok,
    }));
  }, [selectedProgramId, selectedProgram, liveRegistrations]);

  // Attendance state map: { registrationId: AttendanceRecord }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT" | "UNMARKED">("ALL");
  const [purokFilter, setPurokFilter] = useState<string>("ALL");
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // Load attendance: check localStorage and Firestore live attendance
  useEffect(() => {
    async function loadAttendance() {
      const storageKey = `apila_attendance_${selectedProgramId}`;
      let initialMap: Record<string, AttendanceRecord> = {};

      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          initialMap = JSON.parse(saved);
        }
      } catch {
        // Fallback
      }

      // Live Firestore attendance check
      try {
        const liveAttendance = await getAttendanceByProgram(selectedProgramId);
        if (liveAttendance && liveAttendance.length > 0) {
          liveAttendance.forEach((rec) => {
            const match = programRegistrations.find((r) => r.residentId === rec.residentId);
            if (match) {
              initialMap[match.id] = rec.status === "Present" ? "PRESENT" : "ABSENT";
            }
          });
        }
      } catch (err) {
        console.warn("Live attendance fetch skipped:", err);
      }

      // Default unmarked for remaining
      programRegistrations.forEach((r) => {
        if (!initialMap[r.id]) {
          initialMap[r.id] = "UNMARKED";
        }
      });

      setAttendanceMap(initialMap);
    }

    if (selectedProgramId) {
      loadAttendance();
    }
  }, [selectedProgramId, programRegistrations]);

  // Persist changes
  const saveAttendance = (newMap: Record<string, AttendanceRecord>) => {
    setAttendanceMap(newMap);
    try {
      localStorage.setItem(`apila_attendance_${selectedProgramId}`, JSON.stringify(newMap));
    } catch {
      // Silent error handling for storage limits
    }
  };

  const handleMark = async (regId: string, status: AttendanceRecord) => {
    const updated = {
      ...attendanceMap,
      [regId]: status,
    };
    saveAttendance(updated);

    if (status === "PRESENT" || status === "ABSENT") {
      const reg = programRegistrations.find((r) => r.id === regId);
      if (reg) {
        try {
          // 1. Mark in attendance collection
          await markAttendance(
            selectedProgramId,
            reg.residentId,
            reg.residentName,
            status === "PRESENT" ? "Present" : "Absent"
          );

          // 2. Sync to registrations document so mobile app pass shows instant verification
          const regRef = doc(db, "registrations", regId);
          await updateDoc(regRef, {
            attendanceStatus: status === "PRESENT" ? "present" : "absent",
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          console.warn("Firestore markAttendance / registration sync skipped:", err);
        }
      }
    }
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceRecord> = { ...attendanceMap };
    programRegistrations.forEach((r) => {
      updated[r.id] = "PRESENT";
      handleMark(r.id, "PRESENT");
    });
    saveAttendance(updated);
  };

  const handleResetAttendance = () => {
    const updated: Record<string, AttendanceRecord> = {};
    programRegistrations.forEach((r) => {
      updated[r.id] = "UNMARKED";
    });
    saveAttendance(updated);
  };

  // Metrics
  const totalEnrolled = programRegistrations.length;
  const presentCount = programRegistrations.filter((r) => attendanceMap[r.id] === "PRESENT").length;
  const absentCount = programRegistrations.filter((r) => attendanceMap[r.id] === "ABSENT").length;
  const unmarkedCount = programRegistrations.filter((r) => !attendanceMap[r.id] || attendanceMap[r.id] === "UNMARKED").length;
  const attendanceRate = totalEnrolled > 0 ? Math.round((presentCount / totalEnrolled) * 100) : 0;

  // Unique Puroks
  const purokList = Array.from(new Set(programRegistrations.map((r) => r.purok))).sort();

  // Filtered rows
  const filteredAttendees = programRegistrations.filter((r) => {
    const matchesSearch =
      r.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.purok && r.purok.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.residentId.toLowerCase().includes(searchTerm.toLowerCase());
    const currentStatus = attendanceMap[r.id] || "UNMARKED";
    const matchesStatus = statusFilter === "ALL" || currentStatus === statusFilter;
    const matchesPurok = purokFilter === "ALL" || r.purok === purokFilter;
    return matchesSearch && matchesStatus && matchesPurok;
  });

  // Export CSV
  const handleExportCSV = () => {
    const header = "Registration ID,Resident Name,Purok,Registration Date,Attendance Status\n";
    const rows = programRegistrations
      .map((r) => {
        const status = attendanceMap[r.id] || "UNMARKED";
        return `"${r.id}","${r.residentName}","${r.purok || "Lapasan"}","${new Date(r.registeredAt).toLocaleDateString()}","${status}"`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Attendance_${selectedProgram?.title ? selectedProgram.title.replace(/\s+/g, "_") : "Program"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice("Attendance sheet exported to CSV successfully.");
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Attendance
          </h1>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsQrScannerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F45113] hover:bg-[#D63D05] text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan QR Pass</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#ECE7DF] hover:border-[#F45113]/50 text-xs font-bold text-[#0F172A] rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#F45113]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] hover:bg-black text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ── Program Selector Card ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Select Active Community Program
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 max-w-lg">
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  disabled={trackablePrograms.length === 0}
                  className="w-full appearance-none px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-bold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer pr-10 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {trackablePrograms.length === 0 ? (
                    <option value="" disabled>
                      No community programs found in database
                    </option>
                  ) : (
                    trackablePrograms.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.category})
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {trackablePrograms.length === 0 && (
                <Link
                  href="/admin/programs"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#F45113] hover:bg-[#d4430e] text-white text-xs font-bold rounded-2xl shadow-sm shadow-orange-500/20 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Program</span>
                </Link>
              )}
            </div>
          </div>

          {selectedProgram ? (
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#F45113]" />
                <span className="font-semibold text-[#0F172A]">{selectedProgram.schedule}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F45113]" />
                <span className="font-semibold text-[#0F172A]">{selectedProgram.location}</span>
              </div>
              <ProgramStatusBadge status={selectedProgram.status} />
            </div>
          ) : (
            <div className="text-xs text-[#94A3B8] italic">
              Create a program to start checking in residents &amp; verifying passes
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Bento Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enrolled */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Enrolled Residents</span>
            <Users className="w-4 h-4 text-[#64748B]" />
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A]">{totalEnrolled}</p>
          <p className="text-[11px] text-[#94A3B8]">Confirmed for this session</p>
        </div>

        {/* Present */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-700">Present (Verified)</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-700">{presentCount}</p>
          <p className="text-[11px] text-emerald-600/80">Turnout rate: {attendanceRate}%</p>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[11px] text-rose-700">Absent</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-extrabold text-rose-700">{absentCount}</p>
          <p className="text-[11px] text-rose-600/80">
            {totalEnrolled > 0 ? Math.round((absentCount / totalEnrolled) * 100) : 0}% of enrolled
          </p>
        </div>

        {/* Unmarked */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#64748B]">Unmarked / In-Queue</span>
            <Clock className="w-4 h-4 text-[#64748B]" />
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A]">{unmarkedCount}</p>
          <p className="text-[11px] text-[#94A3B8]">Pending check-in at venue</p>
        </div>
      </div>

      {/* ── Attendance Roster Table Card ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden space-y-4">
        {/* Table Filter Header */}
        <div className="p-5 sm:p-6 pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search attendee by name, Purok, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none px-3.5 py-2 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-bold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
            >
              <option value="ALL">All Status ({programRegistrations.length})</option>
              <option value="PRESENT">Present ({presentCount})</option>
              <option value="ABSENT">Absent ({absentCount})</option>
              <option value="UNMARKED">Unmarked ({unmarkedCount})</option>
            </select>

            {/* Purok Filter */}
            <select
              value={purokFilter}
              onChange={(e) => setPurokFilter(e.target.value)}
              className="appearance-none px-3.5 py-2 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-bold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
            >
              <option value="ALL">All Puroks</option>
              {purokList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={handleResetAttendance}
              className="px-3 py-2 bg-[#FFF9F3] hover:bg-[#FFEAD6] text-[#64748B] text-xs font-semibold rounded-xl border border-[#ECE7DF] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Attendance Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#ECE7DF] bg-[#FFF9F3]/60 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                <th className="py-3 px-5">Attendee</th>
                <th className="py-3 px-4">Purok</th>
                <th className="py-3 px-4">Registration ID</th>
                <th className="py-3 px-4">Enrolled Date</th>
                <th className="py-3 px-4 text-center">Verification Status</th>
                <th className="py-3 px-5 text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DF]">
              {trackablePrograms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#94A3B8]">
                    <div className="max-w-md mx-auto space-y-3">
                      <Calendar className="w-10 h-10 mx-auto text-[#94A3B8]" />
                      <p className="text-sm font-bold text-[#0F172A]">No Community Programs in Database</p>
                      <p className="text-xs text-[#64748B]">
                        To track resident attendance and verify passes, first create an active program in the Programs section.
                      </p>
                      <Link
                        href="/admin/programs"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F45113] hover:bg-[#d4430e] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Go to Programs &amp; Create One</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : programRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-[#94A3B8]">
                    <div className="space-y-1 max-w-sm mx-auto">
                      <Users className="w-8 h-8 mx-auto text-[#CBD5E1] mb-2" />
                      <p className="font-bold text-sm text-[#0F172A]">No residents enrolled in this program yet</p>
                      <p className="text-xs text-[#64748B]">When residents register via the APILA Mobile App or Admin portal, their pass appears here for check-in.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                    No attendees match your current filters.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((r) => {
                  const currentStatus = attendanceMap[r.id] || "UNMARKED";

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-[#FFF9F3]/50 transition-colors"
                    >
                      {/* Resident Info */}
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-[#0F172A] text-sm">
                          {r.residentName}
                        </div>
                        <div className="text-[11px] text-[#94A3B8] font-mono">
                          ID: {r.residentId}
                        </div>
                      </td>

                      {/* Purok */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFEAD6] text-[#C04A0D]">
                          {r.purok || "Lapasan"}
                        </span>
                      </td>

                      {/* Pass ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A] text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {r.id}
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 text-[#64748B] text-[11px]">
                        {new Date(r.registeredAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {currentStatus === "PRESENT" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Present
                          </span>
                        )}
                        {currentStatus === "ABSENT" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Absent
                          </span>
                        )}
                        {currentStatus === "UNMARKED" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Unmarked
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleMark(r.id, "PRESENT")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              currentStatus === "PRESENT"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                            title="Mark Present"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>
                          <button
                            onClick={() => handleMark(r.id, "ABSENT")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              currentStatus === "ABSENT"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                            title="Mark Absent"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-[#FFF9F3]/40 border-t border-[#ECE7DF] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#64748B] gap-2">
          <span>
            Displaying <strong className="text-[#0F172A]">{filteredAttendees.length}</strong> of{" "}
            <strong className="text-[#0F172A]">{programRegistrations.length}</strong> registered participants
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Present: <strong className="text-emerald-700">{presentCount}</strong></span>
            <span>Absent: <strong className="text-rose-700">{absentCount}</strong></span>
            <span>Unmarked: <strong className="text-slate-600">{unmarkedCount}</strong></span>
          </div>
        </div>
      </div>

      {/* QR Code Scanner & Check-In Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        programTitle={selectedProgram?.title || "Community Program"}
        programRegistrations={programRegistrations}
        attendanceMap={attendanceMap}
        onMarkPresent={(regId) => handleMark(regId, "PRESENT")}
      />
    </div>
  );
}
