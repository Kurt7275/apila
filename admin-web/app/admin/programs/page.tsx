"use client";

import { useState, useEffect } from "react";
import { ProgramCategory, ProgramStatus } from "@/types";
import { subscribeToPrograms, createProgram, updateProgram, deleteProgram, Program } from "@/lib/services/programs";
import { logAuditEvent } from "@/lib/services/auditLogs";
import { useAdminProfile } from "@/lib/context/AdminProfileContext";
import { ProgramStatusBadge } from "@/components/shared/StatusBadges";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ChevronDown,
  X,
  AlertTriangle,
  Wifi,
} from "lucide-react";

const CATEGORIES: ProgramCategory[] = [
  "Health",
  "Education",
  "Livelihood",
  "Senior Citizens",
  "Youth",
  "Women",
  "Environment",
  "Disaster Risk",
];

const STATUS_OPTIONS: ProgramStatus[] = ["Active", "Upcoming", "Completed", "Cancelled"];

const CATEGORY_COLORS: Record<string, string> = {
  Health: "bg-emerald-100 text-emerald-700",
  Education: "bg-blue-100 text-blue-700",
  Livelihood: "bg-amber-100 text-amber-700",
  "Senior Citizen": "bg-purple-100 text-purple-700",
  Youth: "bg-cyan-100 text-cyan-700",
  Women: "bg-pink-100 text-pink-700",
  Environment: "bg-lime-100 text-lime-700",
  "Disaster Risk": "bg-rose-100 text-rose-700",
};

const emptyForm = {
  title: "",
  category: "Health" as ProgramCategory,
  description: "",
  schedule: "",
  location: "Barangay Lapasan Multi-Purpose Hall",
  registrationDeadline: "",
  slots: 50,
  officer: "",
  status: "Active" as ProgramStatus,
};

export default function AdminProgramsPage() {
  const { profile } = useAdminProfile();
  const officerName = profile?.name ?? "Admin Officer";

  // ── Live Data ──────────────────────────────────────────────────────────────
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const unsub = subscribeToPrograms((list) => {
      setPrograms(list);
      setIsLive(true);
    });
    return unsub;
  }, []);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const filtered = programs.filter((p) => {
    const matchSearch =
      search.trim() === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.officer?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchCategory = categoryFilter === "ALL" || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const openCreate = () => {
    setEditingProgram(null);
    setFormData(emptyForm);
    setSaveError("");
    setIsModalOpen(true);
  };

  const openEdit = (p: Program) => {
    setEditingProgram(p);
    setFormData({
      title: p.title,
      category: (p.category as ProgramCategory) ?? "Health",
      description: p.description ?? "",
      schedule: p.schedule ?? "",
      location: p.location ?? "Barangay Lapasan Multi-Purpose Hall",
      registrationDeadline: (p as any).registrationDeadline ?? "",
      slots: p.slots ?? 50,
      officer: p.officer ?? "",
      status: (p.status as ProgramStatus) ?? "Active",
    });
    setSaveError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        schedule: formData.schedule.trim(),
        location: formData.location.trim(),
        registrationDeadline: formData.registrationDeadline,
        slots: Number(formData.slots),
        officer: formData.officer.trim(),
        status: formData.status,
      };
      if (editingProgram?.id) {
        await updateProgram(editingProgram.id, payload);
        await logAuditEvent({
          officer: officerName,
          action: `Updated program "${formData.title}"`,
          category: "Programs",
          ipTerminal: "Admin Web",
          status: "Success",
        });
      } else {
        const newId = await createProgram({ ...payload, enrolledCount: 0 });
        await logAuditEvent({
          officer: officerName,
          action: `Created program "${formData.title}" (ID: ${newId})`,
          category: "Programs",
          ipTerminal: "Admin Web",
          status: "Success",
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      setSaveError("Failed to save. Check your connection and try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Program | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setIsDeleting(true);
    try {
      await deleteProgram(deleteTarget.id);
      await logAuditEvent({
        officer: officerName,
        action: `Deleted program "${deleteTarget.title}"`,
        category: "Programs",
        ipTerminal: "Admin Web",
        status: "Success",
      });
      setDeleteTarget(null);
    } catch {
      // keep modal open on error
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSlots = programs.reduce((sum, p) => sum + (p.slots ?? 0), 0);
  const totalEnrolled = programs.reduce((sum, p) => sum + (p.enrolledCount ?? 0), 0);
  const activeCount = programs.filter((p) => p.status === "Active").length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 bg-[#FFF9F3] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0F172A]">Programs</h1>
            {isLive && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                <Wifi className="w-3 h-3" /> LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            {programs.length} program{programs.length !== 1 ? "s" : ""} · {activeCount} active ·{" "}
            {totalEnrolled}/{totalSlots} slots filled
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F45113] hover:bg-[#d4430e] text-white text-sm font-bold rounded-2xl shadow-md shadow-orange-500/20 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Program
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Programs", value: programs.length, icon: Sparkles, color: "text-[#F45113]" },
          { label: "Active", value: activeCount, icon: CheckCircle, color: "text-emerald-600" },
          { label: "Total Slots", value: totalSlots, icon: Users, color: "text-blue-600" },
          { label: "Enrolled", value: totalEnrolled, icon: Users, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-3xl border border-[#ECE7DF] px-4 py-3 flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-[#FFF9F3] ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-[#0F172A]">{value}</p>
              <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wide">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search programs, officers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-white text-sm text-[#0F172A] outline-none focus:border-[#F45113]"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl border border-[#ECE7DF] bg-white text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl border border-[#ECE7DF] bg-white text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
        </div>
      </div>

      {/* Program Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#94A3B8]">
          <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">
            {programs.length === 0 ? "No programs yet — create your first one!" : "No programs match your filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const fillPct = p.slots > 0 ? Math.min(100, Math.round(((p.enrolledCount ?? 0) / p.slots) * 100)) : 0;
            const isFull = (p.enrolledCount ?? 0) >= p.slots;
            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-[#ECE7DF] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-[#0F172A] text-sm leading-snug line-clamp-2">{p.title}</h3>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${CATEGORY_COLORS[p.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.category}
                    </span>
                  </div>
                  <ProgramStatusBadge status={p.status as ProgramStatus} />
                </div>

                {/* Description */}
                {p.description && (
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{p.description}</p>
                )}

                {/* Meta */}
                <div className="space-y-1.5">
                  {p.schedule && (
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-[#F45113]" />
                      <span className="truncate">{p.schedule}</span>
                    </div>
                  )}
                  {p.location && (
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#F45113]" />
                      <span className="truncate">{p.location}</span>
                    </div>
                  )}
                </div>

                {/* Capacity bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> Enrollment
                    </span>
                    <span className={isFull ? "text-rose-600" : "text-[#0F172A]"}>
                      {p.enrolledCount ?? 0}/{p.slots} {isFull && "· FULL"}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#ECE7DF] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isFull ? "bg-rose-500" : "bg-[#F45113]"}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#ECE7DF]">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-2xl bg-[#FFF9F3] hover:bg-orange-50 text-[#F45113] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#ECE7DF]">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A]">
                  {editingProgram ? "Edit Program" : "New Barangay Program"}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {editingProgram ? "Update program details in Firestore" : "Publish a new program to the resident app"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#FFF9F3] text-[#64748B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Program Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Libreng Gamot para sa Lapasan"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
                />
              </div>

              {/* Category + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Category *</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as ProgramCategory })}
                      className="w-full appearance-none px-3.5 pr-8 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Status</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ProgramStatus })}
                      className="w-full appearance-none px-3.5 pr-8 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this program's purpose and benefits…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] resize-none"
                />
              </div>

              {/* Schedule + Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Schedule *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Every Saturday, 8:00 AM"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Reg. Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                  />
                </div>
              </div>

              {/* Location + Slots */}
              <div className="grid grid-cols-2 gap-4">
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
                    Max Slots *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={9999}
                    value={formData.slots}
                    onChange={(e) => setFormData({ ...formData, slots: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
                  />
                </div>
              </div>

              {/* Officer */}
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

              {saveError && (
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 px-3 py-2 rounded-xl">{saveError}</p>
              )}

              {/* Footer buttons */}
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
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#F45113] hover:bg-[#d4430e] disabled:opacity-60 text-white text-xs font-bold rounded-2xl shadow-md shadow-orange-500/20 cursor-pointer transition-colors"
                >
                  {isSaving ? "Saving…" : editingProgram ? "Update Program" : "Publish Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0F172A]">Delete Program?</h3>
                <p className="text-xs text-[#64748B] mt-0.5">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-[#0F172A] bg-[#FFF9F3] rounded-2xl px-4 py-3 font-semibold">
              "{deleteTarget.title}"
            </p>
            {(deleteTarget.enrolledCount ?? 0) > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 font-semibold">
                ⚠ {deleteTarget.enrolledCount} resident{(deleteTarget.enrolledCount ?? 0) !== 1 ? "s" : ""} are enrolled. Their registrations will be orphaned.
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-2xl border border-[#ECE7DF] text-xs font-bold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                {isDeleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
