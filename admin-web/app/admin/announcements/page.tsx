"use client";

import { useState, useEffect } from "react";
import {
  subscribeToAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  Announcement,
} from "@/lib/services/announcements";
import { subscribeToResidents } from "@/lib/services/residents";
import { logAuditEvent } from "@/lib/services/auditLogs";
import { useAdminProfile } from "@/lib/context/AdminProfileContext";
import {
  Bell,
  Send,
  Plus,
  Megaphone,
  Smartphone,
  Search,
  Trash2,
  Clock,
  Users,
  X,
  ShieldAlert,
  Wifi,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Info,
  Zap,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type Category =
  | "General Advisory"
  | "Program Update"
  | "Emergency / DRRM"
  | "Health Advisory"
  | "Community Service";

type Priority = "Normal" | "Important" | "Urgent";

const CATEGORIES: Category[] = [
  "General Advisory",
  "Program Update",
  "Emergency / DRRM",
  "Health Advisory",
  "Community Service",
];

const TARGET_AUDIENCES = [
  "All Residents",
  "Purok 1 - 5 (Coastal)",
  "Purok 6 - 10 (Upland)",
  "Senior Citizens",
  "Youth (15 - 30 yrs)",
  "Enrolled Program Participants",
];

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string; icon: React.ReactNode }> = {
  Normal: {
    label: "Normal",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: <Info className="w-3 h-3" />,
  },
  Important: {
    label: "Important",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <Bell className="w-3 h-3" />,
  },
  Urgent: {
    label: "URGENT",
    className: "bg-rose-100 text-rose-700 border-rose-200",
    icon: <ShieldAlert className="w-3 h-3" />,
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "General Advisory": "bg-blue-100 text-blue-700",
  "Program Update": "bg-purple-100 text-purple-700",
  "Emergency / DRRM": "bg-rose-100 text-rose-700",
  "Health Advisory": "bg-emerald-100 text-emerald-700",
  "Community Service": "bg-amber-100 text-amber-700",
};

const emptyForm = {
  title: "",
  category: "General Advisory" as Category,
  priority: "Normal" as Priority,
  targetAudience: "All Residents",
  message: "",
};

function timeAgo(ts: Announcement["createdAt"]): string {
  if (!ts) return "Just now";
  const ms = ts.seconds * 1000;
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminAnnouncementsPage() {
  const { profile } = useAdminProfile();
  const officerName = profile?.name ?? "Admin Officer";

  // ── Live Data ──────────────────────────────────────────────────────────
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [residentCount, setResidentCount] = useState(0);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const unsubAnn = subscribeToAnnouncements((list) => {
      setAnnouncements(list);
      setIsLive(true);
    });
    const unsubRes = subscribeToResidents((list) => {
      setResidentCount(list.length);
    });
    return () => { unsubAnn(); unsubRes(); };
  }, []);

  // ── Filters ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const filtered = announcements.filter((a) => {
    const matchSearch =
      search.trim() === "" ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "ALL" || a.category === categoryFilter;
    const matchPri = priorityFilter === "ALL" || a.priority === priorityFilter;
    return matchSearch && matchCat && matchPri;
  });

  // ── Modal ──────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const openModal = () => {
    setFormData(emptyForm);
    setSaveError("");
    setIsModalOpen(true);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const id = await createAnnouncement({
        title: formData.title.trim(),
        category: formData.category,
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        message: formData.message.trim(),
        pushNotification: true,
        publishedBy: officerName,
      });
      await logAuditEvent({
        officer: officerName,
        action: `Published announcement "${formData.title}" → ${formData.targetAudience} (${formData.priority})`,
        category: "Announcements",
        ipTerminal: "Admin Web",
        status: "Success",
      });
      setIsModalOpen(false);
      setSuccessBanner(`📢 "${formData.title}" broadcast to ${formData.targetAudience}`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err) {
      setSaveError("Failed to publish. Check your connection and try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setIsDeleting(true);
    try {
      await deleteAnnouncement(deleteTarget.id);
      await logAuditEvent({
        officer: officerName,
        action: `Deleted announcement "${deleteTarget.title}"`,
        category: "Announcements",
        ipTerminal: "Admin Web",
        status: "Success",
      });
      setDeleteTarget(null);
    } catch {
      // keep modal open
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const urgentCount = announcements.filter((a) => a.priority === "Urgent").length;
  const todayCount = announcements.filter((a) => {
    if (!a.createdAt) return false;
    const d = new Date(a.createdAt.seconds * 1000);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 bg-[#FFF9F3] min-h-screen">

      {/* Success Banner */}
      {successBanner && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white text-sm font-bold rounded-2xl shadow-xl">
          <CheckCircle2 className="w-4 h-4" />
          {successBanner}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0F172A]">Announcements</h1>
            {isLive && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                <Wifi className="w-3 h-3" /> LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            {announcements.length} total · {urgentCount} urgent · {todayCount} today ·{" "}
            <span className="text-[#F45113] font-semibold">{residentCount} residents</span> reachable
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F45113] hover:bg-[#d4430e] text-white text-sm font-bold rounded-2xl shadow-md shadow-orange-500/20 transition-colors cursor-pointer"
        >
          <Megaphone className="w-4 h-4" />
          Broadcast Announcement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sent", value: announcements.length, icon: Bell, color: "text-[#F45113]" },
          { label: "Urgent / DRRM", value: urgentCount, icon: ShieldAlert, color: "text-rose-600" },
          { label: "Sent Today", value: todayCount, icon: Zap, color: "text-amber-600" },
          { label: "Residents Reached", value: residentCount, icon: Users, color: "text-emerald-600" },
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
            placeholder="Search announcements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-white text-sm text-[#0F172A] outline-none focus:border-[#F45113]"
          />
        </div>
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl border border-[#ECE7DF] bg-white text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="Important">Important</option>
            <option value="Normal">Normal</option>
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
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
        </div>
      </div>

      {/* Announcement Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#94A3B8]">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">
            {announcements.length === 0
              ? "No announcements yet — broadcast your first one!"
              : "No announcements match your filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ann) => {
            const pri = PRIORITY_CONFIG[(ann.priority as Priority) ?? "Normal"];
            return (
              <div
                key={ann.id}
                className={`bg-white rounded-3xl border p-5 flex gap-4 items-start transition-shadow hover:shadow-md ${
                  ann.priority === "Urgent" ? "border-rose-200" : "border-[#ECE7DF]"
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
                    ann.priority === "Urgent"
                      ? "bg-rose-100 text-rose-600"
                      : ann.priority === "Important"
                      ? "bg-amber-100 text-amber-600"
                      : "bg-[#FFF9F3] text-[#F45113]"
                  }`}
                >
                  {ann.priority === "Urgent" ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : ann.priority === "Important" ? (
                    <Bell className="w-5 h-5" />
                  ) : (
                    <Megaphone className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-extrabold text-[#0F172A] text-sm">{ann.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${pri.className}`}>
                      {pri.icon} {pri.label}
                    </span>
                    {ann.category && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${CATEGORY_COLORS[ann.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {ann.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3">{ann.message}</p>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mt-2.5">
                    <span className="flex items-center gap-1 text-[10px] text-[#94A3B8] font-semibold">
                      <Users className="w-3 h-3" /> {ann.targetAudience}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#94A3B8] font-semibold">
                      <Clock className="w-3 h-3" /> {timeAgo(ann.createdAt)}
                    </span>
                    {ann.publishedBy && (
                      <span className="text-[10px] text-[#94A3B8] font-semibold">
                        by {ann.publishedBy}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                      <Smartphone className="w-3 h-3" /> Sent to App
                    </span>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => setDeleteTarget(ann)}
                  className="flex-shrink-0 p-2 rounded-xl hover:bg-rose-50 text-[#94A3B8] hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Compose Modal ──────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#ECE7DF]">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A]">Broadcast Announcement</h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Publishes to Firestore → appears instantly on resident phones
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#FFF9F3] text-[#64748B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="p-6 space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Medical Check-up — Nov 5"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
                />
              </div>

              {/* Category + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Category *</label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                      className="w-full appearance-none px-3.5 pr-8 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Priority *</label>
                  <div className="relative">
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                      className="w-full appearance-none px-3.5 pr-8 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Important">Important</option>
                      <option value="Urgent">🚨 Urgent / Emergency</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Urgent warning */}
              {formData.priority === "Urgent" && (
                <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-2xl">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 font-semibold">
                    Urgent advisories appear as top-priority alerts in the resident app. Use only for emergencies or DRRM notices.
                  </p>
                </div>
              )}

              {/* Target Audience */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Target Audience *
                </label>
                <div className="relative">
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full appearance-none px-3.5 pr-8 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                  >
                    {TARGET_AUDIENCES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Announcement Details *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Enter the full advisory message that will appear in the APILA resident mobile app…"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-medium text-[#0F172A] outline-none focus:border-[#F45113] resize-none"
                />
                <p className="text-[10px] text-[#94A3B8] text-right">{formData.message.length} chars</p>
              </div>

              {/* Info notice */}
              <div className="flex items-center gap-2.5 p-3 bg-[#FFF9F3] border border-[#ECE7DF] rounded-2xl">
                <Smartphone className="w-4 h-4 text-[#F45113] flex-shrink-0" />
                <p className="text-xs text-[#64748B] font-semibold">
                  Publishing writes to Firestore → <span className="text-[#0F172A]">resident phones update instantly</span> via real-time listener. Reach: <span className="text-[#F45113] font-bold">{residentCount} residents</span>
                </p>
              </div>

              {saveError && (
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 px-3 py-2 rounded-xl">{saveError}</p>
              )}

              {/* Footer */}
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
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#F45113] hover:bg-[#d4430e] disabled:opacity-60 text-white text-xs font-bold rounded-2xl shadow-md shadow-orange-500/20 cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSaving ? "Publishing…" : "Publish Advisory"}
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
                <h3 className="font-extrabold text-[#0F172A]">Delete Announcement?</h3>
                <p className="text-xs text-[#64748B] mt-0.5">This will remove it from the resident app feed.</p>
              </div>
            </div>
            <p className="text-sm text-[#0F172A] bg-[#FFF9F3] rounded-2xl px-4 py-3 font-semibold">
              "{deleteTarget.title}"
            </p>
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
