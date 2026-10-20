"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  Sparkles,
} from "lucide-react";
import { mockPrograms } from "@/lib/mock-data/programs";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { RegistrationStatusBadge, ProgramStatusBadge } from "@/components/shared/StatusBadges";
import { RegistrationStatus } from "@/types";

export default function AdminProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const program = mockPrograms.find((p) => p.id === id);

  if (!program) {
    notFound();
  }

  // Filter registrations for this program
  const [registrations, setRegistrations] = useState(
    mockRegistrations.filter((r) => r.programId === id)
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"roster" | "details">("roster");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  const handleStatusChange = (regId: string, newStatus: RegistrationStatus) => {
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
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      r.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.purok.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approvedCount = registrations.filter((r) => r.status === "Approved" || r.status === "Completed").length;
  const pendingCount = registrations.filter((r) => r.status === "Pending").length;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMessage("");
    }, 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      {/* ── Top Bar: Back Link & Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/programs"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#F45113] font-bold mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Programs Management
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
            <span>Export Roster (JSON)</span>
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
          Program Specifications & Benefits
        </button>
      </div>

      {activeTab === "roster" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Roster Table (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#ECE7DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative min-w-[220px] flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search resident or purok..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 rounded-full border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {(["All", "Pending", "Approved", "Completed", "Rejected"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        statusFilter === st
                          ? "bg-[#F45113] text-white"
                          : "text-[#64748B] hover:text-[#0F172A] bg-[#FFF9F3]"
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
                      <th className="py-3 px-4">Resident Name</th>
                      <th className="py-3 px-3">Purok</th>
                      <th className="py-3 px-3">Registration Date</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECE7DF]">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-[#64748B]">
                          No registered residents match your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-[#FFF9F3]/40 transition-colors">
                          <td className="py-3 px-4 font-bold text-[#0F172A]">
                            {reg.residentName}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF9F3] border border-[#ECE7DF]">
                              {reg.purok}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#64748B] text-[11px]">
                            {new Date(reg.registeredAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <RegistrationStatusBadge status={reg.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            {reg.status === "Pending" && (
                              <div className="inline-flex items-center gap-1 justify-end">
                                <button
                                  onClick={() => handleStatusChange(reg.id, "Approved")}
                                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusChange(reg.id, "Rejected")}
                                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {reg.status === "Approved" && (
                              <button
                                onClick={() => handleStatusChange(reg.id, "Completed")}
                                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                              >
                                Mark Completed
                              </button>
                            )}
                            {reg.status === "Completed" && (
                              <span className="text-[11px] text-emerald-700 font-bold inline-flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Attended
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
          </div>

          {/* Side Panel: Broadcast Announcement to this program (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#F45113]" />
                  Broadcast to Participants
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Send a push notification alert directly to all {registrations.length} registered residents.
                </p>
              </div>

              {broadcastSent && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Notification broadcast sent to {registrations.length} participants!</span>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Please bring your valid ID for tomorrow's checkup at the Lapasan Multi-Purpose Hall..."
                  className="w-full p-3 border border-[#ECE7DF] bg-[#FFF9F3] rounded-2xl text-xs font-medium text-[#0F172A] outline-none focus:border-[#F45113] resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#F45113] hover:bg-[#d4430e] text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast to Resident App</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Details Tab */
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A]">Program Description</h3>
            <p className="text-xs sm:text-sm text-[#475569] mt-2 leading-relaxed">
              {program.description}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-[#ECE7DF]">
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                Participant Benefits
              </h4>
              <ul className="space-y-1.5 text-xs text-[#475569]">
                {program.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F45113]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                Requirements
              </h4>
              <ul className="space-y-1.5 text-xs text-[#475569]">
                {program.requirements.map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F172A]" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
