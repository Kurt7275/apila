"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Send,
  UserCheck,
  Search,
  Filter,
  FileText,
  Check,
  Bell,
} from "lucide-react";
import { getProgramById } from "@/lib/services/programs";
import { getRegistrations, updateRegistrationStatus } from "@/lib/services/registrations";
import { RegistrationStatusBadge, ProgramStatusBadge } from "@/components/shared/StatusBadges";
import { RegistrationStatus, Program as FullProgram } from "@/types";

export default function AdminProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [program, setProgram] = useState<FullProgram | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"roster" | "details">("roster");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prog, allRegs] = await Promise.allSettled([
          getProgramById(id),
          getRegistrations(),
        ]);

        if (prog.status === "fulfilled" && prog.value) {
          const p = prog.value;
          setProgram({
            id: p.id || id,
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
          });
        }

        if (allRegs.status === "fulfilled" && allRegs.value) {
          const forProgram = allRegs.value.filter((r) => r.programId === id);
          setRegistrations(forProgram);
        }
      } catch (err) {
        console.warn("Failed loading program details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleStatusChange = async (regId: string, newStatus: "Approved" | "Rejected") => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === regId
          ? {
              ...r,
              status: newStatus,
              approvedAt: newStatus === "Approved" ? new Date().toISOString() : r.approvedAt,
            }
          : r
      )
    );
    try {
      await updateRegistrationStatus(regId, newStatus);
    } catch (err) {
      console.warn("Status update skipped:", err);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.residentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.purok?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approvedCount = registrations.filter((r) => r.status === "Approved" || r.status === "Completed").length;
  const pendingCount = registrations.filter((r) => r.status === "Pending").length;

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#64748B]">
        Loading program...
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-bold text-[#0F172A]">Program not found</p>
        <Link
          href="/admin/programs"
          className="inline-flex items-center gap-1.5 text-xs text-[#F45113] font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Programs
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      {/* ── Top Bar: Back Link & Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/programs"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#F45113] font-bold mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Programs
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {program.title}
            </h1>
            <ProgramStatusBadge status={program.status} />
          </div>
          <p className="text-xs text-[#64748B] mt-1 flex items-center gap-2">
            <span>Category: <strong className="text-[#0F172A]">{program.category}</strong></span>
            <span>·</span>
            <span>Lead Officer: <strong className="text-[#0F172A]">{program.officer}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(registrations, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `apila_${program.id}_roster.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#ECE7DF] hover:border-[#F45113]/50 text-xs font-bold text-[#0F172A] rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#F45113]" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* ── Summary Bento Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Capacity & Enrolled</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">{program.enrolled} / {program.slots}</p>
          <p className="text-[11px] text-[#64748B]">{program.slots - program.enrolled} slots remaining</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Approved Participants</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{approvedCount}</p>
          <p className="text-[11px] text-[#64748B]">Confirmed registrations</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{pendingCount}</p>
          <p className="text-[11px] text-[#64748B]">Awaiting decision</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-[#F45113] uppercase tracking-wider">Schedule</p>
          <p className="text-xs font-extrabold text-[#0F172A] mt-1 line-clamp-1">{program.schedule}</p>
          <p className="text-[11px] text-[#64748B] truncate">{program.location}</p>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex items-center gap-2 border-b border-[#ECE7DF] pb-3">
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === "roster"
              ? "bg-[#0F172A] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A] bg-white border border-[#ECE7DF]"
          }`}
        >
          Participant Roster ({registrations.length})
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === "details"
              ? "bg-[#0F172A] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#0F172A] bg-white border border-[#ECE7DF]"
          }`}
        >
          Details
        </button>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "roster" ? (
        <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECE7DF]">
            <div className="relative min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search registered residents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
              />
            </div>

            <div className="flex items-center p-1 rounded-full bg-[#FFF9F3] border border-[#ECE7DF]">
              {(["All", "Approved", "Pending", "Rejected"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? "bg-[#0F172A] text-white"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FFF9F3]/60 border-b border-[#ECE7DF] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-5">Resident Name</th>
                  <th className="py-3 px-4">Purok</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DF]">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-[#94A3B8]">
                      No participants registered for this program yet
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((r) => (
                    <tr key={r.id} className="hover:bg-[#FFF9F3]/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#0F172A]">{r.residentName}</td>
                      <td className="py-3.5 px-4">{r.purok}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {new Date(r.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <RegistrationStatusBadge status={r.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {r.status === "Pending" ? (
                          <div className="inline-flex items-center gap-1 justify-end">
                            <button
                              onClick={() => handleStatusChange(r.id, "Approved")}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(r.id, "Rejected")}
                              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-[#94A3B8]">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#0F172A]">Program Description</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            {program.description || "No description provided."}
          </p>

          <div className="pt-4 border-t border-[#ECE7DF] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Venue</p>
              <p className="font-semibold text-[#0F172A] mt-0.5">{program.location}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Schedule</p>
              <p className="font-semibold text-[#0F172A] mt-0.5">{program.schedule}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
