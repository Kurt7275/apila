"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Download,
  Printer,
  Calendar,
  Users,
  TrendingUp,
  Award,
  CheckCircle2,
  Filter,
  FileText,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { mockPrograms } from "@/lib/mock-data/programs";
import { mockRegistrations } from "@/lib/mock-data/registrations";

const COLORS = [
  "#F45113",
  "#0F172A",
  "#FB923C",
  "#059669",
  "#6366F1",
  "#D97706",
  "#E11D48",
  "#10B981",
];

// Demographic participation by Purok
const purokDemographics = [
  { purok: "Purok 1", count: 185, attended: 160 },
  { purok: "Purok 2", count: 210, attended: 195 },
  { purok: "Purok 3", count: 140, attended: 125 },
  { purok: "Purok 4", count: 190, attended: 175 },
  { purok: "Purok 5", count: 320, attended: 290 },
  { purok: "Purok 6", count: 165, attended: 145 },
  { purok: "Purok 7", count: 175, attended: 155 },
  { purok: "Purok 8", count: 230, attended: 210 },
  { purok: "Purok 9", count: 115, attended: 100 },
  { purok: "Purok 10", count: 280, attended: 250 },
];

const categoryDistribution = [
  { name: "Health", value: 450 },
  { name: "Livelihood", value: 380 },
  { name: "Youth & Sports", value: 520 },
  { name: "Senior Citizens", value: 310 },
  { name: "Scholarship", value: 290 },
  { name: "Disaster Relief", value: 260 },
];

export default function AdminReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("2026-Q3");
  const [selectedProgram, setSelectedProgram] = useState("ALL");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const header = "Purok,Total Registrations,Attended Residents,Attendance Rate\n";
    const rows = purokDemographics
      .map(
        (p) =>
          `"${p.purok}",${p.count},${p.attended},"${Math.round((p.attended / p.count) * 100)}%"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Barangay_Lapasan_Report_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice("Participation report exported to CSV successfully.");
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F45113]/10 text-[#F45113] uppercase tracking-wider">
              Module 07
            </span>
            <span className="text-xs text-[#64748B] font-semibold">
              Civic Planning & Administrative Documentation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Summaries of program registrations, attendance, and resident participation across Barangay Lapasan.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#ECE7DF] hover:border-[#F45113]/50 text-xs font-bold text-[#0F172A] rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#F45113]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] hover:bg-black text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ── Filter Bar: Selected Period & Individual Program (Module 7 Requirement) ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Reporting Period
            </label>
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none px-4 py-2 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-bold text-[#0F172A] outline-none pr-8 cursor-pointer"
              >
                <option value="2026-Q3">Year 2026 — Quarter 3 (Current)</option>
                <option value="2026-Q2">Year 2026 — Quarter 2</option>
                <option value="2026-Q1">Year 2026 — Quarter 1</option>
                <option value="2025-ANNUAL">Year 2025 — Full Year Review</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Individual Program Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
              Filter by Program
            </label>
            <div className="relative">
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="appearance-none px-4 py-2 rounded-2xl border border-[#ECE7DF] bg-[#FFF9F3] text-xs font-bold text-[#0F172A] outline-none pr-8 cursor-pointer"
              >
                <option value="ALL">All Barangay Programs</option>
                {mockPrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <span className="text-xs text-[#64748B] self-end sm:self-auto font-mono text-[11px]">
          Generated on {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {/* ── KPI Summary Cards (The exact 4 metrics from Module 7) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Number of Registrants */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Number of Registrants</span>
            <Users className="w-4 h-4 text-[#F45113]" />
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A]">2,960</p>
          <p className="text-[11px] text-[#64748B]">Total verified applications</p>
        </div>

        {/* 2. Attendance Rates */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-700">
            <span className="font-bold uppercase tracking-wider text-[11px]">Overall Attendance Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">86.4%</p>
          <p className="text-[11px] text-[#64748B]">2,558 verified attendees</p>
        </div>

        {/* 3. Available Program Slots */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#0F172A]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Available Slots</span>
            <BookOpen className="w-4 h-4 text-[#0F172A]" />
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A]">420</p>
          <p className="text-[11px] text-[#64748B]">Open capacity for residents</p>
        </div>

        {/* 4. Completed Activities */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#F45113]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Completed Activities</span>
            <CheckCircle2 className="w-4 h-4 text-[#F45113]" />
          </div>
          <p className="text-3xl font-extrabold text-[#F45113]">24</p>
          <p className="text-[11px] text-[#64748B]">Documented community events</p>
        </div>
      </div>

      {/* ── Visual Summaries Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Demographics by Purok */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              Resident Participation by Purok
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Comparison between program registrations and verified attendance per Purok.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purokDemographics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECE7DF" vertical={false} />
                <XAxis dataKey="purok" tick={{ fontSize: 10, fill: "#64748B" }} interval={0} angle={-30} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderRadius: "12px",
                    color: "white",
                    border: "none",
                    fontSize: "11px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="count" name="Registrations" fill="#F45113" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attended" name="Attended" fill="#0F172A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              Participation by Civic Sector
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Distribution of community members across municipal program categories.
            </p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={50}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""}: ${(Number(percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderRadius: "12px",
                    color: "white",
                    border: "none",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Program Outcomes Summary Table ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#ECE7DF] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A]">
              Program Outcomes Summary Roster
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Auditable records for barangay administrative documentation and community planning.
            </p>
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
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-5 text-right">Outcome Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DF]">
              {mockPrograms.map((p) => {
                const rate = p.status === "Completed" ? 92 : p.status === "Active" ? 84 : 0;
                return (
                  <tr key={p.id} className="hover:bg-[#FFF9F3]/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#0F172A]">{p.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF9F3] text-[#F45113] border border-[#ECE7DF]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{p.slots} slots</td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">{p.enrolled} residents</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {rate > 0 ? `${rate}% verified` : "In Progress"}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF9F3] border border-[#ECE7DF] text-[#0F172A]">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
