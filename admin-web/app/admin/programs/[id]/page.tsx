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
  Edit,
  Download,
  Send,
  UserCheck,
  Search,
  Filter,
  FileText,
} from "lucide-react";
import { mockPrograms } from "@/lib/mock-data/programs";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { mockResidents } from "@/lib/mock-data/residents";
import { RegistrationStatusBadge, ProgramStatusBadge } from "@/components/shared/StatusBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-6">
      {/* Back Button & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/programs"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 font-medium mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Programs List
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">
              {program.title}
            </h1>
            <ProgramStatusBadge status={program.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Edit className="w-4 h-4" /> Edit Program
          </Button>
          <Button
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(registrations, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `apila_${program.id}_roster.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
          >
            <Download className="w-4 h-4" /> Export Roster
          </Button>
        </div>
      </div>

      {/* Program Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Capacity & Enrolled</p>
              <p className="text-lg font-bold text-slate-900">
                {program.enrolled} / {program.slots}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Approved Participants</p>
              <p className="text-lg font-bold text-slate-900">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pending Review</p>
              <p className="text-lg font-bold text-slate-900">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Schedule Date</p>
              <p className="text-sm font-bold text-slate-900">{program.schedule}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("roster")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "roster"
              ? "border-emerald-700 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Participant Roster ({registrations.length})
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "details"
              ? "border-emerald-700 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Program Specifications & Benefits
        </button>
      </div>

      {activeTab === "roster" ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Roster Table */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Registered Residents Roster
                  </CardTitle>

                  {/* Filter Controls */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                      <Input
                        placeholder="Search resident or purok..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 text-xs h-9 w-48"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-9 px-2.5 text-xs border border-slate-200 rounded-md bg-white text-slate-700 font-medium"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Resident Name</th>
                        <th className="px-4 py-3">Purok</th>
                        <th className="px-4 py-3">Registration Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                            No resident registrations found matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredRegistrations.map((reg) => (
                          <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {reg.residentName}
                            </td>
                            <td className="px-4 py-3">{reg.purok}</td>
                            <td className="px-4 py-3 text-slate-500">{reg.registeredAt}</td>
                            <td className="px-4 py-3">
                              <RegistrationStatusBadge status={reg.status} />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {reg.status === "Pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-[11px] border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-2"
                                      onClick={() => handleStatusChange(reg.id, "Approved")}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-[11px] border-rose-300 text-rose-700 hover:bg-rose-50 px-2"
                                      onClick={() => handleStatusChange(reg.id, "Rejected")}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {reg.status === "Approved" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[11px] border-blue-600 text-blue-700 hover:bg-blue-50 px-2"
                                    onClick={() => handleStatusChange(reg.id, "Completed")}
                                  >
                                    Mark Completed
                                  </Button>
                                )}
                                {reg.status === "Completed" && (
                                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5" /> Attended
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel: Broadcast Announcement */}
          <div className="space-y-4">
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  Broadcast Announcement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Send SMS/Notification alert directly to all {registrations.length} registered participants for this program.
                </p>

                {broadcastSent && (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-md border border-emerald-200 font-medium">
                    ✓ Notification broadcast sent to {registrations.length} participants!
                  </div>
                )}

                <form onSubmit={handleSendBroadcast} className="space-y-3">
                  <textarea
                    rows={4}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="e.g. Please bring your valid ID and wear comfortable shoes for tomorrow's session at the Lapasan Covered Court..."
                    className="w-full p-2.5 border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <Button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                  >
                    Send SMS & Portal Alert
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Details Tab */
        <Card className="bg-white border-slate-200 max-w-3xl">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Program Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{program.description}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">Participant Benefits</h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {program.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">Requirements</h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {program.requirements.map((r, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
