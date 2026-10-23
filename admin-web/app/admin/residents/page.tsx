"use client";

import { useState, useEffect } from "react";
import { mockResidents } from "@/lib/mock-data/residents";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { Resident } from "@/types";
import { getResidents, toggleResidentVerification } from "@/lib/services/residents";
import { getRegistrations } from "@/lib/services/registrations";
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
} from "lucide-react";

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [liveRegistrations, setLiveRegistrations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [purokFilter, setPurokFilter] = useState("ALL");
  const [verificationFilter, setVerificationFilter] = useState<"ALL" | "VERIFIED" | "PENDING">("ALL");

  // Selected Resident Modal
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  useEffect(() => {
    async function fetchLiveResidents() {
      try {
        const live = await getResidents();
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
            sex: ((r.gender === "Male" ? "Male" : "Female") as Resident["sex"]),
            civilStatus: (r.civilStatus as Resident["civilStatus"]) || "Single",
            isVerified: r.isVerified ?? false,
            registeredAt: r.createdAt ? new Date(r.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
          };
        });
        setResidents(mapped);
      } catch (err) {
        console.warn("Using offline residents cache:", err);
      }
    }
    async function fetchLiveRegistrations() {
      try {
        const live = await getRegistrations();
        if (live && live.length > 0) {
          setLiveRegistrations(live);
        }
      } catch (err) {
        console.warn("Using offline registrations cache:", err);
      }
    }
    fetchLiveResidents();
    fetchLiveRegistrations();
  }, []);

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
      await toggleResidentVerification(id, newStatus);
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

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B]">
                      {r.householdId}
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
                      <button
                        onClick={() => setSelectedResident(r)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FFF9F3] hover:bg-[#F45113] text-[#0F172A] hover:text-white border border-[#ECE7DF] hover:border-[#F45113] transition-all cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Resident Profile & History Modal (Module 6 Requirement) ── */}
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
                    Household ID: <span className="font-mono">{selectedResident.householdId}</span> · Resident ID: <span className="font-mono">{selectedResident.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResident(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
}
