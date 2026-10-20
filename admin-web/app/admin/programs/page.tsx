"use client";

import { useState } from "react";
import Link from "next/link";
import { mockPrograms } from "@/lib/mock-data/programs";
import { Program, ProgramCategory, ProgramStatus } from "@/types";
import {
  Plus,
  Search,
  Pencil,
  Eye,
  Calendar,
  MapPin,
  Users,
  Archive,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import { ProgramStatusBadge } from "@/components/shared/StatusBadges";

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Health" as ProgramCategory,
    description: "",
    schedule: "",
    location: "Barangay Lapasan Multi-Purpose Hall",
    registrationDeadline: "2026-11-15",
    slots: 100,
    officer: "Barangay Health Officer",
    status: "Active" as ProgramStatus,
  });

  const openCreateModal = () => {
    setEditingProgram(null);
    setFormData({
      title: "",
      category: "Health",
      description: "",
      schedule: "Saturdays, 8:00 AM – 12:00 PM",
      location: "Barangay Lapasan Multi-Purpose Hall",
      registrationDeadline: "2026-11-15",
      slots: 100,
      officer: "Barangay Health Officer",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Program) => {
    setEditingProgram(p);
    setFormData({
      title: p.title,
      category: p.category,
      description: p.description,
      schedule: p.schedule,
      location: p.location,
      registrationDeadline: p.endDate || "2026-11-15",
      slots: p.slots,
      officer: p.officer,
      status: p.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingProgram) {
      setPrograms((prev) =>
        prev.map((item) =>
          item.id === editingProgram.id
            ? {
                ...item,
                ...formData,
                endDate: formData.registrationDeadline,
              }
            : item
        )
      );
    } else {
      const newProgram: Program = {
        id: `prog-${Date.now()}`,
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        schedule: formData.schedule.trim(),
        location: formData.location.trim(),
        slots: Number(formData.slots),
        enrolled: 0,
        status: formData.status,
        officer: formData.officer.trim(),
        benefits: ["Official barangay support", "Community services"],
        requirements: ["Barangay Lapasan Resident ID"],
        startDate: new Date().toISOString().split("T")[0],
        endDate: formData.registrationDeadline,
        tags: [formData.category.toLowerCase()],
      };
      setPrograms([newProgram, ...programs]);
    }

    setIsModalOpen(false);
  };

  const handleUpdateStatus = (id: string, newStatus: ProgramStatus) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F45113]/10 text-[#F45113] uppercase tracking-wider">
              Module 02
            </span>
            <span className="text-xs text-[#64748B] font-semibold">
              Community Program Lifecycle
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Program Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Create, update, publish, and archive community programs. Published programs synchronize with resident mobile applications.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F45113] hover:bg-[#d4430e] text-white text-xs font-bold rounded-2xl shadow-md shadow-orange-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Program</span>
        </button>
      </div>

      {/* ── Quick KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Programs", count: programs.filter((p) => p.status === "Active").length, color: "text-[#F45113]" },
          { label: "Upcoming", count: programs.filter((p) => p.status === "Upcoming").length, color: "text-[#0F172A]" },
          { label: "Completed", count: programs.filter((p) => p.status === "Completed").length, color: "text-emerald-600" },
          { label: "Cancelled / Archived", count: programs.filter((p) => p.status === "Cancelled").length, color: "text-[#64748B]" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-3xl border border-[#ECE7DF] p-4 shadow-sm">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{item.label}</p>
            <p className={`text-2xl font-extrabold ${item.color} mt-1`}>{item.count}</p>
          </div>
        ))}
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search programs by title or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center p-1 rounded-full bg-[#FFF9F3] border border-[#ECE7DF]">
            {(["ALL", "Active", "Upcoming", "Completed", "Cancelled"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {st === "ALL" ? "All Programs" : st}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-[#64748B] font-semibold">
          Showing {filteredPrograms.length} of {programs.length} programs
        </span>
      </div>

      {/* ── Programs Roster Table ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFF9F3]/70 border-b border-[#ECE7DF] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Program Title & Venue</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Schedule</th>
                <th className="py-3 px-4">Participant Capacity</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DF]">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B]">
                    <p className="font-bold text-sm text-[#0F172A]">No programs found</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((p) => {
                  const percent = Math.min(100, Math.round((p.enrolled / p.slots) * 100));
                  return (
                    <tr key={p.id} className="hover:bg-[#FFF9F3]/40 transition-colors group">
                      {/* Title & Venue */}
                      <td className="py-3.5 px-5 max-w-xs">
                        <Link
                          href={`/admin/programs/${p.id}`}
                          className="font-bold text-[#0F172A] group-hover:text-[#F45113] transition-colors block text-sm"
                        >
                          {p.title}
                        </Link>
                        <p className="text-[11px] text-[#64748B] mt-0.5 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#94A3B8]" />
                          {p.location}
                        </p>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">
                          Officer: {p.officer}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF9F3] text-[#F45113] border border-[#ECE7DF]">
                          {p.category}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="py-3.5 px-4 text-[#475569]">
                        <p className="font-semibold text-[#0F172A]">{p.schedule}</p>
                        <p className="text-[10px] text-[#94A3B8]">
                          Deadline: {p.endDate || "Ongoing"}
                        </p>
                      </td>

                      {/* Capacity Meter */}
                      <td className="py-3.5 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                            <span>{p.enrolled} / {p.slots} slots</span>
                            <span className="font-bold text-[#0F172A]">{percent}%</span>
                          </div>
                          <div className="w-full bg-[#FFF9F3] h-1.5 rounded-full overflow-hidden border border-[#ECE7DF]">
                            <div
                              className="bg-[#F45113] h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <ProgramStatusBadge status={p.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Link
                            href={`/admin/programs/${p.id}`}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#FFF9F3] hover:bg-[#F45113] text-[#0F172A] hover:text-white border border-[#ECE7DF] hover:border-[#F45113] transition-colors"
                            title="View Roster & Details"
                          >
                            <Eye className="w-3.5 h-3.5 inline mr-1" />
                            View
                          </Link>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-[#0F172A] hover:bg-[#FFF9F3] border border-transparent hover:border-[#ECE7DF] transition-colors cursor-pointer"
                            title="Edit Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
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
      </div>

      {/* ── Create / Edit Program Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#ECE7DF] max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DF]">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A]">
                  {editingProgram ? "Update Community Program" : "Create Community Program"}
                </h2>
                <p className="text-xs text-[#64748B]">
                  Published programs become immediately accessible to residents in the APILA mobile app.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Program Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Medical and Dental Checkup"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ProgramCategory,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                  >
                    {[
                      "Health",
                      "Livelihood",
                      "Youth",
                      "Senior Citizens",
                      "Sports",
                      "Scholarship",
                      "Environment",
                      "Disaster Relief",
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Participant Capacity (Slots) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.slots}
                    onChange={(e) => setFormData({ ...formData, slots: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Program Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the scope, services, and objective of this barangay program..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-medium text-[#0F172A] outline-none focus:border-[#F45113] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Schedule & Frequency *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Every 2nd Saturday, 8:00 AM"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Location / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Barangay Multi-Purpose Hall"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Lead Program Officer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Maria Santos"
                    value={formData.officer}
                    onChange={(e) => setFormData({ ...formData, officer: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Program Lifecycle Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProgramStatus })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                >
                  <option value="Active">Active (Published to Resident Mobile App)</option>
                  <option value="Upcoming">Upcoming (Scheduled)</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECE7DF]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#F45113] hover:bg-[#d4430e] text-white text-xs font-bold rounded-2xl shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {editingProgram ? "Update Program" : "Publish Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
