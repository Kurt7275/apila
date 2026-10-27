"use client";

import { useState, useEffect } from "react";
import { mockResidents } from "@/lib/mock-data/residents";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { Resident } from "@/types";
import {
  getResidents,
  toggleResidentVerification,
  updateResident,
  subscribeToResidents,
} from "@/lib/services/residents";
import { getRegistrations, subscribeToRegistrations } from "@/lib/services/registrations";
import { useAdminProfile } from "@/lib/context/AdminProfileContext";
import {
  Search,
  Download,
  User,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Home,
  Clock,
  BookOpen,
  X,
  ChevronDown,
  UserCheck,
  Pencil,
  Save,
  Check,
} from "lucide-react";

const LAPASAN_PUROKS = [
  "Purok 1",
  "Purok 2",
  "Purok 3",
  "Purok 4",
  "Purok 5",
  "Purok 6",
  "Purok 7",
  "Purok 8",
  "Purok 9",
  "Purok 10",
];

const CIVIL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Widowed",
  "Separated",
  "Head of Household",
];

export default function AdminResidentsPage() {
  const { profile } = useAdminProfile();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [liveRegistrations, setLiveRegistrations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [purokFilter, setPurokFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState<"ALL" | "VERIFIED" | "PENDING">("ALL");

  // Selected Resident Modal & Editing State
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    purok: "Purok 1",
    street: "",
    householdId: "",
    birthdate: "",
    sex: "Male" as Resident["sex"],
    civilStatus: "Single" as Resident["civilStatus"],
  });

  // Real-time Firestore Listeners: updates instantly when residents register or edit profiles
  useEffect(() => {
    const unsubResidents = subscribeToResidents((live) => {
      const mapped: Resident[] = live.map((r) => {
        const parts = (r.name || "").trim().split(" ");
        const firstName = parts[0] || "Resident";
        const lastName = parts.slice(1).join(" ") || "";
        return {
          id: r.id || `res-${Date.now()}`,
          firstName,
          lastName,
          email: r.email || "",
          phone: r.phone || "",
          purok: r.purok || "Purok 1",
          street: r.address || `${r.purok}, Barangay Lapasan`,
          householdId: r.householdId || "HH-001",
          birthdate: r.birthdate || "1990-01-01",
          sex: (r.gender === "Male" ? "Male" : "Female") as Resident["sex"],
          civilStatus: (r.civilStatus as Resident["civilStatus"]) || "Single",
          isVerified: r.isVerified ?? false,
          registeredAt: (() => {
            try {
              if (r.createdAt && typeof (r.createdAt as any).seconds === "number") {
                return new Date((r.createdAt as any).seconds * 1000).toISOString();
              }
              if (typeof r.createdAt === "number") {
                return new Date(r.createdAt).toISOString();
              }
            } catch (_) {}
            return new Date().toISOString();
          })(),
        };
      });
      setResidents(mapped);
    });

    const unsubRegistrations = subscribeToRegistrations((live) => {
      if (live && live.length > 0) setLiveRegistrations(live);
    });

    return () => {
      unsubResidents();
      unsubRegistrations();
    };
  }, []);

  const openResidentModal = (r: Resident, editMode = false) => {
    setSelectedResident(r);
    setIsEditing(editMode);
    setEditForm({
      firstName: r.firstName,
      lastName: r.lastName,
      phone: r.phone,
      purok: r.purok,
      street: r.street,
      householdId: r.householdId,
      birthdate: r.birthdate,
      sex: r.sex,
      civilStatus: r.civilStatus,
    });
    setSaveNotice(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident) return;
    setIsSaving(true);
    try {
      const fullName = `${editForm.firstName.trim()} ${editForm.lastName.trim()}`.trim();
      await updateResident(
        selectedResident.id,
        {
          name: fullName,
          phone: editForm.phone.trim(),
          purok: editForm.purok,
          address: editForm.street.trim(),
          householdId: editForm.householdId.trim() || "HH-001",
          birthdate: editForm.birthdate,
          gender: editForm.sex,
          civilStatus: editForm.civilStatus,
        },
        profile?.name || "Barangay Admin"
      );

      setSelectedResident((prev) =>
        prev
          ? {
              ...prev,
              firstName: editForm.firstName.trim(),
              lastName: editForm.lastName.trim(),
              phone: editForm.phone.trim(),
              purok: editForm.purok,
              street: editForm.street.trim(),
              householdId: editForm.householdId.trim() || "HH-001",
              birthdate: editForm.birthdate,
              sex: editForm.sex,
              civilStatus: editForm.civilStatus,
            }
          : null
      );
      setIsEditing(false);
      setSaveNotice("Resident record & Household ID updated successfully!");
      setTimeout(() => setSaveNotice(null), 3500);
    } catch (err: any) {
      alert("Failed to save changes: " + (err?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const getRegistrationsForResident = (residentId: string) => {
    const fullName = `${selectedResident?.firstName} ${selectedResident?.lastName}`.toLowerCase();
    const source = liveRegistrations.length > 0 ? liveRegistrations : mockRegistrations;
    return source.filter(
      (r) =>
        r.residentId === residentId ||
        r.residentName?.toLowerCase() === fullName
    );
  };

  const handleToggleVerification = async (id: string) => {
    const current = residents.find((r) => r.id === id);
    const newStatus = !current?.isVerified;

    setResidents((prev) =>
      prev.map((res) =>
        res.id === id ? { ...res, isVerified: newStatus } : res
      )
    );
    if (selectedResident && selectedResident.id === id) {
      setSelectedResident((prev) => (prev ? { ...prev, isVerified: newStatus } : null));
    }
    try {
      await toggleResidentVerification(id, newStatus, profile?.name || "Barangay Admin");
    } catch (err) {
      console.warn("Firestore verification toggle skipped:", err);
    }
  };

  const uniquePuroks = Array.from(new Set(residents.map((r) => r.purok))).sort();

  const filteredResidents = residents.filter((r) => {
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      r.purok.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search) ||
      r.householdId.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchesPurok = purokFilter === "ALL" || r.purok === purokFilter;
    const matchesVerification =
      verificationFilter === "ALL" ||
      (verificationFilter === "VERIFIED" && r.isVerified) ||
      (verificationFilter === "PENDING" && !r.isVerified);
    return matchesSearch && matchesPurok && matchesVerification;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Residents
          </h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Manage Barangay Lapasan resident directory, verify accounts, and assign Household IDs.
          </p>
        </div>

        {/* Export Action */}
        <button
          onClick={() => {
            const header = "Resident ID,Full Name,Purok,Street,Phone,Email,Household ID,Verified,Registration Date\n";
            const rows = filteredResidents
              .map(
                (r) =>
                  `"${r.id}","${r.firstName} ${r.lastName}","${r.purok}","${r.street}","${r.phone}","${r.email}","${r.householdId}","${r.isVerified}","${r.registeredAt}"`
              )
              .join("\n");
            const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Residents_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#ECE7DF] hover:border-[#F45113]/50 text-xs font-bold text-[#0F172A] rounded-2xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#F45113]" />
          <span>Export Resident Records</span>
        </button>
      </div>

      {/* ── KPI Bento Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Total Registered Accounts</p>
          <p className="text-3xl font-extrabold text-[#0F172A]">{residents.length}</p>
          <p className="text-[11px] text-[#64748B]">Across 10 Lapasan Puroks</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Verified Residents</p>
          <p className="text-3xl font-extrabold text-emerald-600">
            {residents.filter((r) => r.isVerified).length}
          </p>
          <p className="text-[11px] text-[#64748B]">With verified barangay records</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Verification</p>
          <p className="text-3xl font-extrabold text-amber-600">
            {residents.filter((r) => !r.isVerified).length}
          </p>
          <p className="text-[11px] text-[#64748B]">Requires ID confirmation</p>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, household ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
            />
          </div>

          {/* Verification Status Pills */}
          <div className="flex items-center p-1 rounded-full bg-[#FFF9F3] border border-[#ECE7DF]">
            {(["ALL", "VERIFIED", "PENDING"] as const).map((vt) => (
              <button
                key={vt}
                onClick={() => setVerificationFilter(vt)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  verificationFilter === vt
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {vt === "ALL" ? "All Accounts" : vt === "VERIFIED" ? "Verified" : "Pending"}
              </button>
            ))}
          </div>

          {/* Purok Filter */}
          <div className="relative">
            <select
              value={purokFilter}
              onChange={(e) => setPurokFilter(e.target.value)}
              className="appearance-none px-3.5 py-1.5 rounded-full border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none pr-8 cursor-pointer"
            >
              <option value="ALL">All Puroks</option>
              {uniquePuroks.map((prk) => (
                <option key={prk} value={prk}>
                  {prk}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <span className="text-xs text-[#64748B] font-semibold">
          Showing {filteredResidents.length} of {residents.length} residents
        </span>
      </div>

      {/* ── Residents Table ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFF9F3]/70 border-b border-[#ECE7DF] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Resident Name</th>
                <th className="py-3 px-4">Purok Area</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Household ID</th>
                <th className="py-3 px-4 text-center">Account Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DF]">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B]">
                    <p className="font-bold text-sm text-[#0F172A]">No resident records found</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredResidents.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FFF9F3]/40 transition-colors group">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FFF9F3] border border-[#ECE7DF] text-[#F45113] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {r.firstName.charAt(0)}{r.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#0F172A] group-hover:text-[#F45113] transition-colors">
                            {r.firstName} {r.lastName}
                          </p>
                          <p className="text-[10px] text-[#94A3B8]">
                            {r.sex} · {r.civilStatus}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF9F3] border border-[#ECE7DF] text-[#0F172A]">
                        {r.purok}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#475569]">
                      <p className="font-semibold text-[#0F172A]">{r.phone}</p>
                      <p className="text-[10px] text-[#94A3B8] truncate max-w-[150px]">{r.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-mono text-[11px] font-bold bg-[#FFF9F3] text-[#F45113] border border-[#ECE7DF]">
                        <Home className="w-3 h-3 text-[#F45113]" />
                        {r.householdId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {r.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openResidentModal(r, true)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#FFF9F3] hover:bg-[#F45113]/10 text-[#F45113] border border-[#ECE7DF] hover:border-[#F45113]/40 transition-all cursor-pointer flex items-center gap-1.5"
                          title="Edit Resident & Household ID"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => openResidentModal(r, false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFF9F3] hover:bg-[#0F172A] text-[#0F172A] hover:text-white border border-[#ECE7DF] transition-all cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Resident Profile & Edit Modal ── */}
      {selectedResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#ECE7DF] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DF]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FFF9F3] border border-[#ECE7DF] text-[#F45113] flex items-center justify-center font-extrabold text-base">
                  {selectedResident.firstName.charAt(0)}{selectedResident.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#0F172A]">
                    {selectedResident.firstName} {selectedResident.lastName}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Household ID: <span className="font-mono font-bold text-[#F45113]">{selectedResident.householdId}</span> · Resident ID: <span className="font-mono">{selectedResident.id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditing) {
                      setEditForm({
                        firstName: selectedResident.firstName,
                        lastName: selectedResident.lastName,
                        phone: selectedResident.phone,
                        purok: selectedResident.purok,
                        street: selectedResident.street,
                        householdId: selectedResident.householdId,
                        birthdate: selectedResident.birthdate,
                        sex: selectedResident.sex,
                        civilStatus: selectedResident.civilStatus,
                      });
                    }
                    setIsEditing(!isEditing);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isEditing
                      ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                      : "bg-[#FFF9F3] text-[#F45113] border-[#ECE7DF] hover:border-[#F45113]"
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{isEditing ? "View Details" : "Edit Record"}</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedResident(null);
                    setIsEditing(false);
                    setSaveNotice(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {saveNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveNotice}</span>
              </div>
            )}

            {/* If Editing Mode: Render Edit Form */}
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-5">
                {/* Household ID Highlight Section */}
                <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#ECE7DF] space-y-2">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-[#F45113]" />
                    <label className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                      Official Barangay Household ID
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={editForm.householdId}
                    onChange={(e) => setEditForm({ ...editForm, householdId: e.target.value })}
                    placeholder="e.g. HH-Lapasan-001 or HH-Purok4-012"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECE7DF] bg-white text-xs font-mono font-bold text-[#0F172A] focus:border-[#F45113] outline-none"
                  />
                  <p className="text-[10px] text-[#64748B]">
                    Assigned official Lapasan household identifier code used for social services, family benefit distributions, and census tracking.
                  </p>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-bold text-[#0F172A] focus:border-[#F45113] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-bold text-[#0F172A] focus:border-[#F45113] outline-none"
                    />
                  </div>
                </div>

                {/* Demographics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                      Sex / Gender
                    </label>
                    <select
                      value={editForm.sex}
                      onChange={(e) => setEditForm({ ...editForm, sex: e.target.value as Resident["sex"] })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] focus:border-[#F45113] outline-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                      Civil Status
                    </label>
                    <select
                      value={editForm.civilStatus}
                      onChange={(e) => setEditForm({ ...editForm, civilStatus: e.target.value as Resident["civilStatus"] })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] focus:border-[#F45113] outline-none cursor-pointer"
                    >
                      {CIVIL_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editForm.birthdate}
                      onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] focus:border-[#F45113] outline-none"
                    />
                  </div>
                </div>

                {/* Purok & Address Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                      Purok Area
                    </label>
                    <select
                      value={editForm.purok}
                      onChange={(e) => setEditForm({ ...editForm, purok: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] focus:border-[#F45113] outline-none cursor-pointer"
                    >
                      {LAPASAN_PUROKS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                      Street / Sub-area Address
                    </label>
                    <input
                      type="text"
                      value={editForm.street}
                      onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                      placeholder="e.g. Zone 2, Lapasan Highway"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] focus:border-[#F45113] outline-none"
                    />
                  </div>
                </div>

                {/* Phone Contact */}
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase mb-1">
                    Mobile Phone Contact
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="0917-000-0000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] focus:border-[#F45113] outline-none"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ECE7DF]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#F45113] hover:bg-[#d9440e] transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving Changes..." : "Save Resident Changes"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Account Status Strip */}
                <div className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#ECE7DF] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Account Status</p>
                    <p className="text-sm font-extrabold text-[#0F172A] mt-0.5">
                      {selectedResident.isVerified ? "Verified Barangay Lapasan Resident" : "Pending Verification Review"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleVerification(selectedResident.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedResident.isVerified
                        ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        : "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                    }`}
                  >
                    {selectedResident.isVerified ? "Revoke Verification" : "Mark as Verified"}
                  </button>
                </div>

                {/* Profile Information Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-2xl bg-[#FFF9F3]/60 border border-[#ECE7DF]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Sex / Gender</p>
                    <p className="font-bold text-[#0F172A] mt-0.5">{selectedResident.sex}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FFF9F3]/60 border border-[#ECE7DF]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Civil Status</p>
                    <p className="font-bold text-[#0F172A] mt-0.5">{selectedResident.civilStatus}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FFF9F3]/60 border border-[#ECE7DF]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Birthdate</p>
                    <p className="font-bold text-[#0F172A] mt-0.5">{selectedResident.birthdate}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FFF9F3]/60 border border-[#ECE7DF]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Purok Area</p>
                    <p className="font-bold text-[#0F172A] mt-0.5">{selectedResident.purok}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FFF9F3]/60 border border-[#ECE7DF] col-span-2">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Street Address</p>
                    <p className="font-bold text-[#0F172A] mt-0.5">{selectedResident.street}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FFF9F3]/60 border border-[#ECE7DF]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Mobile Phone</p>
                    <p className="font-bold text-[#0F172A] mt-0.5">{selectedResident.phone}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FFF9F3]/60 border border-[#ECE7DF] col-span-2">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Email Address</p>
                    <p className="font-bold text-[#0F172A] mt-0.5 truncate">{selectedResident.email}</p>
                  </div>
                </div>

                {/* Relevant Registration & Attendance History */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                    Registration & Attendance History
                  </h3>
                  <div className="border border-[#ECE7DF] rounded-2xl overflow-hidden text-xs">
                    {getRegistrationsForResident(selectedResident.id).length === 0 ? (
                      <p className="p-4 text-center text-[#64748B]">No previous program registrations recorded.</p>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-[#FFF9F3] border-b border-[#ECE7DF] text-[10px] font-extrabold text-[#64748B] uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Program Title</th>
                            <th className="py-2.5 px-3">Registration Status</th>
                            <th className="py-2.5 px-3">Attendance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ECE7DF]">
                          {getRegistrationsForResident(selectedResident.id).map((reg) => (
                            <tr key={reg.id}>
                              <td className="py-2.5 px-3 font-semibold text-[#0F172A]">
                                {reg.programTitle}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                  {reg.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-[#64748B]">
                                {reg.status === "Completed" ? (
                                  <span className="text-emerald-700 font-bold">Present (Attended)</span>
                                ) : (
                                  <span className="text-slate-500">Scheduled / Enrolled</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Security note */}
                <p className="text-[10px] text-[#94A3B8] italic text-center">
                  Access to resident personal information is strictly restricted to authorized barangay administrative personnel.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
