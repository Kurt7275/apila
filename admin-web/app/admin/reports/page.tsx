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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPrograms } from "@/lib/mock-data/programs";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { purkosList } from "@/lib/mock-data/residents";

const COLORS = [
  "#047857",
  "#0d9488",
  "#0284c7",
  "#6366f1",
  "#8b5cf6",
  "#d97706",
  "#e11d48",
  "#10b981",
];

// Mock analytics datasets
const purokDemographics = [
  { purok: "Purok 1", count: 185, approved: 160 },
  { purok: "Purok 2", count: 210, approved: 195 },
  { purok: "Purok 3", count: 140, approved: 125 },
  { purok: "Purok 4", count: 190, approved: 175 },
  { purok: "Purok 5", count: 320, approved: 290 },
  { purok: "Purok 6", count: 165, approved: 145 },
  { purok: "Purok 7", count: 175, approved: 155 },
  { purok: "Purok 8", count: 230, approved: 210 },
  { purok: "Purok 9", count: 115, approved: 100 },
  { purok: "Purok 10", count: 280, approved: 250 },
];

const categoryParticipation = [
  { name: "Health", value: 450 },
  { name: "Livelihood", value: 380 },
  { name: "Youth & Sports", value: 520 },
  { name: "Senior Citizens", value: 310 },
  { name: "Scholarship", value: 290 },
  { name: "Disaster Relief", value: 260 },
];

const monthlyTrend = [
  { month: "Jan", registrations: 120, programs: 3 },
  { month: "Feb", registrations: 180, programs: 4 },
  { month: "Mar", registrations: 240, programs: 5 },
  { month: "Apr", registrations: 310, programs: 6 },
  { month: "May", registrations: 290, programs: 5 },
  { month: "Jun", registrations: 420, programs: 8 },
  { month: "Jul", registrations: 380, programs: 7 },
  { month: "Aug", registrations: 490, programs: 9 },
  { month: "Sep", registrations: 530, programs: 10 },
];

export default function AdminReportsPage() {
  const [yearFilter, setYearFilter] = useState("2026");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Analytics & Community Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Barangay Lapasan program participation demographics and performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="h-9 px-3 border border-slate-200 rounded-md bg-white text-xs font-semibold text-slate-700"
          >
            <option value="2026">Year 2026 (YTD)</option>
            <option value="2025">Year 2025</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs border-slate-300"
          >
            <Printer className="w-4 h-4" /> Print Summary Report
          </Button>

          <Button
            size="sm"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ purokDemographics, categoryParticipation, monthlyTrend }, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `apila_analytics_report_${yearFilter}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV/JSON
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Program Participants</p>
              <p className="text-xl font-extrabold text-slate-900">2,960</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">↑ +18% from last quarter</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Approval & Fulfillment</p>
              <p className="text-xl font-extrabold text-slate-900">92.4%</p>
              <p className="text-[11px] text-blue-600 font-semibold mt-0.5">2,735 Verified Seats</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-amber-100 text-amber-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Highest Engaged Purok</p>
              <p className="text-xl font-extrabold text-slate-900">Purok 5</p>
              <p className="text-[11px] text-amber-700 font-semibold mt-0.5">320 Registrations</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Programs Completed</p>
              <p className="text-xl font-extrabold text-slate-900">24 Programs</p>
              <p className="text-[11px] text-purple-600 font-semibold mt-0.5">6 Active / 4 Upcoming</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Purok Distribution Bar Chart */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">
              Program Registrations by Purok (Demographics)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purokDemographics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="purok" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Total Registrations" fill="#047857" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="Approved Residents" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Share Pie Chart */}
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">
              Participation Share by Program Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryParticipation}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {categoryParticipation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Growth Line Chart */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-900">
            Monthly Participation Growth & Program Rollout Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="registrations"
                name="Monthly Registrations"
                stroke="#047857"
                strokeWidth={3}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="programs"
                name="Programs Launched"
                stroke="#d97706"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
