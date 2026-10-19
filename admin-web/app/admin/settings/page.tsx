"use client";

import { useState, useEffect } from "react";
import { useAdminProfile, AdminProfile } from "@/lib/context/AdminProfileContext";
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
} from "lucide-react";

export default function AdminSettingsPage() {
  const { profile, updateProfile, resetProfile } = useAdminProfile();

  const [activeTab, setActiveTab] = useState<"PROFILE" | "BARANGAY" | "SECURITY">("PROFILE");

  // Form State initialized from context
  const [formData, setFormData] = useState<AdminProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize when profile loads/updates
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

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

              {/* Quick Channel Badges */}
              <div className="pt-3 border-t border-[#ECE7DF]/70 flex items-center justify-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FFF9F3] border border-[#ECE7DF] flex items-center justify-center text-[#F45113]">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="w-9 h-9 rounded-full bg-[#FFF9F3] border border-[#ECE7DF] flex items-center justify-center text-[#0F172A]">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="w-9 h-9 rounded-full bg-[#FFF9F3] border border-[#ECE7DF] flex items-center justify-center text-[#0F172A]">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="w-9 h-9 rounded-full bg-[#FFF9F3] border border-[#ECE7DF] flex items-center justify-center text-[#0F172A]">
                  <Share2 className="w-4 h-4" />
                </div>
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

    </div>
  );
}
