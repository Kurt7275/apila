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
} from "lucide-react";
import { QrScannerModal } from "@/components/attendance/QrScannerModal";
import { mockPrograms } from "@/lib/mock-data/programs";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { mockResidents } from "@/lib/mock-data/residents";
import { ProgramStatusBadge } from "@/components/shared/StatusBadges";
import { getAttendanceByProgram, markAttendance } from "@/lib/services/attendance";

type AttendanceRecord = "PRESENT" | "ABSENT" | "UNMARKED";

export default function AdminAttendancePage() {
  // Programs that can track attendance (Active, Upcoming, Completed)
  const trackablePrograms = useMemo(
    () => mockPrograms.filter((p) => p.status !== "Cancelled"),
    []
  );

  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    trackablePrograms[0]?.id || "prog-001"
  );

  const selectedProgram = trackablePrograms.find((p) => p.id === selectedProgramId) || trackablePrograms[0];

  // Registrations associated with this program
  const programRegistrations = useMemo(() => {
    const list = mockRegistrations.filter((r) => r.programId === selectedProgramId);
    if (list.length > 0) return list;
    // Fallback if mock has limited registrations for certain programs: synthesize demo attendees from residents
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
  }, [selectedProgramId, selectedProgram]);

  // Attendance state map: { registrationId: AttendanceRecord }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT" | "UNMARKED">("ALL");
  const [purokFilter, setPurokFilter] = useState<string>("ALL");
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // Load from localStorage or initialize with realistic defaults
  useEffect(() => {
    const storageKey = `apila_attendance_${selectedProgramId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAttendanceMap(JSON.parse(saved));
        return;
      }
    } catch {
      // Fallback
    }

    // Default seed
    const initialMap: Record<string, AttendanceRecord> = {};
    programRegistrations.forEach((r, idx) => {
      if (idx % 4 === 0) initialMap[r.id] = "PRESENT";
      else if (idx % 7 === 0) initialMap[r.id] = "ABSENT";
      else initialMap[r.id] = "UNMARKED";
    });
    setAttendanceMap(initialMap);
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
    saveAttendance({
      ...attendanceMap,
      [regId]: status,
    });
    if (status === "PRESENT" || status === "ABSENT") {
      const reg = programRegistrations.find((r) => r.id === regId);
      if (reg) {
        try {
          await markAttendance(
            selectedProgramId,
            reg.residentId,
            reg.residentName,
            status === "PRESENT" ? "Present" : "Absent"
          );
        } catch (err) {
          console.warn("Firestore markAttendance skipped:", err);
        }
      }
    }
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceRecord> = { ...attendanceMap };
    programRegistrations.forEach((r) => {
      updated[r.id] = "PRESENT";
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
      r.purok.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        return `"${r.id}","${r.residentName}","${r.purok}","${new Date(r.registeredAt).toLocaleDateString()}","${status}"`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Attendance_${selectedProgram?.title.replace(/\s+/g, "_")}.csv`);
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
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Select Active Community Program
            </label>
            <div className="relative">
              <select
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="w-full lg:w-[480px] appearance-none px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-bold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer pr-10"
              >
                {trackablePrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.category})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {selectedProgram && (
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
          <p className="text-[11px] text-[#64748B]">Official registered participants</p>
        </div>

        {/* Present */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-700">
            <span className="font-bold uppercase tracking-wider text-[11px]">Marked Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{presentCount}</p>
          <p className="text-[11px] text-[#64748B]">Verified in-person attendees</p>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-rose-700">
            <span className="font-bold uppercase tracking-wider text-[11px]">Marked Absent</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-extrabold text-rose-600">{absentCount}</p>
          <p className="text-[11px] text-[#64748B]">Unattended registrations</p>
        </div>

        {/* Participation Rate */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#F45113]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Turnout Rate</span>
            <BarChart3 className="w-4 h-4 text-[#F45113]" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-[#0F172A]">{attendanceRate}%</p>
            <span className="text-[11px] text-[#64748B]">({unmarkedCount} pending)</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#FFF9F3] h-2 rounded-full overflow-hidden border border-[#ECE7DF]">
            <div
              className="bg-[#F45113] h-full rounded-full transition-all duration-300"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Attendance Roster Table Section ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden">
        {/* Table Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-[#ECE7DF] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search attendee by name, Purok, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center p-1 rounded-full bg-[#FFF9F3] border border-[#ECE7DF]">
              {(["ALL", "PRESENT", "ABSENT", "UNMARKED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {st === "ALL" ? "All Status" : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Purok Filter */}
            <div className="relative">
              <select
                value={purokFilter}
                onChange={(e) => setPurokFilter(e.target.value)}
                className="appearance-none px-3.5 py-1.5 rounded-full border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none pr-8 cursor-pointer"
              >
                <option value="ALL">All Puroks</option>
                {purokList.map((prk) => (
                  <option key={prk} value={prk}>
                    {prk}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Operations */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={handleMarkAllPresent}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={handleResetAttendance}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FFF9F3]/60 border-b border-[#ECE7DF] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Participant / Resident</th>
                <th className="py-3 px-4">Purok Area</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4 text-center">Attendance Status</th>
                <th className="py-3 px-5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DF] text-xs">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#64748B]">
                    <Users className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm text-[#0F172A]">No participants found</p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Try adjusting your search terms or filters above.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((r) => {
                  const currentStatus = attendanceMap[r.id] || "UNMARKED";
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-[#FFF9F3]/50 transition-colors group"
                    >
                      {/* Participant Name & ID */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F45113]/10 text-[#F45113] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {r.residentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F172A] group-hover:text-[#F45113] transition-colors">
                              {r.residentName}
                            </p>
                            <p className="text-[10px] font-mono text-[#94A3B8]">
                              ID: {r.residentId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Purok */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF9F3] border border-[#ECE7DF] text-[#0F172A]">
                          {r.purok}
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
