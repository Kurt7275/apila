"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Printer,
  Users,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  CalendarCheck,
  Building,
  UserCheck,
  FileSpreadsheet,
  Clock,
  Wifi,
  Filter,
} from "lucide-react";
import { subscribeToPrograms, Program } from "@/lib/services/programs";
import { subscribeToRegistrations, Registration } from "@/lib/services/registrations";
import { subscribeToAttendance, AttendanceRecord } from "@/lib/services/attendance";
import { subscribeToResidents, Resident } from "@/lib/services/residents";
import { useAdminProfile } from "@/lib/context/AdminProfileContext";

const CATEGORY_COLORS = [
  "#F45113", // APILA Orange
  "#0F172A", // Navy
  "#0284C7", // Sky
  "#10B981", // Emerald
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#64748B", // Slate
];

export default function AdminReportsPage() {
  const { profile } = useAdminProfile();
  const officerName = profile?.name || "Barangay Lapasan Admin";

  const [programs, setPrograms] = useState<Program[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filter state for reports table
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  useEffect(() => {
    const unsubProgs = subscribeToPrograms((list) => setPrograms(list));
    const unsubRegs = subscribeToRegistrations((list) => setRegistrations(list));
    const unsubAtt = subscribeToAttendance((list) => setAttendance(list));
    const unsubRes = subscribeToResidents((list) => {
      setResidents(list);
      setIsLive(true);
    });

    return () => {
      unsubProgs();
      unsubRegs();
      unsubAtt();
      unsubRes();
    };
  }, []);

  // Summary Metrics
  const totalPrograms = programs.length;
  const activePrograms = programs.filter((p) => p.status === "Active").length;
  const completedPrograms = programs.filter((p) => p.status === "Completed").length;

  const totalSlots = programs.reduce((sum, p) => sum + (Number(p.slots) || 0), 0);
  const totalEnrolled = programs.reduce((sum, p) => sum + (Number(p.enrolledCount) || 0), 0);
  const enrollmentCapacityRate = totalSlots > 0 ? Math.round((totalEnrolled / totalSlots) * 100) : 0;

  const totalRegistrations = registrations.length;
  const approvedRegistrations = registrations.filter((r) => r.status === "Approved").length;
  const pendingRegistrations = registrations.filter((r) => r.status === "Pending").length;
  const rejectedRegistrations = registrations.filter((r) => r.status === "Rejected").length;

  const presentAttendance = attendance.filter((a) => a.status === "Present").length;
  const attendanceTurnoutRate =
    approvedRegistrations > 0
      ? Math.min(100, Math.round((presentAttendance / approvedRegistrations) * 100))
      : 0;

  const totalResidents = residents.length;
  const verifiedResidents = residents.filter((r) => r.isVerified).length;
  const verificationRate =
    totalResidents > 0 ? Math.round((verifiedResidents / totalResidents) * 100) : 0;

  // Chart: Purok Distribution (All 10 Lapasan Puroks)
  const purokList = Array.from({ length: 10 }, (_, i) => `Purok ${i + 1}`);
  const purokCounts: Record<string, number> = {};
  purokList.forEach((p) => (purokCounts[p] = 0));

  registrations.forEach((r) => {
    const p = r.purok?.trim();
    if (p && purokCounts[p] !== undefined) {
      purokCounts[p] += 1;
    } else if (p) {
      purokCounts[p] = (purokCounts[p] || 0) + 1;
    }
  });

  const purokChartData = Object.entries(purokCounts).map(([purok, count]) => ({
    purok: purok.replace("Purok ", "P-"),
    fullName: purok,
    count,
  }));

  // Chart: Category Breakdown
  const categoryCounts: Record<string, number> = {};
  programs.forEach((p) => {
    const cat = p.category || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + (Number(p.enrolledCount) || 0);
  });
  const categoryChartData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Filtered Programs for table
  const filteredPrograms = programs.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesCat = categoryFilter === "ALL" || p.category === categoryFilter;
    return matchesStatus && matchesCat;
  });

  // Export functions
  const downloadCSV = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportProgramsCSV = () => {
    const header = "Program Title,Category,Slots,Enrolled,Fill Rate %,Officer,Schedule,Location,Status\n";
    const rows = programs
      .map((p) => {
        const fill = p.slots > 0 ? Math.round(((p.enrolledCount || 0) / p.slots) * 100) : 0;
        return `"${p.title.replace(/"/g, '""')}","${p.category || ""}",${p.slots || 0},${
          p.enrolledCount || 0
        },${fill}%,"${(p.officer || "").replace(/"/g, '""')}","${(p.schedule || "").replace(
          /"/g,
          '""'
        )}","${(p.location || "").replace(/"/g, '""')}","${p.status || ""}"`;
      })
      .join("\n");

    downloadCSV(
      `Barangay_Lapasan_Programs_${new Date().toISOString().slice(0, 10)}.csv`,
      header + rows
    );
    setExportNotice("Programs report exported to CSV successfully.");
    setTimeout(() => setExportNotice(null), 4000);
  };

  const exportRegistrationsCSV = () => {
    const header = "Resident Name,Program Title,Purok,Phone,Status,Registered Date\n";
    const rows = registrations
      .map((r) => {
        const dateStr = r.registeredAt?.seconds
          ? new Date(r.registeredAt.seconds * 1000).toLocaleString()
          : "N/A";
        return `"${(r.residentName || "").replace(/"/g, '""')}","${(
          r.programTitle || ""
        ).replace(/"/g, '""')}","${r.purok || ""}","${r.phone || ""}","${
          r.status || ""
        }","${dateStr}"`;
      })
      .join("\n");

    downloadCSV(
      `Barangay_Lapasan_Registrations_${new Date().toISOString().slice(0, 10)}.csv`,
      header + rows
    );
    setExportNotice("Master Registrations List exported to CSV successfully.");
    setTimeout(() => setExportNotice(null), 4000);
  };

  const exportAttendanceCSV = () => {
    const header = "Program ID,Resident Name,Status,Marked At\n";
    const rows = attendance
      .map((a) => {
        const markedStr = a.markedAt?.seconds
          ? new Date(a.markedAt.seconds * 1000).toLocaleString()
          : "N/A";
        return `"${a.programId || ""}","${(a.residentName || "").replace(/"/g, '""')}","${
          a.status || ""
        }","${markedStr}"`;
      })
      .join("\n");

    downloadCSV(
      `Barangay_Lapasan_Attendance_${new Date().toISOString().slice(0, 10)}.csv`,
      header + rows
    );
    setExportNotice("Attendance log exported to CSV successfully.");
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const categories = Array.from(new Set(programs.map((p) => p.category).filter(Boolean)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      {/* Official Government Print Header (Hidden on screen, visible on print) */}
      <div className="hidden print:block text-center border-b-2 border-[#0F172A] pb-4 mb-6">
        <p className="text-xs uppercase tracking-widest text-[#64748B] font-bold">
          Republic of the Philippines · City of Cagayan de Oro
        </p>
        <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-wider mt-1">
          Barangay Lapasan Administrative Office
        </h2>
        <p className="text-sm font-semibold text-[#F45113]">
          APILA Barangay Management & Resident Engagement System
        </p>
        <p className="text-xs text-[#64748B] mt-2">
          Official Executive Analytics & Operational Report · Generated on{" "}
          {new Date().toLocaleDateString("en-PH", {
            dateStyle: "full",
          })}{" "}
          by {officerName}
        </p>
      </div>

      {/* Screen Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Reports & Analytics
            </h1>
            {isLive && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wide">
                <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" /> LIVE
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Real-time civic intelligence, program outcomes, and official export records for Barangay Lapasan
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group">
            <button
              onClick={exportProgramsCSV}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#ECE7DF] hover:border-[#F45113]/50 text-xs font-bold text-[#0F172A] rounded-2xl shadow-sm transition-all cursor-pointer"
              title="Export all programs summary to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#F45113]" />
              <span>Programs CSV</span>
            </button>
          </div>

          <button
            onClick={exportRegistrationsCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#ECE7DF] hover:border-[#F45113]/50 text-xs font-bold text-[#0F172A] rounded-2xl shadow-sm transition-all cursor-pointer"
            title="Export master registrations list to CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Registrations CSV</span>
          </button>

          <button
            onClick={exportAttendanceCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#ECE7DF] hover:border-[#F45113]/50 text-xs font-bold text-[#0F172A] rounded-2xl shadow-sm transition-all cursor-pointer"
            title="Export full attendance records to CSV"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Attendance CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] hover:bg-black text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer ml-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Programs */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Total Programs
            </span>
            <div className="p-2 rounded-xl bg-orange-50 text-[#F45113]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-[#0F172A]">{totalPrograms}</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              {activePrograms} active · {completedPrograms} completed
            </p>
          </div>
        </div>

        {/* Card 2: Slot Fill Rate */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Slot Utilization
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-[#0F172A]">{enrollmentCapacityRate}%</p>
            <p className="text-[11px] font-semibold text-[#64748B] mt-0.5">
              {totalEnrolled} / {totalSlots} total capacity
            </p>
          </div>
        </div>

        {/* Card 3: Attendance Turnout */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Attendance Turnout
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-[#0F172A]">{attendanceTurnoutRate}%</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              {presentAttendance} verified check-ins
            </p>
          </div>
        </div>

        {/* Card 4: Resident Verification */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              Resident Population
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-[#0F172A]">{totalResidents}</p>
            <p className="text-[11px] font-semibold text-purple-600 mt-0.5">
              {verifiedResidents} verified ({verificationRate}%)
            </p>
          </div>
        </div>
      </div>

      {/* Registration Funnel Bar */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              Registration Pipeline Health
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Real-time breakdown of all resident applications across Barangay Lapasan programs
            </p>
          </div>
          <span className="text-xs font-bold text-[#0F172A] bg-[#FFF9F3] border border-[#ECE7DF] px-3 py-1 rounded-full">
            {totalRegistrations} Total Submissions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60">
            <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
              Pending Review
            </p>
            <p className="text-xl font-black text-amber-900 mt-0.5">{pendingRegistrations}</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              {totalRegistrations > 0
                ? Math.round((pendingRegistrations / totalRegistrations) * 100)
                : 0}
              % backlog
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/60">
            <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
              Approved / Active
            </p>
            <p className="text-xl font-black text-emerald-900 mt-0.5">{approvedRegistrations}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              {totalRegistrations > 0
                ? Math.round((approvedRegistrations / totalRegistrations) * 100)
                : 0}
              % approval rate
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/60">
            <p className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider">
              Rejected / Closed
            </p>
            <p className="text-xl font-black text-rose-900 mt-0.5">{rejectedRegistrations}</p>
            <p className="text-[11px] text-rose-700 mt-0.5">
              {totalRegistrations > 0
                ? Math.round((rejectedRegistrations / totalRegistrations) * 100)
                : 0}
              % rejection rate
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts (Print & Screen Responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purok Participation Distribution */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Citizen Participation by Purok
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Distribution across Puroks 1 through 10
              </p>
            </div>
            <Building className="w-4 h-4 text-[#F45113]" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purokChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE7DF" vertical={false} />
                <XAxis dataKey="purok" tick={{ fontSize: 10, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0F172A] text-white px-3 py-2 rounded-xl text-xs shadow-lg">
                          <p className="font-bold">{data.fullName}</p>
                          <p className="text-[#FB923C] font-semibold">{data.count} Registrations</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" name="Registrations" fill="#F45113" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Participation Breakdown */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Participation by Category
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Civic interest by municipal category
              </p>
            </div>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {categoryChartData.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No category data recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""}: ${(Number(percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="bg-[#0F172A] text-white px-3 py-2 rounded-xl text-xs shadow-lg">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-[#FB923C] font-semibold">{data.value} Enrolled</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Program Outcomes Table & Filter Controls */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#ECE7DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              Program Operational Outcomes
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Showing {filteredPrograms.length} of {programs.length} total barangay programs
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-semibold text-[#0F172A] outline-none focus:border-[#F45113]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFF9F3]/70 border-b border-[#ECE7DF] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Program Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Available Slots</th>
                <th className="py-3 px-4">Enrolled Registrants</th>
                <th className="py-3 px-4">Capacity Utilization</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DF]">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-[#94A3B8]">
                    No programs match the selected filters
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((p) => {
                  const fillPct =
                    p.slots > 0
                      ? Math.min(100, Math.round(((p.enrolledCount || 0) / p.slots) * 100))
                      : 0;
                  return (
                    <tr key={p.id} className="hover:bg-[#FFF9F3]/40 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#0F172A]">
                        <div>
                          <span>{p.title}</span>
                          {p.officer && (
                            <span className="block text-[10px] text-[#94A3B8] font-normal">
                              Officer: {p.officer}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF9F3] text-[#F45113] border border-[#ECE7DF]">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#0F172A]">
                        {p.slots} slots
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                        {p.enrolledCount || 0} residents
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-[#ECE7DF] overflow-hidden max-w-[100px]">
                            <div
                              className={`h-full rounded-full ${
                                fillPct >= 100
                                  ? "bg-rose-500"
                                  : fillPct >= 80
                                  ? "bg-amber-500"
                                  : "bg-[#F45113]"
                              }`}
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-[#64748B]">
                            {fillPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            p.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : p.status === "Completed"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : p.status === "Cancelled"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-[#FFF9F3] text-[#64748B] border-[#ECE7DF]"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Signatures Section for Printed Copies */}
      <div className="hidden print:grid grid-cols-2 gap-12 pt-12 border-t-2 border-[#0F172A] mt-8 text-center text-xs">
        <div>
          <p className="font-bold text-[#0F172A] underline uppercase tracking-wide">
            {officerName}
          </p>
          <p className="text-[#64748B] text-[11px] mt-1">Prepared by / Reporting Officer</p>
          <p className="text-[10px] text-[#94A3B8]">Barangay Lapasan Administrative Staff</p>
        </div>

        <div>
          <p className="font-bold text-[#0F172A] underline uppercase tracking-wide">
            HON. JULITO D. FLORES
          </p>
          <p className="text-[#64748B] text-[11px] mt-1">Punong Barangay / Lapasan Captain</p>
          <p className="text-[10px] text-[#94A3B8]">Attested & Approved for Official Records</p>
        </div>
      </div>
    </div>
  );
}
