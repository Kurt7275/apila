"use client";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  monthlyRegistrationStats,
  programRegistrationStats,
  categoryDistribution,
  mockRegistrations,
} from "@/lib/mock-data/registrations";
import { mockPrograms } from "@/lib/mock-data/programs";
import { RegistrationStatusBadge, CategoryBadge } from "@/components/shared/StatusBadges";

const kpiCards = [
  {
    label: "Total Residents",
    value: "1,248",
    delta: "+34 this month",
    icon: Users,
    color: "text-primary",
    bg: "bg-apila-blue-light",
  },
  {
    label: "Active Programs",
    value: "8",
    delta: "3 upcoming",
    icon: BookOpen,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "Total Registrations",
    value: "3,791",
    delta: "+62 this month",
    icon: ClipboardList,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Pending Approvals",
    value: "5",
    delta: "Needs action",
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const recentActivity = [
  {
    text: "Rosa Fernandez registered for Community Clean-Up Drive",
    time: "2 hours ago",
    type: "registration",
  },
  {
    text: "Carlos Mendoza approved for Basketball Tournament",
    time: "3 hours ago",
    type: "approval",
  },
  {
    text: "New program added: DRRM Training",
    time: "Yesterday",
    type: "program",
  },
  {
    text: "12 new residents registered this week",
    time: "Yesterday",
    type: "residents",
  },
  {
    text: "Nutrition Month Feeding Program marked as Completed",
    time: "2 days ago",
    type: "completed",
  },
];

export default function AdminDashboardPage() {
  const pendingRegistrations = mockRegistrations
    .filter((r) => r.status === "Pending")
    .slice(0, 5);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, Barangay Secretary. Here&apos;s an overview of APILA activity.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                <p className="text-xs text-green-600 mt-1 font-medium">{kpi.delta}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Per Program */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Registrations by Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={programRegistrationStats} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="program"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="count" fill="oklch(0.32 0.085 255)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Categories */}
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  strokeWidth={2}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {categoryDistribution.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart - Monthly */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Monthly Registration Trend (2026)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyRegistrationStats} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="oklch(0.32 0.085 255)"
                strokeWidth={2.5}
                dot={{ fill: "oklch(0.32 0.085 255)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Registrations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Pending Registrations</h2>
            <Button variant="ghost" size="sm" className="text-xs text-primary" asChild>
              <Link href="/admin/registrations">View All <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </div>
          <div className="space-y-2">
            {pendingRegistrations.map((reg) => (
              <Card key={reg.id} className="border-border/60">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground">{reg.residentName}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{reg.programTitle}</p>
                    <p className="text-xs text-muted-foreground">{reg.purok}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <RegistrationStatusBadge status={reg.status} />
                    <div className="flex gap-1">
                      <Button size="sm" className="h-6 text-xs bg-green-600 hover:bg-green-700 px-2">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 text-xs px-2 text-red-500 border-red-200">
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">Recent Activity</h2>
          <Card className="border-border/60">
            <CardContent className="p-4 divide-y divide-border">
              {recentActivity.map((item, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
