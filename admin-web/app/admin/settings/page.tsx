"use client";

import { useState, useEffect } from "react";
import { useAdminProfile, AdminProfile } from "@/lib/context/AdminProfileContext";
import { getAuditLogs, AuditLog } from "@/lib/services/auditLogs";
import {
  getAdminAccounts,
  createAdminAccount,
  toggleAdminStatus,
  deleteAdminAccount,
  AdminAccount,
} from "@/lib/services/adminAccounts";
import {
  getBarangayConfig,
  saveBarangayConfig,
  BarangayConfig,
} from "@/lib/services/barangayConfig";
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
  Plus,
  Trash2,
  UserPlus,
  Power,
  AlertTriangle,
  Users,
  Crown,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { profile, updateProfile, resetProfile } = useAdminProfile();

  const [activeTab, setActiveTab] = useState<"PROFILE" | "ACCOUNTS" | "BARANGAY" | "SECURITY" | "AUDIT">("PROFILE");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditCategory, setAuditCategory] = useState("ALL");
  const [liveLogs, setLiveLogs] = useState<AuditLog[]>([]);

  // Admin Accounts Provisioning State
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("Program Officer");
  const [newAdminOffice, setNewAdminOffice] = useState("Office of the Barangay Administration");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [accountActionMsg, setAccountActionMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Barangay Config State
  const [barangayForm, setBarangayForm] = useState<BarangayConfig>({
    barangayName: "Barangay Lapasan, District II",
    captain: "Hon. Julito O. Ogsimer",
    address: "J.R. Borja Extension, Lapasan, Cagayan de Oro City",
    hotline: "(088) 856-1234 / 911",
  });
  const [isSavingBarangay, setIsSavingBarangay] = useState(false);
  const [barangaySaveMsg, setBarangaySaveMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

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
    fetchAdmins();
    fetchBarangayConfig();
  }, []);

  const fetchBarangayConfig = async () => {
    try {
      const config = await getBarangayConfig();
      setBarangayForm(config);
    } catch (err) {
      console.warn("Could not load barangay config:", err);
    }
  };

  const handleSaveBarangay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBarangay(true);
    setBarangaySaveMsg(null);
    try {
      await saveBarangayConfig(barangayForm);
      setBarangaySaveMsg({ text: "Barangay office information saved to database successfully.", type: "success" });
      setTimeout(() => setBarangaySaveMsg(null), 4000);
    } catch (err: any) {
      setBarangaySaveMsg({ text: err.message || "Failed to save. Please try again.", type: "error" });
    } finally {
      setIsSavingBarangay(false);
    }
  };

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);
    // Check against known owner passwords + any updated one stored in localStorage
    const OWNER_PASSWORDS = ["admin2026", "123456", "admin"];
    let storedPw: string | null = null;
    try {
      const saved = localStorage.getItem("apila_owner_credentials");
      if (saved) storedPw = JSON.parse(saved).password;
    } catch {}
    const validCurrent = OWNER_PASSWORDS.includes(currentPassword) || (storedPw && storedPw === currentPassword);
    if (!validCurrent) {
      setSecurityMsg({ text: "Current password is incorrect.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMsg({ text: "New password must be at least 6 characters.", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMsg({ text: "New passwords do not match.", type: "error" });
      return;
    }
    try {
      const saved = localStorage.getItem("apila_owner_credentials");
      const creds = saved ? JSON.parse(saved) : {};
      creds.password = newPassword;
      localStorage.setItem("apila_owner_credentials", JSON.stringify(creds));
    } catch {}
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSecurityMsg({ text: "Password updated successfully. Use your new password on next login.", type: "success" });
    setTimeout(() => setSecurityMsg(null), 5000);
  };

  const fetchAdmins = async () => {
    setLoadingAccounts(true);
    try {
      const list = await getAdminAccounts();
      setAdminAccounts(list);
    } catch (err) {
      console.error("Failed to load admin accounts:", err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminPassword || !newAdminName) {
      setAccountActionMsg({ text: "Please fill in all required fields.", type: "error" });
      return;
    }
    if (newAdminPassword.length < 6) {
      setAccountActionMsg({ text: "Password must be at least 6 characters.", type: "error" });
      return;
    }
    setIsCreatingAdmin(true);
    setAccountActionMsg(null);
    try {
      await createAdminAccount({
        name: newAdminName,
        email: newAdminEmail,
        password: newAdminPassword,
        role: newAdminRole,
        office: newAdminOffice,
        createdBy: profile.name || "Barangay Admin (Owner)",
      });
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminRole("Program Officer");
      setAccountActionMsg({
        text: `Admin account for ${newAdminName} created successfully! They can now log in with ${newAdminEmail}.`,
        type: "success",
      });
      await fetchAdmins();
      setTimeout(() => setAccountActionMsg(null), 5000);
    } catch (err: any) {
      setAccountActionMsg({ text: err.message || "Failed to create admin account.", type: "error" });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleToggleStatus = async (account: AdminAccount) => {
    const nextStatus = account.status === "Active" ? "Inactive" : "Active";
    try {
      await toggleAdminStatus(account.id, nextStatus, account.name);
      await fetchAdmins();
      setAccountActionMsg({
        text: `Account for ${account.name} has been ${nextStatus === "Active" ? "activated" : "deactivated"}.`,
        type: "success",
      });
      setTimeout(() => setAccountActionMsg(null), 3000);
    } catch (err: any) {
      setAccountActionMsg({ text: "Failed to update account status.", type: "error" });
    }
  };

  const handleDeleteAdmin = async (account: AdminAccount) => {
    if (!confirm(`Are you sure you want to permanently delete admin access for ${account.name} (${account.email})?`)) {
      return;
    }
    try {
      await deleteAdminAccount(account.id, account.name);
      await fetchAdmins();
      setAccountActionMsg({ text: `Admin account for ${account.name} deleted.`, type: "success" });
      setTimeout(() => setAccountActionMsg(null), 3000);
    } catch (err: any) {
      setAccountActionMsg({ text: "Failed to delete account.", type: "error" });
    }
  };

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
            Settings
          </h1>
        </div>

        {/* Tab Selector Pills */}
        <div className="flex items-center p-1 rounded-full bg-white border border-[#ECE7DF] shadow-sm self-start sm:self-auto flex-wrap">
          {(
            [
              { id: "PROFILE", label: "Admin Profile", icon: User },
              { id: "ACCOUNTS", label: "Admin Accounts", icon: ShieldCheck },
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

      {/* ── Tab: Admin Accounts Provisioning ── */}
      {activeTab === "ACCOUNTS" && (
        <div className="space-y-6">
          {/* Action Message Alert */}
          {accountActionMsg && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${
                accountActionMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {accountActionMsg.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                )}
                <span className="text-xs font-semibold">{accountActionMsg.text}</span>
              </div>
            </div>
          )}

          {/* Master Owner Admin Card */}
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-[#F45113]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F45113] text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-orange-500/30">
                  <Crown className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                      {profile.isOwner ? profile.name : "Barangay Admin"}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F45113] text-white tracking-wide uppercase">
                      System Owner
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    {profile.isOwner ? profile.email : "admin@lapasan.gov.ph"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Primary Authority · Full access to provision staff accounts & manage privileges
                  </p>
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 text-right self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end">
                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                  Staff Admins
                </span>
                <span className="text-base sm:text-xl font-extrabold text-orange-400">
                  {adminAccounts.length} Authorized
                </span>
              </div>
            </div>
          </div>

          {/* Form and List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (5 cols): Provision New Admin Form */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-[#ECE7DF] p-6 shadow-sm space-y-5">
              <div className="pb-4 border-b border-[#ECE7DF]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#FFF9F3] text-[#F45113] border border-[#ECE7DF]">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F172A]">
                      Provision Admin Account
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Create staff credentials. Regular residents cannot self-register an admin account.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Officer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. Ricardo Gomez"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                  />
                </div>

                {/* Email / Gmail */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Officer Gmail / Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="e.g. ricardo.lapasan@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-[#94A3B8]">
                    They will use this Gmail address to log in to the admin portal.
                  </p>
                </div>

                {/* Role / Designation */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Administrative Role / Office *
                  </label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Program Officer">Program Officer</option>
                    <option value="Barangay Secretary">Barangay Secretary</option>
                    <option value="Health & Nutrition Coordinator">Health & Nutrition Coordinator</option>
                    <option value="Disaster Risk & Rescue Lead">Disaster Risk & Rescue Lead</option>
                    <option value="Records & Registration Clerk">Records & Registration Clerk</option>
                    <option value="Livelihood Project Lead">Livelihood Project Lead</option>
                    <option value="Barangay Treasurer">Barangay Treasurer</option>
                  </select>
                </div>

                {/* Office / Department */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={newAdminOffice}
                    onChange={(e) => setNewAdminOffice(e.target.value)}
                    placeholder="e.g. Community Services Division"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                  />
                </div>

                {/* Password with Eye toggle */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Initial Login Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition-colors cursor-pointer"
                    >
                      {showAdminPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isCreatingAdmin}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F45113] hover:bg-[#D9410B] text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isCreatingAdmin ? "Creating Account..." : "Create Admin Account"}</span>
                </button>
              </form>
            </div>

            {/* Right Column (7 cols): Authorized Staff Admin Table */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#ECE7DF] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F172A]">
                    Authorized Staff Administrators
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Personnel authorized to log into the Barangay Admin portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAdmins}
                  className="text-xs font-semibold text-[#64748B] hover:text-[#F45113] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Refresh Accounts"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${loadingAccounts ? "animate-spin text-[#F45113]" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingAccounts && adminAccounts.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#64748B]">
                  Loading admin directory...
                </div>
              ) : adminAccounts.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF9F3] text-[#F45113] border border-[#ECE7DF] flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A]">No Staff Accounts Yet</h4>
                    <p className="text-xs text-[#64748B] max-w-sm mx-auto mt-1">
                      As the System Owner, use the form on the left to create login credentials for your barangay officers and staff.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#ECE7DF]">
                  {adminAccounts.map((account) => {
                    const isActive = account.status === "Active";
                    return (
                      <div
                        key={account.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFF9F3]/40 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {account.initials || "AD"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#0F172A]">
                                {account.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isActive
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {account.status}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-[#64748B] mt-0.5">
                              {account.email}
                            </p>
                            <p className="text-[10px] text-[#94A3B8] mt-0.5">
                              {account.role} · {account.office}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {/* Status toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(account)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isActive
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                            }`}
                            title={isActive ? "Deactivate account" : "Activate account"}
                          >
                            <Power className="w-3 h-3" />
                            <span>{isActive ? "Deactivate" : "Activate"}</span>
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAdmin(account)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Admin Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
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
          <div className="pb-4 border-b border-[#ECE7DF] flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A]">
                Barangay Lapasan Office Information
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                General municipal information used across official reports and certificates. Saved to database.
              </p>
            </div>
          </div>

          {/* Feedback banner */}
          {barangaySaveMsg && (
            <div
              className={`p-4 rounded-2xl border flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 ${
                barangaySaveMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {barangaySaveMsg.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold">{barangaySaveMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveBarangay} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Barangay Local Government
                </label>
                <input
                  type="text"
                  required
                  value={barangayForm.barangayName}
                  onChange={(e) => setBarangayForm((p) => ({ ...p, barangayName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Punong Barangay / Captain
                </label>
                <input
                  type="text"
                  required
                  value={barangayForm.captain}
                  onChange={(e) => setBarangayForm((p) => ({ ...p, captain: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Barangay Hall Address
                </label>
                <input
                  type="text"
                  required
                  value={barangayForm.address}
                  onChange={(e) => setBarangayForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Emergency DRRM Hotline
                </label>
                <input
                  type="text"
                  required
                  value={barangayForm.hotline}
                  onChange={(e) => setBarangayForm((p) => ({ ...p, hotline: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#ECE7DF] flex items-center justify-between">
              <span className="text-xs text-[#64748B]">
                Changes are saved to Firestore and reflect on all reports.
              </span>
              <button
                type="submit"
                disabled={isSavingBarangay}
                className="px-6 py-3 bg-[#F45113] hover:bg-[#e0450b] text-white text-xs font-bold rounded-full transition-all shadow-md shadow-orange-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingBarangay ? "Saving..." : "Save Office Information"}</span>
              </button>
            </div>
          </form>
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
              Change the Owner Admin login password. Applies on your next login.
            </p>
          </div>

          {securityMsg && (
            <div
              className={`p-4 rounded-2xl border flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 ${
                securityMsg.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {securityMsg.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold">{securityMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateCredentials} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-4 pr-10 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer">
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-4 pr-10 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F45113] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#ECE7DF] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <KeyRound className="w-4 h-4 text-[#F45113]" />
                <span>Only the Owner Admin password can be changed here. Staff passwords are managed in Admin Accounts.</span>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0F172A] hover:bg-black text-white text-xs font-bold rounded-full transition-colors cursor-pointer flex items-center gap-2"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Update Credentials
              </button>
            </div>
          </form>
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
                const header = "Log ID,Timestamp,Officer,Action,Category,Terminal,Status\n";
                const logsToExport = liveLogs.length > 0
                  ? liveLogs.map((l, i) => {
                      const ts = l.createdAt
                        ? new Date(l.createdAt.seconds * 1000).toISOString()
                        : new Date().toISOString();
                      return `LOG-${String(i + 1).padStart(4, "0")},${ts},"${l.officer}","${l.action.replace(/"/g, '""')}",${l.category},"${l.ipTerminal}",${l.status}`;
                    })
                  : [
                      `LOG-0001,2026-10-20T14:45:00,"${profile.name}","Approved resident registration for Juan Dela Cruz",Registration,Admin Terminal,Success`,
                      `LOG-0002,2026-10-18T08:30:00,"${profile.name}","Broadcasted Urgent Advisory: Typhoon Preparedness",Advisory,Admin Terminal,Success`,
                    ];
                const blob = new Blob([header + logsToExport.join("\n")], { type: "text/csv;charset=utf-8;" });
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
              <span>Export Audit Trail (CSV){liveLogs.length > 0 ? ` · ${liveLogs.length} logs` : ""}</span>
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
                        action: "Broadcasted Urgent Advisory: Typhoon Preparedness Advisory to all registered resident devices",
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
