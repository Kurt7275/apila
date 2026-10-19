"use client";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { mockResidents } from "@/lib/mock-data/residents";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RegistrationStatusBadge } from "@/components/shared/StatusBadges";
import { Search, Download, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

export default function AdminRegistrationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [registrations, setRegistrations] = useState(mockRegistrations);

  const filtered = registrations.filter((r) => {
    const matchesSearch =
      !search ||
      r.residentName.toLowerCase().includes(search.toLowerCase()) ||
      r.programTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.purok.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approve = (id: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Approved" as const, approvedAt: new Date().toISOString() } : r
      )
    );
  };

  const reject = (id: string) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Rejected" as const } : r
      )
    );
  };

  const counts = {
    all: registrations.length,
    pending: registrations.filter((r) => r.status === "Pending").length,
    approved: registrations.filter((r) => r.status === "Approved").length,
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Registrations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and manage all resident program registrations.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Summary */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: "Total", value: counts.all, color: "text-foreground" },
          { label: "Pending", value: counts.pending, color: "text-yellow-600" },
          { label: "Approved", value: counts.approved, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="text-sm">
            <span className={`font-bold text-lg ${s.color}`}>{s.value}</span>{" "}
            <span className="text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, program, or purok..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "All")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["All", "Pending", "Approved", "Rejected", "Completed", "Cancelled"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Resident</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Purok</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium text-sm">{reg.residentName}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1 max-w-[180px]">
                        {reg.programTitle}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{reg.purok}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(reg.registeredAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <RegistrationStatusBadge status={reg.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {reg.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 gap-1"
                            onClick={() => approve(reg.id)}
                          >
                            <CheckCircle2 className="w-3 h-3" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-red-500 border-red-200 gap-1"
                            onClick={() => reject(reg.id)}
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No registrations found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
