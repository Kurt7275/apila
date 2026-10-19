import type { Metadata } from "next";
import { mockResidents } from "@/lib/mock-data/residents";
import { mockRegistrations } from "@/lib/mock-data/registrations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, User, CheckCircle2, AlertCircle } from "lucide-react";

export const metadata: Metadata = { title: "Residents — Admin Portal" };

export default function AdminResidentsPage() {
  const residents = mockResidents;

  const getRegistrationCount = (residentId: string) =>
    mockRegistrations.filter((r) => r.residentId === residentId).length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Residents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage registered residents of Barangay Lapasan.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-6 flex-wrap">
        <div className="text-sm">
          <span className="font-bold text-lg text-foreground">{residents.length}</span>{" "}
          <span className="text-muted-foreground">Total Registered</span>
        </div>
        <div className="text-sm">
          <span className="font-bold text-lg text-green-600">
            {residents.filter((r) => r.isVerified).length}
          </span>{" "}
          <span className="text-muted-foreground">Verified</span>
        </div>
        <div className="text-sm">
          <span className="font-bold text-lg text-yellow-600">
            {residents.filter((r) => !r.isVerified).length}
          </span>{" "}
          <span className="text-muted-foreground">Pending Verification</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or purok..." className="pl-9" />
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Resident</TableHead>
                  <TableHead>Purok</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Programs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-apila-blue-light flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-apila-blue" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {resident.firstName} {resident.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {resident.sex} · {resident.civilStatus}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {resident.purok}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">{resident.email}</p>
                      <p className="text-xs text-muted-foreground">{resident.phone}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(resident.registeredAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {getRegistrationCount(resident.id)} program(s)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {resident.isVerified ? (
                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-yellow-600 text-xs font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
