"use client";
import { useState } from "react";
import { mockPrograms } from "@/lib/mock-data/programs";
import { Program } from "@/types";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryBadge, StatusBadge, SlotProgress } from "@/components/shared/StatusBadges";
import { Plus, Search, Pencil, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState(mockPrograms);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = programs.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Programs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all community programs for Barangay Lapasan.
          </p>
        </div>
        <Button className="bg-apila-blue gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Program
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search programs..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Summary stats */}
      <div className="flex gap-4 flex-wrap">
        {["Active", "Upcoming", "Completed"].map((status) => (
          <div key={status} className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {programs.filter((p) => p.status === status).length}
            </span>{" "}
            {status}
          </div>
        ))}
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[280px]">Program</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Officer</TableHead>
                  <TableHead>Slots</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-foreground leading-snug line-clamp-1">
                          {program.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {program.location}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CategoryBadge category={program.category} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={program.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {program.officer}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-28">
                        <SlotProgress
                          enrolled={program.enrolled}
                          total={program.slots}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                          <Link href={`/admin/programs/${program.id}`}>
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2">
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Program Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Program Title</Label>
              <Input placeholder="e.g. Free Medical Checkup" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {["Health", "Livelihood", "Youth", "Senior Citizens", "Sports", "Scholarship", "Environment", "Disaster Relief"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Total Slots</Label>
                <Input type="number" placeholder="e.g. 100" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Program description..." className="resize-none" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Schedule</Label>
              <Input placeholder="e.g. Every Saturday, 8:00 AM – 12:00 PM" />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input placeholder="e.g. Barangay Multi-Purpose Hall" />
            </div>
            <div className="space-y-1.5">
              <Label>Program Officer</Label>
              <Input placeholder="e.g. Dr. Maria Santos" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-apila-blue" onClick={() => setAddOpen(false)}>
              Save Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
