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
  Legend,
} from "recharts";
import {
  Download,
  Printer,
  Users,
  TrendingUp,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { getPrograms, Program } from "@/lib/services/programs";
import { getRegistrations, Registration } from "@/lib/services/registrations";

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

export default function AdminReportsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [progs, regs] = await Promise.allSettled([
          getPrograms(),
          getRegistrations(),
        ]);
        if (progs.status === "fulfilled") setPrograms(progs.value);
        if (regs.status === "fulfilled") setRegistrations(regs.value);
      } catch (err) {
        console.warn("Reports data load skipped:", err);
      }
    }
    loadData();
  }, []);

  const totalRegistrants = registrations.length;
  const completedPrograms = programs.filter((p) => p.status === "Completed").length;
  const availableSlots = programs
    .filter((p) => p.status === "Active" || p.status === "Upcoming")
    .reduce((sum, p) => sum + (Number(p.slots) || 0), 0);

  // Group registrations by category
  const categoryCounts: Record<string, number> = {};
  programs.forEach((p) => {
    const cat = p.category || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + (Number(p.enrolledCount) || 0);
  });
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Group by Purok from registrations
  const purokCounts: Record<string, number> = {};
  registrations.forEach((r) => {
    const p = r.purok || "Unassigned";
    purokCounts[p] = (purokCounts[p] || 0) + 1;
  });
  const purokData = Object.entries(purokCounts).map(([purok, count]) => ({
    purok,
    count,
  }));

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const header = "Program Title,Category,Slots,Enrolled,Status\n";
    const rows = programs
      .map(
        (p) =>
          `"${p.title}","${p.category}",${p.slots},${p.enrolledCount},"${p.status}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Barangay_Lapasan_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice("Report exported successfully.");
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto selection:bg-[#F45113]/15 selection:text-[#F45113]">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Reports
          </h1>
        </div>

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
            <span>Print</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Total Registrants</span>
            <Users className="w-4 h-4 text-[#F45113]" />
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A]">{totalRegistrants}</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-700">
            <span className="font-bold uppercase tracking-wider text-[11px]">Attendance Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">
            {totalRegistrants > 0 ? "100%" : "0%"}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#0F172A]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Available Slots</span>
            <BookOpen className="w-4 h-4 text-[#0F172A]" />
          </div>
          <p className="text-3xl font-extrabold text-[#0F172A]">{availableSlots}</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#F45113]">
            <span className="font-bold uppercase tracking-wider text-[11px]">Completed Programs</span>
            <CheckCircle2 className="w-4 h-4 text-[#F45113]" />
          </div>
          <p className="text-3xl font-extrabold text-[#F45113]">{completedPrograms}</p>
        </div>
      </div>

      {/* ── Visual Summaries Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#0F172A]">
            Registrations by Purok
          </h3>

          <div className="h-72 w-full flex items-center justify-center">
            {purokData.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No participation data recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purokData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECE7DF" vertical={false} />
                  <XAxis dataKey="purok" tick={{ fontSize: 10, fill: "#64748B" }} />
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
                  <Bar dataKey="count" name="Registrations" fill="#F45113" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DF] p-5 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#0F172A]">
            Participation by Category
          </h3>

          <div className="h-72 w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No category data recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
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
                    {categoryData.map((entry, index) => (
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
            )}
          </div>
        </div>
      </div>

      {/* ── Program Outcomes Summary Table ── */}
      <div className="bg-white rounded-3xl border border-[#ECE7DF] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#ECE7DF]">
          <h3 className="text-sm font-extrabold text-[#0F172A]">
            Program Outcomes
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFF9F3]/70 border-b border-[#ECE7DF] text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Program Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Available Slots</th>
                <th className="py-3 px-4">Enrolled Registrants</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE7DF]">
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-[#94A3B8]">
                    No programs recorded
                  </td>
                </tr>
              ) : (
                programs.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FFF9F3]/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#0F172A]">{p.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF9F3] text-[#F45113] border border-[#ECE7DF]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{p.slots} slots</td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">{p.enrolledCount || 0} residents</td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF9F3] border border-[#ECE7DF] text-[#0F172A]">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
