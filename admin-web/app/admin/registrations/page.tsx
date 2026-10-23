"use client";

import { useState, useEffect } from "react";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { mockPrograms } from "@/lib/mock-data/programs";
import { Registration, RegistrationStatus } from "@/types";
import { getRegistrations, updateRegistrationStatus } from "@/lib/services/registrations";
import { getPrograms, Program } from "@/lib/services/programs";
import {
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Users,
  ChevronDown,
  Check,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { RegistrationStatusBadge } from "@/components/shared/StatusBadges";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [livePrograms, setLivePrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [purokFilter, setPurokFilter] = useState<string>("ALL");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveRegistrations() {
      try {
        const live = await getRegistrations();
        const mapped: Registration[] = live.map((r) => ({
          id: r.id || `reg-${Date.now()}`,
          residentId: r.residentId || "res-001",
          residentName: r.residentName || "Resident",
          programId: r.programId || "prog-001",
          programTitle: r.programTitle || "Community Program",
          purok: r.purok || "Purok 1",
          phone: r.phone || "09170000000",
          status: (r.status as RegistrationStatus) || "Pending",
          registeredAt: r.registeredAt ? new Date(r.registeredAt.seconds * 1000).toISOString() : new Date().toISOString(),
        }));
        setRegistrations(mapped);
      } catch (err) {
        console.warn("Using offline registrations cache:", err);
      }
    }
    async function fetchLivePrograms() {
      try {
        const programs = await getPrograms();
        if (programs && programs.length > 0) {
          setLivePrograms(programs);
        }
      } catch (err) {
        console.warn("Using offline programs cache:", err);
      }
    }
    fetchLiveRegistrations();
    fetchLivePrograms();
  }, []);

  const approve = async (id: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Approved" as const,
              approvedAt: new Date().toISOString(),
            }
          : r
      )
    );
    try {
      await updateRegistrationStatus(id, "Approved");
    } catch (err) {
      console.warn("Firestore status update skipped:", err);
    }
  };

  const reject = async (id: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Rejected" as const } : r
      )
    );
    try {
      await updateRegistrationStatus(id, "Rejected");
    } catch (err) {
      console.warn("Firestore status update skipped:", err);
    }
  };

  // Program slots lookup map – prefer live Firestore programs, fall back to mock
  const programSourceList = livePrograms.length > 0 ? livePrograms : mockPrograms;
  const programSlotsMap = programSourceList.reduce((acc, p) => {
    acc[p.id!] = {
      slots: (p as any).slots ?? 100,
      enrolled: (p as any).enrolledCount ?? (p as any).enrolled ?? 0,
      title: p.title,
    };
    return acc;
  }, {} as Record<string, { slots: number; enrolled: number; title: string }>);

  const counts = {
    all: registrations.length,
    pending: registrations.filter((r) => r.status === "Pending").length,
    approved: registrations.filter((r) => r.status === "Approved").length,
    rejected: registrations.filter((r) => r.status === "Rejected").length,
  };

  const uniquePuroks = Array.from(new Set(registrations.map((r) => r.purok))).sort();

  const filtered = registrations.filter((r) => {
    const matchesSearch =
      !search ||
      r.residentName.toLowerCase().includes(search.toLowerCase()) ||
      r.programTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.purok.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesPurok = purokFilter === "ALL" || r.purok === purokFilter;
    return matchesSearch && matchesStatus && matchesPurok;
  });

  const handleExportCSV = () => {
    const header = "Registration ID,Resident Name,Program Title,Purok,Submitted At,Status,Approved At\n";
    const rows = filtered
      .map(
        (r) =>
          `"${r.id}","${r.residentName}","${r.programTitle}","${r.purok}","${r.registeredAt}","${r.status}","${r.approvedAt || "N/A"}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice("Registrations list exported to CSV successfully.");
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Registrations
          </h1>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#ECE7DF] hover:border-[#F45113]/50 text-xs font-bold text-[#0F172A] rounded-2xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#F45113]" />
          <span>Export CSV</span>
        </button>
      </div>

      {exportNotice && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ── KPI Bento Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Submissions</p>
          <p className="text-3xl font-extrabold text-[#0F172A]">{counts.all}</p>
          <p className="text-[11px] text-[#64748B]">All-time resident requests</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Review</p>
          <p className="text-3xl font-extrabold text-amber-600">{counts.pending}</p>
          <p className="text-[11px] text-[#64748B]">Awaiting admin decision</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Approved Seats</p>
          <p className="text-3xl font-extrabold text-emerald-600">{counts.approved}</p>
          <p className="text-[11px] text-[#64748B]">Confirmed participants</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Rejected Requests</p>
          <p className="text-3xl font-extrabold text-rose-600">{counts.rejected}</p>
          <p className="text-[11px] text-[#64748B]">Declined submissions</p>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by resident name, program, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center p-1 rounded-full bg-[#FFF9F3] border border-[#ECE7DF]">
            {(["ALL", "Pending", "Approved", "Rejected"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {st === "ALL" ? "All Status" : st}
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
              {uniquePuroks.map((prk) => (
                <option key={prk} value={prk}>
                  {prk}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <span className="text-xs text-[#64748B] font-semibold">
          Showing {filtered.length} of {registrations.length} registrations
        </span>
      </div>

      {/* ── Registrations Roster Table ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFF9F3]/70 border-b border-[#ECE7DF] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Participant / Resident</th>
                <th className="py-3 px-4">Program & Available Slots</th>
                <th className="py-3 px-4">Purok Area</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-5 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DF]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B]">
                    <p className="font-bold text-sm text-[#0F172A]">No registrations match your search</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Try selecting another filter or clearing search.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const programSlotInfo = programSlotsMap[r.programId] || {
                    slots: 100,
                    enrolled: 45,
                  };
                  return (
                    <tr key={r.id} className="hover:bg-[#FFF9F3]/40 transition-colors group">
                      {/* Participant */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F45113]/10 text-[#F45113] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {r.residentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F172A]">{r.residentName}</p>
                            <p className="text-[10px] font-mono text-[#94A3B8]">ID: {r.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Program Title & Available Slots */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-[#0F172A] truncate" title={r.programTitle}>
                          {r.programTitle}
                        </p>
                        <p className="text-[10px] text-[#64748B] mt-0.5">
                          Capacity: {programSlotInfo.enrolled} / {programSlotInfo.slots} filled
                        </p>
                      </td>

                      {/* Purok */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF9F3] border border-[#ECE7DF] text-[#0F172A]">
                          {r.purok}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-[#64748B] text-[11px]">
                        {new Date(r.registeredAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <RegistrationStatusBadge status={r.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        {r.status === "Pending" ? (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => approve(r.id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => reject(r.id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 justify-end text-[11px] text-[#64748B]">
                            <span>Recorded</span>
                            <button
                              onClick={() =>
                                setRegistrations((prev) =>
                                  prev.map((item) =>
                                    item.id === r.id
                                      ? { ...item, status: "Pending" as const }
                                      : item
                                  )
                                )
                              }
                              className="text-[10px] text-[#F45113] hover:underline cursor-pointer"
                              title="Revert to Pending"
                            >
                              Re-evaluate
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
