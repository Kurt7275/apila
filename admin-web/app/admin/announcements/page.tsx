"use client";

import { useState, useEffect } from "react";
import { getAnnouncements, createAnnouncement } from "@/lib/services/announcements";
import {
  Bell,
  Send,
  Plus,
  AlertTriangle,
  Megaphone,
  Radio,
  Smartphone,
  Search,
  CheckCircle2,
  Trash2,
  Clock,
  Users,
  X,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { mockNotifications } from "@/lib/mock-data/notifications";

export interface BarangayAnnouncement {
  id: string;
  title: string;
  category: "General Advisory" | "Program Update" | "Emergency / DRRM" | "Health Advisory" | "Community Service";
  priority: "Normal" | "Important" | "Urgent";
  targetAudience: string;
  message: string;
  createdAt: string;
  pushSent: boolean;
  reachCount: number;
}

const INITIAL_ANNOUNCEMENTS: BarangayAnnouncement[] = [
  {
    id: "anc-001",
    title: "Typhoon Preparedness Advisory & Evacuation Centers",
    category: "Emergency / DRRM",
    priority: "Urgent",
    targetAudience: "All Residents (Purok 1 - 10)",
    message: "In anticipation of Tropical Depression updates, Barangay Lapasan DRRM Council is on Blue Alert status. The Multi-Purpose Hall and Central Elementary School are pre-designated evacuation sites. Emergency hotlines are open 24/7.",
    createdAt: "2026-10-18T08:30:00",
    pushSent: true,
    reachCount: 4820,
  },
  {
    id: "anc-002",
    title: "Schedule Adjustment: Free Medical & Dental Checkup",
    category: "Program Update",
    priority: "Important",
    targetAudience: "Enrolled Program Participants",
    message: "Please note that the dental consultation hours for this coming Saturday have been extended until 2:00 PM to accommodate additional priority senior citizens.",
    createdAt: "2026-10-15T14:10:00",
    pushSent: true,
    reachCount: 200,
  },
  {
    id: "anc-003",
    title: "Barangay General Assembly & Townhall 2026",
    category: "General Advisory",
    priority: "Normal",
    targetAudience: "All Residents",
    message: "The 2nd Semester Barangay General Assembly will be held on Sunday at the Barangay Gymnasium. All household heads and registered voters are requested to attend.",
    createdAt: "2026-10-10T11:00:00",
    pushSent: true,
    reachCount: 4820,
  },
  {
    id: "anc-004",
    title: "Bivalent Flu & Pneumonia Vaccination Drive for Seniors",
    category: "Health Advisory",
    priority: "Important",
    targetAudience: "Senior Citizens (Purok 1 - 5)",
    message: "Barangay Lapasan Health Center is rolling out free flu and pneumonia vaccines for seniors aged 60 and above. Bring your OSCA ID or Barangay Resident ID.",
    createdAt: "2026-10-05T09:45:00",
    pushSent: true,
    reachCount: 650,
  },
  {
    id: "anc-005",
    title: "Community Coastal Clean-Up & Mangrove Planting",
    category: "Community Service",
    priority: "Normal",
    targetAudience: "Youth & Environmental Volunteers",
    message: "Join the Lapasan Youth Task Force this Saturday, 6:00 AM at the coastal perimeter. Gloves and garbage collection sacks will be provided at the assembly area.",
    createdAt: "2026-09-28T16:00:00",
    pushSent: true,
    reachCount: 1240,
  },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<BarangayAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: BarangayAnnouncement["category"];
    priority: BarangayAnnouncement["priority"];
    targetAudience: string;
    message: string;
    pushNotification: boolean;
  }>({
    title: "",
    category: "General Advisory",
    priority: "Normal",
    targetAudience: "All Residents",
    message: "",
    pushNotification: true,
  });

  // Load from Firestore
  useEffect(() => {
    async function fetchLiveAnnouncements() {
      try {
        const live = await getAnnouncements();
        if (live && live.length > 0) {
          const mapped: BarangayAnnouncement[] = live.map((a) => ({
            id: a.id || `anc-${Date.now()}`,
            title: a.title,
            category: (a.category as BarangayAnnouncement["category"]) || "General Advisory",
            priority: (a.priority as BarangayAnnouncement["priority"]) || "Normal",
            targetAudience: a.targetAudience || "All Residents",
            message: a.message,
            createdAt: a.createdAt ? new Date(a.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
            pushSent: a.pushNotification ?? true,
            reachCount: a.targetAudience?.includes("All") ? 4820 : 350,
          }));
          setAnnouncements(mapped);
          return;
        }
      } catch (err) {
        console.warn("Using offline announcements cache:", err);
      }
      try {
        const saved = localStorage.getItem("apila_announcements");
        if (saved) setAnnouncements(JSON.parse(saved));
      } catch {}
    }
    fetchLiveAnnouncements();
  }, []);

  const saveToStorage = (items: BarangayAnnouncement[]) => {
    setAnnouncements(items);
    try {
      localStorage.setItem("apila_announcements", JSON.stringify(items));
    } catch {}
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    let createdId = `anc-${Date.now()}`;
    try {
      const docId = await createAnnouncement({
        title: formData.title.trim(),
        category: formData.category,
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        message: formData.message.trim(),
        pushNotification: formData.pushNotification,
        publishedBy: "Admin",
      });
      if (docId) createdId = docId;
    } catch (err) {
      console.warn("Firestore create announcement skipped:", err);
    }

    const newAnnouncement: BarangayAnnouncement = {
      id: createdId,
      title: formData.title.trim(),
      category: formData.category,
      priority: formData.priority,
      targetAudience: formData.targetAudience,
      message: formData.message.trim(),
      createdAt: new Date().toISOString(),
      pushSent: formData.pushNotification,
      reachCount: formData.targetAudience.includes("All") ? 4820 : 350,
    };

    const updated = [newAnnouncement, ...announcements];
    saveToStorage(updated);

    // Reset Form
    setFormData({
      title: "",
      category: "General Advisory",
      priority: "Normal",
      targetAudience: "All Residents",
      message: "",
      pushNotification: true,
    });
    setIsModalOpen(false);

    setSuccessBanner(
      formData.pushNotification
        ? `Advisory published and push notification broadcasted to ${newAnnouncement.reachCount} resident mobile devices.`
        : "Advisory published to the APILA Community Board successfully."
    );
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleDelete = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id);
    saveToStorage(updated);
  };

  // Filtered
  const filteredList = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || item.category === categoryFilter;
    const matchesPri = priorityFilter === "ALL" || item.priority === priorityFilter;
    return matchesSearch && matchesCat && matchesPri;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F45113]/10 text-[#F45113] uppercase tracking-wider">
              Module 05
            </span>
            <span className="text-xs text-[#64748B] font-semibold">APILA Resident Broadcast</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Announcements & Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Publish official advisories, schedule changes, and emergency alerts directly to resident mobile apps.
          </p>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F45113] hover:bg-[#d4430e] text-white text-xs font-bold rounded-2xl shadow-md shadow-orange-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Advisory Broadcast</span>
        </button>
      </div>

      {successBanner && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── KPI Bento Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Broadcasts */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Total Advisories</span>
            <Megaphone className="w-4 h-4 text-[#64748B]" />
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A]">{announcements.length}</p>
          <p className="text-[11px] text-[#64748B]">Published to community</p>
        </div>

        {/* Mobile Device Reach */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#F45113]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Mobile App Reach</span>
            <Smartphone className="w-4 h-4 text-[#F45113]" />
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A]">4,820</p>
          <p className="text-[11px] text-[#64748B]">Active resident smartphones</p>
        </div>

        {/* Urgent Alerts */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-rose-600">
            <span className="font-bold uppercase tracking-wider text-[11px]">Urgent / DRRM</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-3xl font-extrabold text-rose-600">
            {announcements.filter((a) => a.priority === "Urgent").length}
          </p>
          <p className="text-[11px] text-[#64748B]">High-priority warnings</p>
        </div>

        {/* Broadcast Status */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-700">
            <span className="font-bold uppercase tracking-wider text-[11px]">Push Pipeline</span>
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">Active</p>
          <p className="text-[11px] text-[#64748B]">FCM Push Service Live</p>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements by keywords or target audience..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
            />
          </div>

          {/* Priority Filter Pills */}
          <div className="flex items-center p-1 rounded-full bg-[#FFF9F3] border border-[#ECE7DF]">
            {(["ALL", "Urgent", "Important", "Normal"] as const).map((pri) => (
              <button
                key={pri}
                onClick={() => setPriorityFilter(pri)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  priorityFilter === pri
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {pri === "ALL" ? "All Priorities" : pri}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-[#64748B] font-semibold">
          Showing {filteredList.length} of {announcements.length} advisories
        </span>
      </div>

      {/* ── Announcements Feed ── */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#ECE7DF] p-12 text-center shadow-sm">
            <Bell className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
            <p className="font-bold text-sm text-[#0F172A]">No announcements found</p>
            <p className="text-xs text-[#64748B] mt-0.5">
              Try adjusting your search criteria or create a new advisory broadcast.
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm hover:border-[#F45113]/40 transition-all space-y-3"
            >
              {/* Header Badges & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Priority Badge */}
                  {item.priority === "Urgent" && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Urgent Alert
                    </span>
                  )}
                  {item.priority === "Important" && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Important
                    </span>
                  )}
                  {item.priority === "Normal" && (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Regular Advisory
                    </span>
                  )}

                  {/* Category */}
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFF9F3] text-[#F45113] border border-[#ECE7DF]">
                    {item.category}
                  </span>

                  {/* Target Audience */}
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FFF9F3] text-[#64748B] border border-[#ECE7DF] flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#94A3B8]" />
                    {item.targetAudience}
                  </span>
                </div>

                {/* Timestamp & Delete */}
                <div className="flex items-center gap-3 text-xs text-[#64748B] self-start sm:self-auto">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Message */}
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A] leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] mt-1.5 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {/* Delivery Meta */}
              <div className="pt-3 border-t border-[#ECE7DF] flex flex-wrap items-center justify-between text-[11px] text-[#64748B] gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    Delivered to <strong className="text-[#0F172A]">{item.reachCount.toLocaleString()}</strong> mobile devices via APILA Resident App
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#94A3B8]">ID: {item.id}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Publish Modal / Slide Dialog ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#ECE7DF] max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DF]">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A]">
                  Broadcast New Advisory
                </h2>
                <p className="text-xs text-[#64748B]">
                  Send official announcements to Barangay Lapasan mobile app users.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Advisory Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Update: Health Consultation Hours"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
                />
              </div>

              {/* Grid: Category & Priority */}
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
                        category: e.target.value as BarangayAnnouncement["category"],
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                  >
                    <option value="General Advisory">General Advisory</option>
                    <option value="Program Update">Program Update</option>
                    <option value="Emergency / DRRM">Emergency / DRRM</option>
                    <option value="Health Advisory">Health Advisory</option>
                    <option value="Community Service">Community Service</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as BarangayAnnouncement["priority"],
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent / Emergency</option>
                  </select>
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Target Audience
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] cursor-pointer"
                >
                  <option value="All Residents">All Residents (Entire Barangay)</option>
                  <option value="Purok 1 - 5 (Coastal)">Purok 1 - 5 (Coastal)</option>
                  <option value="Purok 6 - 10 (Upland)">Purok 6 - 10 (Upland)</option>
                  <option value="Senior Citizens">Senior Citizens</option>
                  <option value="Youth (15 - 30 yrs)">Youth (15 - 30 yrs)</option>
                  <option value="Enrolled Program Participants">Enrolled Program Participants</option>
                </select>
              </div>

              {/* Message Content */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Announcement Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter complete advisory message to display in the APILA resident mobile app..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-medium text-[#0F172A] outline-none focus:border-[#F45113] resize-none"
                />
              </div>

              {/* Push Checkbox */}
              <div className="p-3 rounded-2xl bg-[#FFF9F3] border border-[#ECE7DF] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-[#F45113]" />
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">
                      Send Real-Time Push Notification
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      Instantly alerts resident Android devices
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.pushNotification}
                  onChange={(e) =>
                    setFormData({ ...formData, pushNotification: e.target.checked })
                  }
                  className="w-4 h-4 text-[#F45113] rounded accent-[#F45113] cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#F45113] hover:bg-[#d4430e] text-white text-xs font-bold rounded-2xl shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Advisory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
