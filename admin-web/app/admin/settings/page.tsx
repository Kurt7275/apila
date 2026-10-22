"use client";

import { useState, useEffect } from "react";
import { useAdminProfile, AdminProfile } from "@/lib/context/AdminProfileContext";
import { getAuditLogs, AuditLog } from "@/lib/services/auditLogs";
import {
  User,
  Building2,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Phone,
  Mail,
  Radio,
  Share2,
  Lock,
  KeyRound,
  Sparkles,
  MapPin,
  Clock,
  Eye,
  EyeOff,
  History,
  Download,
  Search,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { profile, updateProfile, resetProfile } = useAdminProfile();

  const [activeTab, setActiveTab] = useState<"PROFILE" | "BARANGAY" | "SECURITY" | "AUDIT">("PROFILE");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditCategory, setAuditCategory] = useState("ALL");
  const [liveLogs, setLiveLogs] = useState<AuditLog[]>([]);

  // Form State initialized from context
  const [formData, setFormData] = useState<AdminProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize when profile loads/updates
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const logs = await getAuditLogs();
        if (logs && logs.length > 0) setLiveLogs(logs);
      } catch (err) {
        console.warn("Using default audit logs:", err);
      }
    }
    fetchLogs();
  }, []);

  const handleChange = (field: keyof AdminProfile, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-compute initials when typing name
      if (field === "name") {
        const parts = value.trim().split(/\s+/);
        if (parts.length >= 2) {
          next.initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts.length === 1 && parts[0].length > 0) {
          next.initials = parts[0].slice(0, 2).toUpperCase();
        }
      }
      return next;
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleReset = () => {
    resetProfile();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            System Settings & Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Configure your administrative profile, official contact channels, and Barangay Lapasan portal settings.
          </p>
        </div>

        {/* Tab Selector Pills */}
        <div className="flex items-center p-1 rounded-full bg-white border border-[#ECE7DF] shadow-sm self-start sm:self-auto">
          {(
            [
              { id: "PROFILE", label: "Admin Profile", icon: User },
              { id: "BARANGAY", label: "Barangay Office", icon: Building2 },
              { id: "SECURITY", label: "Security", icon: Lock },
              { id: "AUDIT", label: "Audit Logs", icon: History },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#F45113] text-white shadow-sm shadow-orange-500/25"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-semibold">
              Profile updated successfully! Dashboard and Sidebar are now synchronized.
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-600">Saved</span>
        </div>
      )}

      {/* ── Tab Content ── */}
      {activeTab === "PROFILE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form: Profile Configuration (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#ECE7DF] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE7DF]">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A]">
                  Profile Configuration
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Update your personnel information. Changes immediately reflect in the Dashboard Account Overview.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-[#64748B] hover:text-[#F45113] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                    placeholder="e.g. Maria Santos"
                  />
                </div>

                {/* Role / Designation */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Official Role / Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                    placeholder="e.g. Barangay Secretary"
                  />
                </div>

                {/* Official Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                    placeholder="e.g. maria.santos@lapasan.gov.ph"
                  />
                </div>

                {/* Official Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Official Mobile / Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                    placeholder="e.g. +63 917 123 4567"
                  />
                </div>

                {/* Department / Office */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Department / Office
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.office}
                    onChange={(e) => handleChange("office", e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                    placeholder="e.g. Office of the Barangay Secretary"
                  />
                </div>

                {/* Jurisdiction */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Jurisdiction / Area
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jurisdiction}
                    onChange={(e) => handleChange("jurisdiction", e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                    placeholder="e.g. Barangay Lapasan, Cagayan de Oro City"
                  />
                </div>

                {/* Avatar Initials Override */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Avatar Initials
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={formData.initials}
                    onChange={(e) => handleChange("initials", e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-mono font-bold text-[#F45113] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                    placeholder="e.g. MS"
                  />
                </div>

                {/* Session Status */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Duty Status Badge
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                  >
                    <option value="Active Session">Active Session</option>
                    <option value="On Duty — Hall">On Duty — Hall</option>
                    <option value="Field Dispatch">Field Dispatch</option>
                    <option value="Official Meeting">Official Meeting</option>
                  </select>
                </div>

              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-[#ECE7DF] flex items-center justify-between">
                <span className="text-xs text-[#64748B]">
                  Changes are automatically stored locally and sync across the dashboard.
                </span>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#F45113] hover:bg-[#e0450b] text-white text-xs font-bold rounded-full transition-all shadow-md shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.99] flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Configuration</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Live Preview: Corresponds to Dashboard Account Overview (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="w-4 h-4 text-[#F45113]" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                Live Dashboard Preview
              </h3>
            </div>

            {/* This card exactly mirrors the Account Overview widget in Dashboard */}
            <div className="p-6 rounded-3xl bg-white border border-[#ECE7DF] shadow-sm space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  Account Overview
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {formData.status || "Active Session"}
                </span>
              </div>

              <div className="flex flex-col items-center text-center pt-1 pb-2">
                {/* Circular Avatar with Glowing Ring */}
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#F45113] via-[#FB923C] to-[#FED7AA] p-[3px] shadow-md shadow-orange-500/20">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-extrabold text-xl text-[#F45113]">
                      {formData.initials || "AD"}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0F172A] border-2 border-white flex items-center justify-center text-white">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F45113]" />
                  </div>
                </div>

                <h4 className="text-base font-bold text-[#0F172A]">{formData.name}</h4>
                <p className="text-xs font-semibold text-[#F45113] mt-0.5">{formData.role}</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">{formData.email}</p>

                <div className="mt-4 px-5 py-2 rounded-full border border-[#ECE7DF] text-xs font-semibold text-[#0F172A] bg-[#FFF9F3]">
                  {formData.office}
                </div>
              </div>

              {/* Authorized Personnel Badge */}
              <div className="pt-3 border-t border-[#ECE7DF]/70 flex items-center justify-center gap-2 text-[11px] text-[#64748B] font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Authorized Administrative Account</span>
              </div>
            </div>

            {/* Note card */}
            <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#ECE7DF] text-xs text-[#64748B] space-y-1">
              <p className="font-bold text-[#0F172A]">Real-Time Two-Way Sync</p>
              <p>
                Typing above updates this preview immediately. Once saved, your name, role, and avatar will show across the Dashboard header and Sidebar.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ── Tab: Barangay Office Configuration ── */}
      {activeTab === "BARANGAY" && (
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[#ECE7DF]">
            <h2 className="text-base font-extrabold text-[#0F172A]">
              Barangay Lapasan Office Information
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              General municipal information used across official reports and certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Barangay Local Government
              </label>
              <input
                type="text"
                defaultValue="Barangay Lapasan, District II"
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Punong Barangay / Captain
              </label>
              <input
                type="text"
                defaultValue="Hon. Julito O. Ogsimer"
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Barangay Hall Address
              </label>
              <input
                type="text"
                defaultValue="J.R. Borja Extension, Lapasan, Cagayan de Oro City"
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Emergency DRRM Hotline
              </label>
              <input
                type="text"
                defaultValue="(088) 856-1234 / 911"
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Security & Access ── */}
      {activeTab === "SECURITY" && (
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-[#ECE7DF]">
            <h2 className="text-base font-extrabold text-[#0F172A]">
              Security & Credentials
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Manage administrator authentication credentials and authorized devices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Current Password
              </label>
              <input
                type="password"
                defaultValue="admin2026"
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new strong password"
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#ECE7DF] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <KeyRound className="w-4 h-4 text-[#F45113]" />
              <span>Two-factor authentication enabled for all barangay staff</span>
            </div>
            <button
              type="button"
              className="px-5 py-2.5 bg-[#0F172A] hover:bg-black text-white text-xs font-bold rounded-full transition-colors cursor-pointer"
            >
              Update Credentials
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Activity Audit Logs ── */}
      {activeTab === "AUDIT" && (
        <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden space-y-0">
          <div className="p-6 sm:p-8 border-b border-[#ECE7DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">
                Administrative Activity Audit Logs
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Immutable record of administrative actions, program updates, and resident record verifications.
              </p>
            </div>

            <button
              onClick={() => {
                const header = "Log ID,Timestamp,Officer,Role,Action,Category,IP Address,Status\n";
                const rows = [
                  'LOG-9102,2026-10-20T14:45:00,Hon. Maria Santos,Secretary,"Approved resident registration for Juan Dela Cruz",Registration,192.168.1.14,Success',
                  'LOG-9101,2026-10-18T08:30:00,Hon. Maria Santos,Secretary,"Broadcasted Urgent Advisory: Typhoon Preparedness",Advisory,192.168.1.14,Success',
                  'LOG-9100,2026-10-15T11:20:00,Ricardo Gomez,Program Officer,"Marked attendance for 42 participants",Attendance,192.168.1.28,Success',
                  'LOG-9099,2026-10-12T09:15:00,Hon. Maria Santos,Secretary,"Published new program: DRRM Training",Program,192.168.1.14,Success',
                  'LOG-9098,2026-10-10T16:00:00,Hon. Maria Santos,Secretary,"Updated Barangay Hall emergency contact hotline",Security,192.168.1.14,Success',
                  'LOG-9097,2026-10-08T13:40:00,Admin Lapasan,Administrator,"Exported demographic registration summary by Purok",Reports,192.168.1.10,Success',
                ].join("\n");
                const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `APILA_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#ECE7DF] hover:border-[#F45113]/50 text-xs font-bold text-[#0F172A] rounded-2xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-[#F45113]" />
              <span>Export Audit Trail (CSV)</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-[#FFF9F3]/50 border-b border-[#ECE7DF] flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by action or officer..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full border border-[#ECE7DF] bg-white text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(["ALL", "Registration", "Program", "Attendance", "Advisory", "Security"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAuditCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    auditCategory === cat
                      ? "bg-[#0F172A] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0F172A] bg-white border border-[#ECE7DF]"
                  }`}
                >
                  {cat === "ALL" ? "All Logs" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Trail Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF9F3]/80 border-b border-[#ECE7DF] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-4">Authorized Officer</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Terminal / Station</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DF] text-xs">
                {(liveLogs.length > 0
                  ? liveLogs.map((l) => ({
                      id: l.id || `LOG-${Date.now()}`,
                      timestamp: l.createdAt ? new Date(l.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
                      adminUser: l.officer || profile.name,
                      role: "Administrator",
                      action: l.action,
                      category: l.category,
                      ipAddress: l.ipTerminal || "192.168.1.14 (Admin Terminal)",
                      status: l.status || "Success",
                    }))
                  : [
                      {
                        id: "LOG-9102",
                        timestamp: "2026-10-20T14:45:00",
                        adminUser: profile.name,
                        role: profile.role,
                        action: "Approved resident registration for Juan Dela Cruz (Free Medical and Dental Checkup)",
                        category: "Registration",
                        ipAddress: "192.168.1.14 (Admin Terminal 01)",
                        status: "Success",
                      },
                      {
                        id: "LOG-9101",
                        timestamp: "2026-10-18T08:30:00",
                        adminUser: profile.name,
                        role: profile.role,
                        action: "Broadcasted Urgent Advisory: Typhoon Preparedness Advisory to 4,820 resident devices",
                        category: "Advisory",
                        ipAddress: "192.168.1.14 (Admin Terminal 01)",
                        status: "Success",
                      },
                      {
                        id: "LOG-9100",
                        timestamp: "2026-10-15T11:20:00",
                        adminUser: "Ricardo Gomez",
                        role: "Program Officer",
                        action: "Marked attendance for 42 participants in Livelihood Training: Bread & Pastry",
                        category: "Attendance",
                        ipAddress: "192.168.1.28 (Hall Laptop 02)",
                        status: "Success",
                      },
                      {
                        id: "LOG-9099",
                        timestamp: "2026-10-12T09:15:00",
                        adminUser: profile.name,
                        role: profile.role,
                        action: "Published new community program: Disaster Risk Reduction & Management Training",
                        category: "Program",
                        ipAddress: "192.168.1.14 (Admin Terminal 01)",
                        status: "Success",
                      },
                      {
                        id: "LOG-9098",
                        timestamp: "2026-10-10T16:00:00",
                        adminUser: profile.name,
                        role: profile.role,
                        action: "Updated Barangay Hall emergency contact hotline and office hours",
                        category: "Security",
                        ipAddress: "192.168.1.14 (Admin Terminal 01)",
                        status: "Success",
                      },
                      {
                        id: "LOG-9097",
                        timestamp: "2026-10-08T13:40:00",
                        adminUser: "Admin Lapasan",
                        role: "Administrator",
                        action: "Exported demographic registration summary by Purok for Q3 administrative review",
                        category: "Reports",
                        ipAddress: "192.168.1.10 (Master Server)",
                        status: "Success",
                      },
                    ]
                )
                  .filter((log) => {
                    const matchesSearch =
                      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      log.adminUser.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      log.id.toLowerCase().includes(auditSearch.toLowerCase());
                    const matchesCategory =
                      auditCategory === "ALL" || log.category === auditCategory;
                    return matchesSearch && matchesCategory;
                  })
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-[#FFF9F3]/50 transition-colors">
                      <td className="py-3 px-5 text-[#64748B] font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#0F172A]">{log.adminUser}</p>
                        <p className="text-[10px] text-[#64748B]">{log.role}</p>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#0F172A] max-w-md">
                        {log.action}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF9F3] text-[#F45113] border border-[#ECE7DF]">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                        {log.ipAddress}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{log.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
