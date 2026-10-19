"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { mockPrograms } from "@/lib/mock-data/programs";
import { demoResidentRegistrations } from "@/lib/mock-data/registrations";
import ProgramCard from "@/components/shared/ProgramCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgramCategory, ProgramStatus } from "@/types";
import { Search, X, SlidersHorizontal } from "lucide-react";

const categories: ProgramCategory[] = [
  "Health", "Livelihood", "Youth", "Senior Citizens",
  "Sports", "Scholarship", "Environment", "Disaster Relief",
];
const statuses: ProgramStatus[] = ["Active", "Upcoming", "Completed"];

export default function ResidentProgramsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ProgramStatus | null>(null);

  const registeredProgramIds = new Set(
    demoResidentRegistrations.map((r) => r.programId)
  );

  const filtered = useMemo(() => {
    return mockPrograms.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesStatus = !selectedStatus || p.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, selectedCategory, selectedStatus]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setSelectedStatus(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Browse Programs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Find and register for community programs available to Barangay Lapasan residents.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3 h-3" /> Category:
          </span>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer select-none hover:border-primary transition-colors text-xs"
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground mr-1">Status:</span>
          {statuses.map((status) => (
            <Badge
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              className="cursor-pointer select-none text-xs"
              onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
            >
              {status}
            </Badge>
          ))}
          {(search || selectedCategory || selectedStatus) && (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearFilters}>
              <X className="w-3 h-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{filtered.length}</span> programs
        {registeredProgramIds.size > 0 && (
          <span className="ml-2 text-primary">
            · You are registered in {registeredProgramIds.size} program(s)
          </span>
        )}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((program) => (
            <div key={program.id} className="relative">
              {registeredProgramIds.has(program.id) && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-green-600 text-white text-[10px]">Registered</Badge>
                </div>
              )}
              <ProgramCard
                program={program}
                linkPrefix="/resident/programs"
                showRegisterButton
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No programs found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
          <Button variant="ghost" className="mt-4 text-sm" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
