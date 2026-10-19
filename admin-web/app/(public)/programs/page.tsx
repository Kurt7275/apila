"use client";
import { useState, useMemo } from "react";
import { mockPrograms } from "@/lib/mock-data/programs";
import ProgramCard from "@/components/shared/ProgramCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgramCategory, ProgramStatus } from "@/types";
import { Search, SlidersHorizontal, X } from "lucide-react";

const categories: ProgramCategory[] = [
  "Health",
  "Livelihood",
  "Youth",
  "Senior Citizens",
  "Sports",
  "Scholarship",
  "Environment",
  "Disaster Relief",
];

const statuses: ProgramStatus[] = ["Active", "Upcoming", "Completed"];

export default function PublicProgramsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ProgramStatus | null>(null);

  const filtered = useMemo(() => {
    return mockPrograms.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
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

  const hasFilters = search || selectedCategory || selectedStatus;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Page Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            Community Programs
          </h1>
          <p className="text-muted-foreground">
            Browse all available programs from Barangay Lapasan. Register for free as a
            resident to participate.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search programs by title, category, or description..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3 h-3" /> Category:
            </span>
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className="cursor-pointer select-none hover:border-primary transition-colors text-xs"
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
              >
                {cat}
              </Badge>
            ))}
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground mr-1">Status:</span>
            {statuses.map((status) => (
              <Badge
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                className="cursor-pointer select-none hover:border-primary transition-colors text-xs"
                onClick={() =>
                  setSelectedStatus(selectedStatus === status ? null : status)
                }
              >
                {status}
              </Badge>
            ))}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-foreground ml-2"
                onClick={clearFilters}
              >
                <X className="w-3 h-3 mr-1" /> Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing{" "}
          <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
          {mockPrograms.length} programs
        </p>

        {/* Programs Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((program) => (
              <ProgramCard key={program.id} program={program} linkPrefix="/programs" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No programs found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
            <Button variant="ghost" className="mt-4 text-sm" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
