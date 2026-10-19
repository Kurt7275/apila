import type { Metadata } from "next";
import { demoResidentRegistrations } from "@/lib/mock-data/registrations";
import { RegistrationStatusBadge } from "@/components/shared/StatusBadges";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = { title: "My Registrations — Resident Portal" };

const statusIcon = {
  Approved: CheckCircle2,
  Pending: Clock,
  Completed: CheckCircle2,
  Rejected: XCircle,
  Cancelled: XCircle,
};

const statusColor = {
  Approved: "text-green-600",
  Pending: "text-yellow-600",
  Completed: "text-gray-500",
  Rejected: "text-red-500",
  Cancelled: "text-slate-500",
};

export default function MyRegistrationsPage() {
  const all = demoResidentRegistrations;
  const active = all.filter((r) => r.status === "Approved");
  const pending = all.filter((r) => r.status === "Pending");
  const completed = all.filter((r) => ["Completed", "Rejected", "Cancelled"].includes(r.status));

  const renderList = (list: typeof all) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-10">
          <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No registrations here.</p>
          <Button variant="ghost" size="sm" className="mt-2 text-primary" asChild>
            <Link href="/resident/programs">Browse Programs</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {list.map((reg) => {
          const Icon = statusIcon[reg.status];
          return (
            <Card key={reg.id} className="border-border/60">
              <CardContent className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`mt-0.5 ${statusColor[reg.status]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground leading-snug">
                      {reg.programTitle}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Registered:{" "}
                        {new Date(reg.registeredAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {reg.approvedAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved:{" "}
                          {new Date(reg.approvedAt).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    {reg.notes && (
                      <p className="text-xs text-red-500 mt-1">{reg.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <RegistrationStatusBadge status={reg.status} />
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" asChild>
                    <Link href={`/resident/programs/${reg.programId}`}>
                      View <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Registrations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track all programs you have registered for.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", value: active.length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending", value: pending.length, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Completed/Other", value: completed.length, color: "text-gray-500", bg: "bg-gray-50" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="completed">Other ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">{renderList(all)}</TabsContent>
        <TabsContent value="active" className="mt-4">{renderList(active)}</TabsContent>
        <TabsContent value="pending" className="mt-4">{renderList(pending)}</TabsContent>
        <TabsContent value="completed" className="mt-4">{renderList(completed)}</TabsContent>
      </Tabs>
    </div>
  );
}
